import express from "express";

import {
  register,
  login,
  logout,
  refresh,
  getCurrentUser,
  updateProfile,
  getDepartments
} from "../controllers/authController";

import {
  verifyToken
} from "../middleware/authMiddleware";

const router = express.Router();

/*
POST /auth/register
*/
router.post(
  "/register",
  register
);

/*
POST /auth/login
*/
router.post(
  "/login",
  login
);

/*
POST /auth/refresh
*/
router.post(
  "/refresh",
  refresh
);

/*
POST /auth/logout
*/
router.post(
  "/logout",
  logout
);

/*
GET /auth/me
*/
router.get(
  "/me",
  verifyToken,
  getCurrentUser
);

/*
PUT /auth/profile
*/
router.put(
  "/profile",
  verifyToken,
  updateProfile
);

router.get(
  "/departments",
  getDepartments
);

export default router;
