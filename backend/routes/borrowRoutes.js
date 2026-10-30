import express from "express";
import {
  createBorrowRequest,
  getOwnerBorrowRequests,
  getBorrowerBorrowRequests,
  getBorrowingHistory,
  approveBorrowRequest,
  rejectBorrowRequest,
  returnBorrowedResource
} from "../controllers/borrowController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// CREATE BORROW REQUEST
// ==========================================

router.post(
  "/request",
  authMiddleware,
  createBorrowRequest
);

// ==========================================
// GET OWNER BORROW REQUESTS
// ==========================================

router.get(
  "/owner",
  authMiddleware,
  getOwnerBorrowRequests
);

// ==========================================
// GET BORROWER REQUESTS
// ==========================================

router.get(
  "/borrower",
  authMiddleware,
  getBorrowerBorrowRequests
);

// ==========================================
// GET BORROWER REQUESTS - ALTERNATIVE
// ==========================================

router.get(
  "/my-requests",
  authMiddleware,
  getBorrowerBorrowRequests
);

// ==========================================
// GET BORROWING HISTORY
// ==========================================

router.get(
  "/history",
  authMiddleware,
  getBorrowingHistory
);

// ==========================================
// APPROVE BORROW REQUEST
// ==========================================

router.put(
  "/:id/approve",
  authMiddleware,
  approveBorrowRequest
);

// ==========================================
// REJECT BORROW REQUEST
// ==========================================

router.put(
  "/:id/reject",
  authMiddleware,
  rejectBorrowRequest
);

// ==========================================
// RETURN BORROWED RESOURCE
// ==========================================

router.put(
  "/:id/return",
  authMiddleware,
  returnBorrowedResource
);

router.put(
  "/return/:id",
  authMiddleware,
  returnBorrowedResource
);

export default router;