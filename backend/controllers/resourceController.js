import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Resource from "../models/Resource.js";
import Wishlist from "../models/Wishlist.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

// Helper to safely delete an uploaded file
const deleteFile = (imagePath) => {
  if (!imagePath) return;
  try {
    const filename = path.basename(imagePath);
    const fullPath = path.join(uploadDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Error deleting file:", err.message);
  }
};

// ==========================================
// CREATE RESOURCE
// ==========================================
export const createResource = async (req, res) => {
  try {
    const {
      resourceName,
      category,
      description,
      condition,
      location,
      price,
    } = req.body;

    // Validate required fields
    if (
      !resourceName?.trim() ||
      !category ||
      !description?.trim() ||
      !condition ||
      !location?.trim() ||
      price === undefined ||
      price === ""
    ) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    // Validate price
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(400).json({
        message: "Enter a valid price greater than or equal to zero.",
      });
    }

    // Ensure image uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a resource image.",
      });
    }

    // Ensure logged-in user
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(401).json({
        message: "Please log in to add a resource.",
      });
    }

    const resource = new Resource({
      resourceName: resourceName.trim(),
      category,
      description: description.trim(),
      condition,
      location: location.trim(),
      price: numericPrice,
      image: `/uploads/${req.file.filename}`,
      ownerId: userId,
      availability: "Available",
    });

    await resource.save();

    return res.status(201).json({
      message: "Resource added successfully!",
      resource,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    console.error("Create Resource Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to add resource.",
    });
  }
};

// ==========================================
// GET ALL RESOURCES (BROWSE WITH SEARCH)
// ==========================================
export const getResources = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== "") {
      const term = search.trim();
      query.$or = [
        { resourceName: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ];
    }

    const resources = await Resource.find(query)
      .populate("ownerId", "fullName email profileImage mobile community location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      resources,
    });
  } catch (error) {
    console.error("Get Resources Error:", error);
    return res.status(500).json({
      message: "Failed to fetch resources.",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY RESOURCES
// ==========================================
export const getMyResources = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const resources = await Resource.find({
      $or: [{ ownerId: userId }, { owner: userId }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      resources,
    });
  } catch (error) {
    console.error("Get My Resources Error:", error);
    return res.status(500).json({
      message: "Failed to fetch your resources.",
      error: error.message,
    });
  }
};

// ==========================================
// GET RESOURCE BY ID
// ==========================================
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "ownerId",
      "fullName email profileImage mobile community location"
    );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found.",
      });
    }

    return res.status(200).json({
      resource,
    });
  } catch (error) {
    console.error("Get Resource By Id Error:", error);
    return res.status(500).json({
      message: "Failed to fetch resource details.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE RESOURCE
// ==========================================
export const updateResource = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(404).json({
        message: "Resource not found.",
      });
    }

    const ownerId = resource.ownerId?._id || resource.ownerId || resource.owner?._id || resource.owner;
    if (ownerId && ownerId.toString() !== userId.toString()) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(403).json({
        message: "You are not authorized to update this resource.",
      });
    }

    const status = resource.availability || resource.status;
    if (status === "Borrowed") {
      if (req.file) deleteFile(req.file.filename);
      return res.status(400).json({
        message: "This resource is currently borrowed and cannot be edited.",
      });
    }

    const {
      resourceName,
      category,
      price,
      description,
      condition,
      location,
    } = req.body;

    if (resourceName !== undefined) resource.resourceName = resourceName.trim();
    if (category !== undefined) resource.category = category;
    if (description !== undefined) resource.description = description.trim();
    if (condition !== undefined) resource.condition = condition;
    if (location !== undefined) resource.location = location.trim();

    if (price !== undefined && price !== "") {
      const numPrice = Number(price);
      if (!Number.isFinite(numPrice) || numPrice < 0) {
        if (req.file) deleteFile(req.file.filename);
        return res.status(400).json({
          message: "Price per day must be a valid non-negative number.",
        });
      }
      resource.price = numPrice;
    }

    if (req.file) {
      deleteFile(resource.image);
      resource.image = `/uploads/${req.file.filename}`;
    }

    await resource.save();

    return res.status(200).json({
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    console.error("Update Resource Error:", error);
    return res.status(500).json({
      message: "Failed to update resource.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE RESOURCE
// ==========================================
export const deleteResource = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found.",
      });
    }

    const ownerId = resource.ownerId?._id || resource.ownerId || resource.owner?._id || resource.owner;
    if (ownerId && ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this resource.",
      });
    }

    const status = resource.availability || resource.status;
    if (status === "Borrowed") {
      return res.status(400).json({
        message: "This resource is currently borrowed and cannot be deleted.",
      });
    }

    // Clean up uploaded image
    deleteFile(resource.image);

    // Clean up any wishlists containing this resource
    await Wishlist.deleteMany({ resourceId: resource._id });

    // Delete the resource
    await Resource.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    return res.status(500).json({
      message: "Failed to delete resource.",
      error: error.message,
    });
  }
};