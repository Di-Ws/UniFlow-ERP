import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export const generateAccessToken = (userId: number, role: string) => {
  return jwt.sign({ id: userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = async (userId: number) => {
  const token = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  
  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });
  
  return token;
};

export const registerUser = async (data: any) => {
  const { name, email: rawEmail, password, role } = data;
  const email = String(rawEmail).toLowerCase();

  // Criteria Validation
  if (!name || name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters long");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error("Please provide a valid email address");
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    throw new Error("Password must be at least 8 characters long and contain both letters and numbers");
  }

  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Normalize role to match Prisma Enum (HOD, FACULTY, STUDENT)
  let normalizedRole: any = "FACULTY";
  if (role) {
    const upperRole = String(role).toUpperCase();
    if (["HOD", "FACULTY", "STUDENT"].includes(upperRole)) {
      normalizedRole = upperRole;
    }
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      status: (normalizedRole === "STUDENT" || normalizedRole === "FACULTY") ? "PENDING" : "APPROVED",
      registrationMetadata: data.registrationMetadata || null
    }
  });

  return user;
};

export const loginUser = async (data: any) => {
  const { email: rawEmail, password } = data;
  const email = String(rawEmail).toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new Error("Wrong password");
  }

  if (user.status === 'PENDING') {
    throw new Error("Your account is awaiting HOD approval");
  }

  if (user.status === 'REJECTED') {
    throw new Error("Your registration request was rejected");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken, user };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Check if token exists in DB and is not expired
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      }
      throw new Error("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new Error("User not found");

    // Rotate refresh token (optional but recommended for security)
    // For now, just issue a new access token
    const newAccessToken = generateAccessToken(user.id, user.role);
    
    return { accessToken: newAccessToken, user };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const revokeRefreshToken = async (token: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token }
  });
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id }
  });
};
export const updateUser = async (userId: number, updateData: any) => {
  const { name, email, password } = updateData;
  const data: any = {};

  if (name) {
    if (name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    data.name = name;
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address");
    }
    
    const userExists = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: userId }
      }
    });

    if (userExists) {
      throw new Error("User with this email already exists");
    }
    data.email = email;
  }

  if (password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error("Password must be at least 8 characters long and contain both letters and numbers");
    }
    data.password = await bcrypt.hash(password, 10);
  }

  return await prisma.user.update({
    where: { id: userId },
    data
  });
};
