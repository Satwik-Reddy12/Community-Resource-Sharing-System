import BorrowRequest from "../models/BorrowRequest.js";
import Resource from "../models/Resource.js";
import Notification from "../models/Notification.js";

// ==========================================
// CREATE BORROW REQUEST
// ==========================================
export const createBorrowRequest = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const borrowerId = req.user.id;

    if (!resourceId) {
      return res.status(400).json({
        message: "Resource ID is required",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    const ownerId = resource.owner?._id || resource.owner || resource.ownerId;

    if (ownerId && ownerId.toString() === borrowerId.toString()) {
      return res.status(400).json({
        message: "You cannot borrow your own resource",
      });
    }

    const currentStatus = resource.status || resource.availability;
    if (currentStatus !== "Available") {
      return res.status(400).json({
        message: "This resource is currently borrowed",
      });
    }

    const existingRequest = await BorrowRequest.findOne({
      resourceId: resource._id,
      borrowerId: borrowerId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this resource",
      });
    }

    const borrowRequest = new BorrowRequest({
      resourceId: resource._id,
      borrowerId: borrowerId,
      ownerId: ownerId,
      status: "Pending",
    });

    await borrowRequest.save();

    await Notification.create({
      userId: ownerId,
      type: "BorrowRequest",
      message: `A user requested to borrow your ${resource.resourceName}.`,
      resourceId: resource._id,
      borrowRequestId: borrowRequest._id,
    });

    return res.status(201).json({
      message: "Borrow request sent successfully. Waiting for owner approval.",
      request: borrowRequest,
    });
  } catch (error) {
    console.error("Create Borrow Request Error:", error);

    return res.status(500).json({
      message: "Failed to create borrow request",
      error: error.message,
    });
  }
};

// ==========================================
// GET OWNER BORROW REQUESTS
// ==========================================
export const getOwnerBorrowRequests = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const requests = await BorrowRequest.find({
      ownerId: ownerId,
    })
      .populate("resourceId")
      .populate("borrowerId", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests: requests,
    });
  } catch (error) {
    console.error("Get Owner Borrow Requests Error:", error);

    return res.status(500).json({
      message: "Failed to fetch borrow requests",
      error: error.message,
    });
  }
};

// ==========================================
// GET BORROWER REQUESTS
// ==========================================
export const getBorrowerBorrowRequests = async (req, res) => {
  try {
    const borrowerId = req.user.id;

    const requests = await BorrowRequest.find({
      borrowerId: borrowerId,
    })
      .populate("resourceId")
      .populate("ownerId", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests: requests,
    });
  } catch (error) {
    console.error("Get Borrower Requests Error:", error);

    return res.status(500).json({
      message: "Failed to fetch your borrowings",
      error: error.message,
    });
  }
};

// ==========================================
// APPROVE BORROW REQUEST
// ==========================================
export const approveBorrowRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const requestId = req.params.id;

    const borrowRequest = await BorrowRequest.findById(requestId);

    if (!borrowRequest) {
      return res.status(404).json({
        message: "Borrow request not found",
      });
    }

    if (borrowRequest.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        message: "You are not the owner of this resource",
      });
    }

    if (borrowRequest.status !== "Pending") {
      return res.status(400).json({
        message: "This request has already been processed",
      });
    }

    const resource = await Resource.findById(
      borrowRequest.resourceId
    );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    if ((resource.status || resource.availability) !== "Available") {
      return res.status(400).json({
        message: "Resource is no longer available",
      });
    }

    borrowRequest.status = "Approved";
    borrowRequest.approvedDate = new Date();

    await borrowRequest.save();

    await Notification.create({
      userId: borrowRequest.borrowerId,
      type: "RequestApproved",
      message: `Your request for ${resource.resourceName} has been approved.`,
      resourceId: resource._id,
      borrowRequestId: borrowRequest._id,
    });

    resource.status = "Borrowed";
    resource.availability = "Borrowed";

    await resource.save();

    return res.status(200).json({
      message: "Borrow request approved successfully",
      request: borrowRequest,
    });
  } catch (error) {
    console.error("Approve Borrow Request Error:", error);

    return res.status(500).json({
      message: "Failed to approve borrow request",
      error: error.message,
    });
  }
};

// ==========================================
// REJECT BORROW REQUEST
// ==========================================
export const rejectBorrowRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const requestId = req.params.id;

    const borrowRequest = await BorrowRequest.findById(requestId);

    if (!borrowRequest) {
      return res.status(404).json({
        message: "Borrow request not found",
      });
    }

    if (borrowRequest.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        message: "You are not the owner of this resource",
      });
    }

    if (borrowRequest.status !== "Pending") {
      return res.status(400).json({
        message: "This request has already been processed",
      });
    }

    const resource = await Resource.findById(
      borrowRequest.resourceId
    );

    borrowRequest.status = "Rejected";

    await borrowRequest.save();

    await Notification.create({
      userId: borrowRequest.borrowerId,
      type: "RequestRejected",
      message: `Your request for ${
        resource?.resourceName || "the resource"
      } has been rejected.`,
      resourceId: borrowRequest.resourceId,
      borrowRequestId: borrowRequest._id,
    });

    return res.status(200).json({
      message: "Borrow request rejected successfully",
      request: borrowRequest,
    });
  } catch (error) {
    console.error("Reject Borrow Request Error:", error);

    return res.status(500).json({
      message: "Failed to reject borrow request",
      error: error.message,
    });
  }
};

// ==========================================
// RETURN BORROWED RESOURCE
// ==========================================
export const returnBorrowedResource = async (req, res) => {
  try {
    const borrowerId = req.user.id;
    const requestId = req.params.id;

    const borrowRequest = await BorrowRequest.findById(requestId);

    if (!borrowRequest) {
      return res.status(404).json({
        message: "Borrow request not found",
      });
    }

    if (
      borrowRequest.borrowerId.toString() !==
      borrowerId.toString()
    ) {
      return res.status(403).json({
        message: "You are not the borrower of this resource",
      });
    }

    if (borrowRequest.status !== "Approved") {
      return res.status(400).json({
        message: "Only approved borrowings can be returned",
      });
    }

    const resource = await Resource.findById(
      borrowRequest.resourceId
    );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    borrowRequest.status = "Returned";
    borrowRequest.returnedDate = new Date();

    await borrowRequest.save();

    await Notification.create({
      userId: borrowRequest.ownerId,
      type: "ResourceReturned",
      message: `${resource.resourceName} has been returned.`,
      resourceId: resource._id,
      borrowRequestId: borrowRequest._id,
    });

    resource.status = "Available";
    resource.availability = "Available";

    await resource.save();

    return res.status(200).json({
      message: "Resource returned successfully",
      request: borrowRequest,
    });
  } catch (error) {
    console.error("Return Resource Error:", error);

    return res.status(500).json({
      message: "Failed to return resource",
      error: error.message,
    });
  }
};
// ==========================================
// GET BORROWING HISTORY
// ==========================================
export const getBorrowingHistory = async (req, res) => {
  try {
    const borrowerId = req.user.id;

    const history = await BorrowRequest.find({
      borrowerId: borrowerId,
      status: "Returned"
    })
      .populate("resourceId")
      .populate("ownerId", "fullName email")
      .sort({ returnedDate: -1 });

    return res.status(200).json({
      history: history
    });
  } catch (error) {
    console.error("Get Borrowing History Error:", error);

    return res.status(500).json({
      message: "Failed to fetch borrowing history",
      error: error.message
    });
  }
};