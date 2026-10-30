import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      userId
    })
      .populate("resourceId", "resourceName image")
      .sort({
        createdAt: -1
      });

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification =
      await Notification.findOne({
        _id: notificationId,
        userId
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error(
      "Mark Notification Read Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update notification",
      error: error.message
    });
  }
};

export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      {
        userId,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error(
      "Mark All Notifications Read Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update notifications",
      error: error.message
    });
  }
};