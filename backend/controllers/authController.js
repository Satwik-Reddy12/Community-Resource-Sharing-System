import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================================
// REGISTER USER
// ==========================================

export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      community,
      password
    } = req.body;

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const mobileExists = await User.findOne({ mobile });

    if (mobileExists) {
      return res.status(400).json({
        message: "Mobile number already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = new User({
      fullName,
      email,
      mobile,
      community,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "User Registered Successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        community: user.community,
        location: user.location,
        profileImage: user.profileImage,
        trustScore: user.trustScore,
        communityPoints: user.communityPoints,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ==========================================
// FORGOT PASSWORD / RESET PASSWORD
// ==========================================

export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      mobile,
      newPassword
    } = req.body;

    if (!email || !mobile || !newPassword) {
      return res.status(400).json({
        message: "Email, mobile number and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findOne({
      email,
      mobile
    });

    if (!user) {
      return res.status(404).json({
        message: "Email and mobile number do not match"
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    res.status(500).json({
      message: "Failed to reset password",
      error: error.message
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error(
      "Get Profile Error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullName,
      email,
      mobile,
      location
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: userId }
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already registered"
        });
      }

      user.email = email;
    }

    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({
        mobile,
        _id: { $ne: userId }
      });

      if (mobileExists) {
        return res.status(400).json({
          message: "Mobile number already registered"
        });
      }

      user.mobile = mobile;
    }

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (location !== undefined) {
      user.location = location.trim();
    }

    if (req.file) {
      user.profileImage =
        `/uploads/${req.file.filename}`;
    }

    await user.save();

    const updatedUser =
      await User.findById(userId).select(
        "-password"
      );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error
    );

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as current password"
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      message: "Failed to change password",
      error: error.message
    });
  }
};