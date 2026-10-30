import User from "../models/User.js";
import Resource from "../models/Resource.js";
import BorrowRequest from "../models/BorrowRequest.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "fullName trustScore communityPoints"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const myResources = await Resource.countDocuments({
      $or: [{ owner: userId }, { ownerId: userId }]
    });

    const borrowedItems =
      await BorrowRequest.countDocuments({
        borrowerId: userId,
        status: "Approved"
      });

    const pendingRequests =
      await BorrowRequest.countDocuments({
        ownerId: userId,
        status: "Pending"
      });

    const totalResources =
      await Resource.countDocuments();

    const successfulBorrowings =
      await BorrowRequest.countDocuments({
        borrowerId: userId,
        status: "Returned"
      });

    const activeMembers =
      await User.countDocuments();

    const activeBorrowings =
      await BorrowRequest.find({
        borrowerId: userId,
        status: "Approved"
      })
        .populate("resourceId")
        .sort({
          approvedDate: -1
        });

    return res.status(200).json({
      stats: {
        myResources,
        borrowedItems,
        pendingRequests,
        trustScore: user.trustScore,
        communityPoints: user.communityPoints,
        totalResources,
        successfulBorrowings,
        activeMembers
      },
      activeBorrowings
    });
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};