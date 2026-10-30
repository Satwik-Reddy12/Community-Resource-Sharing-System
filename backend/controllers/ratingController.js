import Rating from "../models/Rating.js";
import BorrowRequest from "../models/BorrowRequest.js";
import User from "../models/User.js";

// ==========================================
// CREATE RATING
// ==========================================

export const createRating = async (req, res) => {
  try {
    const fromUser = req.user.id;
    const { borrowRequestId, rating, comment } = req.body;

    if (!borrowRequestId) {
      return res.status(400).json({
        message: "Borrow request ID is required"
      });
    }

    if (!rating) {
      return res.status(400).json({
        message: "Rating is required"
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // ==========================================
    // FIND BORROW REQUEST
    // ==========================================

    const borrowRequest =
      await BorrowRequest.findById(
        borrowRequestId
      );

    if (!borrowRequest) {
      return res.status(404).json({
        message: "Borrow request not found"
      });
    }

    // ==========================================
    // ONLY RETURNED BORROWINGS CAN BE RATED
    // ==========================================

    if (borrowRequest.status !== "Returned") {
      return res.status(400).json({
        message:
          "You can rate a user only after the resource is returned"
      });
    }

    // ==========================================
    // CHECK USER PARTICIPATION
    // ==========================================

    const isBorrower =
      borrowRequest.borrowerId.toString() ===
      fromUser.toString();

    const isOwner =
      borrowRequest.ownerId.toString() ===
      fromUser.toString();

    if (!isBorrower && !isOwner) {
      return res.status(403).json({
        message:
          "You are not part of this borrowing"
      });
    }

    // ==========================================
    // DETERMINE RECEIVER
    // ==========================================

    const toUser = isBorrower
      ? borrowRequest.ownerId
      : borrowRequest.borrowerId;

    // ==========================================
    // CHECK EXISTING RATING
    // ==========================================

    const existingRating =
      await Rating.findOne({
        fromUser,
        borrowRequest: borrowRequestId
      });

    if (existingRating) {
      return res.status(400).json({
        message:
          "You have already rated this borrowing"
      });
    }

    // ==========================================
    // CREATE RATING
    // ==========================================

    const newRating = new Rating({
      fromUser,
      toUser,
      borrowRequest: borrowRequestId,
      rating: numericRating,
      comment: comment
        ? comment.trim()
        : ""
    });

    await newRating.save();

    // ==========================================
    // CALCULATE NEW TRUST SCORE
    // ==========================================

    const receivedRatings =
      await Rating.find({
        toUser
      });

    const totalRatings =
      receivedRatings.length;

    const totalScore =
      receivedRatings.reduce(
        (sum, item) =>
          sum + item.rating,
        0
      );

    const trustScore =
      totalRatings > 0
        ? Number(
            (
              totalScore /
              totalRatings
            ).toFixed(1)
          )
        : 0;

    // ==========================================
    // UPDATE USER
    // ==========================================

    const user =
      await User.findById(toUser);

    if (user) {
      user.trustScore = trustScore;

      user.communityPoints =
        Math.max(
          0,
          user.communityPoints || 0
        ) + 10;

      await user.save();
    }

    return res.status(201).json({
      message:
        "Rating submitted successfully",
      rating: newRating,
      trustScore,
      totalRatings
    });
  } catch (error) {
    console.error(
      "Create Rating Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to submit rating",
      error: error.message
    });
  }
};

// ==========================================
// GET RATINGS RECEIVED BY USER
// ==========================================

export const getMyRatings = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const ratings =
      await Rating.find({
        toUser: userId
      })
        .populate(
          "fromUser",
          "fullName profileImage"
        )
        .populate(
          "borrowRequest"
        )
        .sort({
          createdAt: -1
        });

    const totalRatings =
      ratings.length;

    const totalScore =
      ratings.reduce(
        (sum, item) =>
          sum + item.rating,
        0
      );

    const averageRating =
      totalRatings > 0
        ? Number(
            (
              totalScore /
              totalRatings
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      ratings,
      totalRatings,
      averageRating
    });
  } catch (error) {
    console.error(
      "Get Ratings Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch ratings",
      error: error.message
    });
  }
};

// ==========================================
// CHECK IF USER CAN RATE BORROWING
// ==========================================

export const checkRatingStatus = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const borrowRequestId =
      req.params.borrowRequestId;

    const borrowRequest =
      await BorrowRequest.findById(
        borrowRequestId
      );

    if (!borrowRequest) {
      return res.status(404).json({
        message:
          "Borrow request not found"
      });
    }

    const isParticipant =
      borrowRequest.borrowerId.toString() ===
        userId.toString() ||
      borrowRequest.ownerId.toString() ===
        userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message:
          "You are not part of this borrowing"
      });
    }

    const existingRating =
      await Rating.findOne({
        fromUser: userId,
        borrowRequest:
          borrowRequestId
      });

    return res.status(200).json({
      canRate:
        borrowRequest.status ===
          "Returned" &&
        !existingRating,
      alreadyRated: !!existingRating,
      status: borrowRequest.status
    });
  } catch (error) {
    console.error(
      "Check Rating Status Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to check rating status",
      error: error.message
    });
  }
};