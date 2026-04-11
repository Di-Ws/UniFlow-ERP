import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secret123";

export const registerUser = async (data: any) => {
  const { name, email: rawEmail, password } = data;
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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
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

  const token = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token, user };
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
