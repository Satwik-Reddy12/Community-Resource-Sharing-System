import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistStatus
} from "../controllers/wishlistController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// GET USER WISHLIST
// ==========================================

router.get(
  "/",
  authMiddleware,
  getWishlist
);

// ==========================================
// ADD RESOURCE
// ==========================================

router.post(
  "/:resourceId",
  authMiddleware,
  addToWishlist
);

// ==========================================
// CHECK WISHLIST STATUS
// ==========================================

router.get(
  "/check/:resourceId",
  authMiddleware,
  checkWishlistStatus
);

// ==========================================
// REMOVE RESOURCE
// ==========================================

router.delete(
  "/:resourceId",
  authMiddleware,
  removeFromWishlist
);

export default router;