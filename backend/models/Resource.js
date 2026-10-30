import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      alias: "owner",
    },

    availability: {
      type: String,
      enum: ["Available", "Borrowed", "Unavailable"],
      default: "Available",
      alias: "status",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

resourceSchema.virtual("owner").get(function () {
  return this.ownerId;
}).set(function (val) {
  this.ownerId = val;
});

resourceSchema.virtual("status").get(function () {
  return this.availability;
}).set(function (val) {
  this.availability = val;
});

export default mongoose.model("Resource", resourceSchema);