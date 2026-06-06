"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.revokeRefreshToken = exports.refreshAccessToken = exports.loginUser = exports.registerUser = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const generateAccessToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ id: userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (userId) => {
    const token = jsonwebtoken_1.default.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    // Store refresh token in DB
    await db_1.prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    });
    return token;
};
exports.generateRefreshToken = generateRefreshToken;
const registerUser = async (data) => {
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
    const userExists = await db_1.prisma.user.findUnique({
        where: { email }
    });
    if (userExists) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Normalize role to match Prisma Enum (HOD, FACULTY, STUDENT)
    let normalizedRole = "FACULTY";
    if (role) {
        const upperRole = String(role).toUpperCase();
        if (["HOD", "FACULTY", "STUDENT"].includes(upperRole)) {
            normalizedRole = upperRole;
        }
    }
    if (normalizedRole === "HOD") {
        const deptId = data.registrationMetadata?.departmentId;
        if (!deptId) {
            throw new Error("HOD must select a department to manage");
        }
        const existingDept = await db_1.prisma.department.findUnique({
            where: { id: Number(deptId) }
        });
        if (!existingDept) {
            throw new Error("Selected department does not exist");
        }
        const user = await db_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: normalizedRole,
                status: "APPROVED",
                registrationMetadata: data.registrationMetadata || null
            }
        });
        // Update department to assign this HOD
        await db_1.prisma.department.update({
            where: { id: Number(deptId) },
            data: { hodId: user.id }
        });
        return await db_1.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                managedDept: {
                    select: { id: true, name: true }
                }
            }
        });
    }
    const user = await db_1.prisma.user.create({
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
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email: rawEmail, password } = data;
    const email = String(rawEmail).toLowerCase();
    const user = await db_1.prisma.user.findUnique({
        where: { email },
        include: {
            managedDept: {
                select: { id: true, name: true }
            }
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid) {
        throw new Error("Wrong password");
    }
    if (user.status === 'PENDING') {
        throw new Error("Your account is awaiting HOD approval");
    }
    if (user.status === 'REJECTED') {
        throw new Error("Your registration request was rejected");
    }
    const accessToken = (0, exports.generateAccessToken)(user.id, user.role);
    const refreshToken = await (0, exports.generateRefreshToken)(user.id);
    return { accessToken, refreshToken, user };
};
exports.loginUser = loginUser;
const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
        // Check if token exists in DB and is not expired
        const tokenRecord = await db_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            if (tokenRecord) {
                await db_1.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
            }
            throw new Error("Invalid or expired refresh token");
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                managedDept: {
                    select: { id: true, name: true }
                }
            }
        });
        if (!user)
            throw new Error("User not found");
        // Rotate refresh token (optional but recommended for security)
        // For now, just issue a new access token
        const newAccessToken = (0, exports.generateAccessToken)(user.id, user.role);
        return { accessToken: newAccessToken, user };
    }
    catch (error) {
        throw new Error("Invalid refresh token");
    }
};
exports.refreshAccessToken = refreshAccessToken;
const revokeRefreshToken = async (token) => {
    await db_1.prisma.refreshToken.deleteMany({
        where: { token }
    });
};
exports.revokeRefreshToken = revokeRefreshToken;
const getUserById = async (id) => {
    return await db_1.prisma.user.findUnique({
        where: { id },
        include: {
            managedDept: {
                select: { id: true, name: true }
            }
        }
    });
};
exports.getUserById = getUserById;
const updateUser = async (userId, updateData) => {
    const { name, email, password } = updateData;
    const data = {};
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
        const userExists = await db_1.prisma.user.findFirst({
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
        data.password = await bcryptjs_1.default.hash(password, 10);
    }
    return await db_1.prisma.user.update({
        where: { id: userId },
        data,
        include: {
            managedDept: {
                select: { id: true, name: true }
            }
        }
    });
};
exports.updateUser = updateUser;
