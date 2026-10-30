import express from "express";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getAvailableUsers
} from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// ALL MESSAGE ROUTES ARE AUTH-PROTECTED
// ==========================================

router.get("/conversations", authMiddleware, getConversations);
router.post("/conversations", authMiddleware, getOrCreateConversation);
router.get("/users", authMiddleware, getAvailableUsers);
router.get("/:conversationId", authMiddleware, getMessages);
router.post("/:conversationId", authMiddleware, sendMessage);
router.put("/:conversationId/read", authMiddleware, markAsRead);

export default router;
