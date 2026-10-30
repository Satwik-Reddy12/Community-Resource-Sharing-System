import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createResource,
  getResources,
  getMyResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";

const router = express.Router();

// ==========================================
// RESOURCE ROUTES
// ==========================================

// Public browse / search
router.get("/", getResources);

// Current user's resources
router.get("/my", authMiddleware, getMyResources);

// Specific resource details
router.get("/:id", getResourceById);

// Create resource with image upload
router.post("/", authMiddleware, upload.single("image"), createResource);

// Update resource
router.put("/:id", authMiddleware, upload.single("image"), updateResource);

// Delete resource
router.delete("/:id", authMiddleware, deleteResource);

export default router;
