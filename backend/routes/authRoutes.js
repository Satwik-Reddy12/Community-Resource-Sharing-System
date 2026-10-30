import express from "express";
import {
  registerUser,
  loginUser,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ==========================================
// AUTH
// ==========================================

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/reset-password",
  resetPassword
);

// ==========================================
// PROFILE
// ==========================================

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;