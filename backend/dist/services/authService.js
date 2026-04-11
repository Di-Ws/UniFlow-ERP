"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "secret123";
const registerUser = async (data) => {
    const { name, email, password } = data;
    // Criteria Validation
    if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters long");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new Error("Please provide a valid email address");
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
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
    const user = await db_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    const user = await db_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid) {
        throw new Error("Wrong password");
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    return { token, user };
};
exports.loginUser = loginUser;
const getUserById = async (id) => {
    return await db_1.prisma.user.findUnique({
        where: { id }
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
        data
    });
};
exports.updateUser = updateUser;
