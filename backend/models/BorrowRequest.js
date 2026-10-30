import mongoose from "mongoose";

const borrowRequestSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },

    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Returned"],
      default: "Pending",
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    approvedDate: {
      type: Date,
      default: null,
    },

    returnedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "BorrowRequest",
  borrowRequestSchema
);