import express from "express";

import {
  createRating,
  getMyRatings,
  checkRatingStatus
} from "../controllers/ratingController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// SUBMIT RATING
// ==========================================

router.post(
  "/",
  authMiddleware,
  createRating
);

// ==========================================
// GET MY RECEIVED RATINGS
// ==========================================

router.get(
  "/my",
  authMiddleware,
  getMyRatings
);

// ==========================================
// CHECK RATING STATUS
// ==========================================

router.get(
  "/check/:borrowRequestId",
  authMiddleware,
  checkRatingStatus
);

export default router;