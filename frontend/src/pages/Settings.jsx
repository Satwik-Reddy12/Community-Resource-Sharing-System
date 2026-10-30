import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCog,
  FaArrowLeft,
  FaUserShield,
  FaBell,
  FaSignOutAlt,
  FaKey,
  FaInfoCircle
} from "react-icons/fa";
import "../styles/Settings.css";

function Settings() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* ================= HEADER ================= */}
        <div className="settings-header">
          <div>
            <h1>
              <FaCog /> Settings & Preferences
            </h1>
            <p>Manage your account settings, security, and app preferences</p>
          </div>

          <button
            type="button"
            className="settings-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        <div className="settings-grid">
          {/* ================= ACCOUNT SUMMARY ================= */}
          <div className="settings-card">
            <div className="card-header">
              <h2>
                <FaUserShield /> Account Summary
              </h2>
            </div>
            <div className="card-body">
              <div className="setting-item">
                <div>
                  <strong>User Name</strong>
                  <p>{currentUser?.fullName || "Community User"}</p>
                </div>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Registered Email</strong>
                  <p>{currentUser?.email || "Not specified"}</p>
                </div>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Community</strong>
                  <p>{currentUser?.community || "General"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= NOTIFICATIONS PREFERENCES ================= */}
          <div className="settings-card">
            <div className="card-header">
              <h2>
                <FaBell /> Notifications & Alerts
              </h2>
            </div>
            <div className="card-body">
              <div className="setting-toggle-item">
                <div>
                  <strong>In-App Notifications</strong>
                  <p>Receive alerts for borrow requests, returns, and messages</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-toggle-item">
                <div>
                  <strong>Email Digests</strong>
                  <p>Receive periodic updates regarding your active resources</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={emailAlertsEnabled}
                    onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* ================= SECURITY & ACTIONS ================= */}
          <div className="settings-card">
            <div className="card-header">
              <h2>
                <FaKey /> Security & Account
              </h2>
            </div>
            <div className="card-body">
              <div className="setting-action-row">
                <div>
                  <strong>Password & Credentials</strong>
                  <p>Update your account password safely from your profile</p>
                </div>
                <button
                  type="button"
                  className="change-pwd-btn"
                  onClick={() => navigate("/profile")}
                >
                  Change Password
                </button>
              </div>

              <div className="setting-action-row danger-zone">
                <div>
                  <strong>Sign Out</strong>
                  <p>Terminate current session on this device</p>
                </div>
                <button
                  type="button"
                  className="logout-action-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* ================= ABOUT APP ================= */}
          <div className="settings-card">
            <div className="card-header">
              <h2>
                <FaInfoCircle /> About
              </h2>
            </div>
            <div className="card-body">
              <div className="setting-item">
                <div>
                  <strong>Community Resource Sharing System</strong>
                  <p>Version 1.0.0 • React + Node.js + Express + MongoDB Atlas</p>
                </div>
              </div>
              <div className="setting-item">
                <div>
                  <strong>Purpose</strong>
                  <p>Empowering local communities to share, borrow, and preserve resources.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
