import Wishlist from "../models/Wishlist.js";
import Resource from "../models/Resource.js";

// ==========================================
// ADD RESOURCE TO WISHLIST
// ==========================================

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    const resource = await Resource.findById(
      resourceId
    );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    const existingWishlist =
      await Wishlist.findOne({
        userId,
        resourceId
      });

    if (existingWishlist) {
      return res.status(400).json({
        message: "Resource is already in your wishlist"
      });
    }

    const wishlist = new Wishlist({
      userId,
      resourceId
    });

    await wishlist.save();

    return res.status(201).json({
      message: "Resource added to wishlist",
      wishlist
    });
  } catch (error) {
    console.error(
      "Add Wishlist Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to add resource to wishlist",
      error: error.message
    });
  }
};

// ==========================================
// GET USER WISHLIST
// ==========================================

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.find({
      userId
    })
      .populate("resourceId")
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      wishlist
    });
  } catch (error) {
    console.error(
      "Get Wishlist Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message
    });
  }
};

// ==========================================
// REMOVE RESOURCE FROM WISHLIST
// ==========================================

export const removeFromWishlist = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    const wishlist =
      await Wishlist.findOneAndDelete({
        userId,
        resourceId
      });

    if (!wishlist) {
      return res.status(404).json({
        message: "Resource is not in your wishlist"
      });
    }

    return res.status(200).json({
      message: "Resource removed from wishlist"
    });
  } catch (error) {
    console.error(
      "Remove Wishlist Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to remove resource from wishlist",
      error: error.message
    });
  }
};

// ==========================================
// CHECK RESOURCE WISHLIST STATUS
// ==========================================

export const checkWishlistStatus = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    const wishlist =
      await Wishlist.findOne({
        userId,
        resourceId
      });

    return res.status(200).json({
      wishlisted: !!wishlist
    });
  } catch (error) {
    console.error(
      "Check Wishlist Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to check wishlist status",
      error: error.message
    });
  }
};