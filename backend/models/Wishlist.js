import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true
    }
  },
  {
    timestamps: true
  }
);

wishlistSchema.index(
  {
    userId: 1,
    resourceId: 1
  },
  {
    unique: true
  }
);

export default mongoose.model(
  "Wishlist",
  wishlistSchema
);