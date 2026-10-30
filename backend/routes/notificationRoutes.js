import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getNotifications
);

router.put(
  "/read/:id",
  authMiddleware,
  markNotificationAsRead
);

router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

export default router;