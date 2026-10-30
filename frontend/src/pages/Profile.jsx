import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaStar,
  FaBoxOpen,
  FaHandshake,
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    location: ""
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchProfile = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const profileUser =
        response.data.user;

      setUser(profileUser);

      setFormData({
        fullName:
          profileUser.fullName || "",
        email:
          profileUser.email || "",
        mobile:
          profileUser.mobile || "",
        location:
          profileUser.location || ""
      });

      if (profileUser.profileImage) {
        setPreviewImage(
          `http://localhost:5000${profileUser.profileImage}`
        );
      }

      setError("");
    } catch (error) {
      console.error(
        "Fetch Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });
  };

  const handleImageChange = (event) => {
    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);

    const imageUrl =
      URL.createObjectURL(file);

    setPreviewImage(imageUrl);
  };

  const handleEdit = () => {
    setEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setSelectedImage(null);

    if (user?.profileImage) {
      setPreviewImage(
        `http://localhost:5000${user.profileImage}`
      );
    } else {
      setPreviewImage("");
    }

    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      location: user?.location || ""
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const data = new FormData();

      data.append(
        "fullName",
        formData.fullName
      );

      data.append(
        "email",
        formData.email
      );

      data.append(
        "mobile",
        formData.mobile
      );

      data.append(
        "location",
        formData.location
      );

      if (selectedImage) {
        data.append(
          "profileImage",
          selectedImage
        );
      }

      const response =
        await axios.put(
          "http://localhost:5000/api/auth/profile",
          data,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const updatedUser =
        response.data.user;

      setUser(updatedUser);

      setFormData({
        fullName:
          updatedUser.fullName || "",
        email:
          updatedUser.email || "",
        mobile:
          updatedUser.mobile || "",
        location:
          updatedUser.location || ""
      });

      if (updatedUser.profileImage) {
        setPreviewImage(
          `http://localhost:5000${updatedUser.profileImage}`
        );
      } else {
        setPreviewImage("");
      }

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setSelectedImage(null);
      setEditing(false);

      alert(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Update Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password cannot be the same as current password.");
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPasswordSuccess(response.data.message || "Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      console.error("Change Password Error:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to change password. Please verify current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          Unable to load profile.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ================= HEADER ================= */}

        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>
              Manage your account information.
            </p>
          </div>

          <button
            type="button"
            className="profile-dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {/* ================= PROFILE CARD ================= */}

        <div className="profile-card">
          {!editing ? (
            <>
              <div className="profile-top">
                <div className="profile-image-wrapper">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <FaUserCircle className="default-profile-icon" />
                  )}
                </div>

                <div className="profile-main-info">
                  <h2>
                    {user.fullName}
                  </h2>

                  <p>
                    {user.email}
                  </p>

                  {user.location && (
                    <p>
                      📍 {user.location}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="edit-profile-btn"
                  onClick={handleEdit}
                >
                  <FaEdit />
                  Edit Profile
                </button>
              </div>

              <div className="profile-section">
                <h2>
                  Personal Information
                </h2>

                <div className="profile-info-grid">
                  <div>
                    <span>
                      Full Name
                    </span>
                    <strong>
                      {user.fullName}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {user.email}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Phone Number
                    </span>
                    <strong>
                      {user.mobile}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Location
                    </span>
                    <strong>
                      {user.location ||
                        "Not added"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h2>
                  ⭐ Trust & Reputation
                </h2>

                <div className="reputation-grid">
                  <div className="reputation-card">
                    <FaStar />
                    <strong>
                      {user.trustScore || 0}
                    </strong>
                    <span>
                      Trust Score
                    </span>
                  </div>

                  <div className="reputation-card">
                    <FaBoxOpen />
                    <strong>
                      {user.communityPoints ||
                        0}
                    </strong>
                    <span>
                      Community Points
                    </span>
                  </div>

                  <div className="reputation-card">
                    <FaHandshake />
                    <strong>
                      Member
                    </strong>
                    <span>
                      Community User
                    </span>
                  </div>

                  <div className="reputation-card">
                    <FaCheckCircle />
                    <strong>
                      Active
                    </strong>
                    <span>
                      Account Status
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h2>
                  Account
                </h2>

                <div className="account-info">
                  <div>
                    <span>
                      Member Since
                    </span>

                    <strong>
                      {formatDate(
                        user.createdAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Account Status
                    </span>

                    <strong className="active-status">
                      Active
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="change-password-btn"
                  onClick={() => {
                    setShowPasswordModal(true);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                >
                  <FaLock />
                  Change Password
                </button>
              </div>
            </>
          ) : (
            /* ================= EDIT PROFILE ================= */

            <form
              className="edit-profile-form"
              onSubmit={handleSave}
            >
              <h2>
                Edit Profile
              </h2>

              <div className="edit-image-section">
                <div className="edit-image-wrapper">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="profile-image"
                    />
                  ) : (
                    <FaUserCircle className="default-profile-icon" />
                  )}
                </div>

                <div>
                  <h3>
                    Profile Image
                  </h3>

                  <button
                    type="button"
                    className="choose-image-btn"
                    onClick={() =>
                      fileInputRef.current.click()
                    }
                  >
                    Choose New Image
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={
                      handleImageChange
                    }
                    hidden
                  />

                  <p>
                    JPG, PNG, JPEG or WEBP.
                    Maximum 5 MB.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="profile-input">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="profile-input">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="profile-input">
                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="mobile"
                    value={
                      formData.mobile
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="profile-input">
                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              <div className="edit-buttons">
                <button
                  type="button"
                  className="cancel-profile-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ================= CHANGE PASSWORD MODAL ================= */}
        {showPasswordModal && (
          <div className="password-modal-overlay">
            <div className="password-modal-card">
              <div className="password-modal-header">
                <h2>
                  <FaLock /> Change Password
                </h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {passwordSuccess && (
                <div className="password-alert success">
                  <FaCheckCircle /> {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="password-alert error">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="password-form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pwd-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="password-form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter new password (min. 6 characters)"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pwd-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="password-form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pwd-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="password-modal-actions">
                  <button
                    type="button"
                    className="cancel-pwd-btn"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="submit-pwd-btn"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;