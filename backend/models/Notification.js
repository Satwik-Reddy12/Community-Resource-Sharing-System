import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: [
        "BorrowRequest",
        "RequestApproved",
        "RequestRejected",
        "ResourceReturned"
      ],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null
    },
    borrowRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Notification",
  notificationSchema
);