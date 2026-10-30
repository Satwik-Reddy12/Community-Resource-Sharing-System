import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Notifications.css";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(
        response.data.notifications || []
      );

      setError("");
    } catch (error) {
      console.error(
        "Fetch Notifications Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/notifications/read/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      );
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <h1>Notifications</h1>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated about your resource activity.
            </p>
          </div>

          <div className="notification-actions">
            <button
              type="button"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="notification-error">
            {error}
          </div>
        )}

        {!error && notifications.length === 0 && (
          <div className="notification-empty">
            <div className="notification-empty-icon">
              🔔
            </div>

            <h2>No Notifications</h2>

            <p>
              Your notifications will appear here.
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  notification.isRead
                    ? "read"
                    : "unread"
                }`}
                onClick={() =>
                  markAsRead(notification._id)
                }
              >
                <div className="notification-icon">
                  {notification.type ===
                    "BorrowRequest" && "📩"}

                  {notification.type ===
                    "RequestApproved" && "✅"}

                  {notification.type ===
                    "RequestRejected" && "❌"}

                  {notification.type ===
                    "ResourceReturned" && "📦"}
                </div>

                <div className="notification-content">
                  <h3>
                    {notification.type ===
                      "BorrowRequest" &&
                      "New Borrow Request"}

                    {notification.type ===
                      "RequestApproved" &&
                      "Borrow Request Approved"}

                    {notification.type ===
                      "RequestRejected" &&
                      "Borrow Request Rejected"}

                    {notification.type ===
                      "ResourceReturned" &&
                      "Resource Returned"}
                  </h3>

                  <p>
                    {notification.message}
                  </p>

                  <span>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                {!notification.isRead && (
                  <div className="unread-dot"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;