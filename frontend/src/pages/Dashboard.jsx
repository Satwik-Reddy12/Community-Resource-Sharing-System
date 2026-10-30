import "../styles/Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaPlusCircle,
  FaBoxOpen,
  FaExchangeAlt,
  FaHistory,
  FaHeart,
  FaComments,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaBox,
  FaHandshake,
  FaUsers,
  FaStar
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    myResources: 0,
    borrowedItems: 0,
    pendingRequests: 0,
    trustScore: 0,
    communityPoints: 0,
    totalResources: 0,
    successfulBorrowings: 0,
    activeMembers: 0
  });

  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        console.log("Dashboard Response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard data"
          );
        }

        setStats({
          myResources: data.stats?.myResources || 0,
          borrowedItems: data.stats?.borrowedItems || 0,
          pendingRequests: data.stats?.pendingRequests || 0,
          trustScore: data.stats?.trustScore || 0,
          communityPoints: data.stats?.communityPoints || 0,
          totalResources: data.stats?.totalResources || 0,
          successfulBorrowings:
            data.stats?.successfulBorrowings || 0,
          activeMembers: data.stats?.activeMembers || 0
        });

        setActiveBorrowings(
          data.activeBorrowings || []
        );
      } catch (error) {
        console.error(
          "Dashboard Error:",
          error
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // ==========================================
  // PROFILE DATA
  // ==========================================

  const storedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Invalid user data:",
      error
    );
    currentUser = null;
  }

  return (
    <div className="dashboard">
      {/* ================= Sidebar ================= */}
      <aside className="sidebar">
        <div className="logo">
          <h2>Community Share</h2>
        </div>

        <ul className="menu">
          <li className="active">
            <FaHome />
            <span>Dashboard</span>
          </li>

          <li
            onClick={() =>
              navigate("/browse-resources")
            }
          >
            <FaSearch />
            <span>Browse Resources</span>
          </li>

          <li
            onClick={() =>
              navigate("/add-resource")
            }
          >
            <FaPlusCircle />
            <span>Add Resource</span>
          </li>

          <li
            onClick={() =>
              navigate("/my-resources")
            }
          >
            <FaBoxOpen />
            <span>My Resources</span>
          </li>

          <li
            onClick={() =>
              navigate("/borrow-requests")
            }
          >
            <FaExchangeAlt />
            <span>Borrow Requests</span>
          </li>

          <li
            onClick={() =>
              navigate("/my-borrowings")
            }
          >
            <FaHandshake />
            <span>My Borrowings</span>
          </li>

          <li
            onClick={() =>
              navigate("/history")
            }
          >
            <FaHistory />
            <span>History</span>
          </li>

          <li
            onClick={() =>
              navigate("/wishlist")
            }
          >
            <FaHeart />
            <span>Wishlist</span>
          </li>

          <li
            onClick={() =>
              navigate("/messages")
            }
          >
            <FaComments />
            <span>Messages</span>
          </li>

          <li
            onClick={() =>
              navigate("/notifications")
            }
          >
            <FaBell />
            <span>Notifications</span>
          </li>

          <li
            onClick={() =>
              navigate("/profile")
            }
          >
            <FaUserCircle />
            <span>Profile</span>
          </li>

          <li
            onClick={() =>
              navigate("/settings")
            }
          >
            <FaCog />
            <span>Settings</span>
          </li>
        </ul>

        <div
          className="logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </div>
      </aside>

      {/* ================= Main Content ================= */}
      <main className="main-content">
        {/* ================= Navbar ================= */}
        <nav className="navbar">
          <div className="left-nav">
            <FaBars className="menu-icon" />
          </div>

          <div className="right-nav">
            <div
              className="notification"
              onClick={() =>
                navigate("/notifications")
              }
              style={{ cursor: "pointer" }}
            >
              <FaBell />
              <span className="badge">0</span>
            </div>

            <div className="profile">
              {currentUser &&
              currentUser.profileImage ? (
                <img
                  src={`http://localhost:5000${currentUser.profileImage}`}
                  alt="profile"
                />
              ) : (
                <FaUserCircle className="profile-icon" />
              )}

              <span>
                {currentUser
                  ? currentUser.fullName
                  : "User"}
              </span>
            </div>
          </div>
        </nav>

        {/* ================= Welcome Section ================= */}
        <section className="welcome">
          <h1>Welcome Back 👋</h1>

          <p>
            Share More • Save More • Build
            Community Together
          </p>
        </section>

        {/* ================= Statistics ================= */}
        <section className="stats">
          <div className="stat-card">
            <FaBox className="stat-icon" />

            <h2>
              {dashboardLoading
                ? "..."
                : stats.myResources}
            </h2>

            <p>My Resources</p>
          </div>

          <div
            className="stat-card"
            onClick={() =>
              navigate("/my-borrowings")
            }
            style={{ cursor: "pointer" }}
          >
            <FaHandshake className="stat-icon" />

            <h2>
              {dashboardLoading
                ? "..."
                : stats.borrowedItems}
            </h2>

            <p>Borrowed Items</p>
          </div>

          <div
            className="stat-card"
            onClick={() =>
              navigate("/borrow-requests")
            }
            style={{ cursor: "pointer" }}
          >
            <FaUsers className="stat-icon" />

            <h2>
              {dashboardLoading
                ? "..."
                : stats.pendingRequests}
            </h2>

            <p>Pending Requests</p>
          </div>

          <div className="stat-card">
            <FaStar className="stat-icon" />

            <h2>
              {dashboardLoading
                ? "..."
                : `${Number(
                    stats.trustScore || 0
                  ).toFixed(1)} ★`}
            </h2>

            <p>Trust Score</p>
          </div>
        </section>

        {/* ================= Featured Resources ================= */}
        <section className="featured-resources">
          <div className="section-header">
            <h2>Featured Resources</h2>
          </div>

          <div className="empty-resource-card">
            <div className="empty-icon">
              📦
            </div>

            <h3>
              No Resources Available
            </h3>

            <p>
              Resources shared by community
              members will appear here.
            </p>

            <button
              className="browse-btn"
              onClick={() =>
                navigate(
                  "/browse-resources"
                )
              }
            >
              Browse Resources
            </button>
          </div>
        </section>

        {/* ================= Dashboard Bottom ================= */}
        <section className="dashboard-bottom">
          {/* Upcoming Returns */}
          <div className="dashboard-card">
            <div className="card-title">
              <h2>
                📅 Upcoming Returns
              </h2>
            </div>

            <div className="empty-state">
              {activeBorrowings.length ===
              0 ? (
                <>
                  <div className="empty-state-icon">
                    📅
                  </div>

                  <h3>
                    No Active Borrowings
                  </h3>

                  <p>
                    Items you borrow will
                    appear here along with
                    their return dates.
                  </p>

                  <button
                    className="browse-btn"
                    onClick={() =>
                      navigate(
                        "/my-borrowings"
                      )
                    }
                  >
                    View My Borrowings
                  </button>
                </>
              ) : (
                <>
                  <div className="active-borrowings-list">
                    {activeBorrowings.map(
                      (borrowing) => (
                        <div
                          className="active-borrowing-item"
                          key={
                            borrowing._id
                          }
                        >
                          <h3>
                            {borrowing
                              .resourceId
                              ?.resourceName ||
                              "Resource"}
                          </h3>

                          <p>
                            Approved on:{" "}
                            {borrowing.approvedDate
                              ? new Date(
                                  borrowing.approvedDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>

                          <span>
                            Status: Approved
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    className="browse-btn"
                    onClick={() =>
                      navigate(
                        "/my-borrowings"
                      )
                    }
                  >
                    View My Borrowings
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Pending Borrow Requests */}
          <div className="dashboard-card">
            <div className="card-title">
              <h2>
                📩 Pending Borrow Requests
              </h2>
            </div>

            <div className="empty-state">
              {stats.pendingRequests ===
              0 ? (
                <>
                  <div className="empty-state-icon">
                    📩
                  </div>

                  <h3>
                    No Pending Requests
                  </h3>

                  <p>
                    Borrow requests from
                    other users will appear
                    here.
                  </p>

                  <button
                    className="browse-btn"
                    onClick={() =>
                      navigate(
                        "/borrow-requests"
                      )
                    }
                  >
                    View Borrow Requests
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-state-icon">
                    📩
                  </div>

                  <h3>
                    {stats.pendingRequests}{" "}
                    Pending Request
                    {stats.pendingRequests !==
                    1
                      ? "s"
                      : ""}
                  </h3>

                  <p>
                    You have pending borrow
                    requests waiting for
                    your response.
                  </p>

                  <button
                    className="browse-btn"
                    onClick={() =>
                      navigate(
                        "/borrow-requests"
                      )
                    }
                  >
                    View Borrow Requests
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ================= Dashboard Analytics ================= */}
        <section className="dashboard-analytics">
          {/* Achievement Card */}
          <div className="achievement-card">
            <h2>
              🏆 Achievement & Trust
            </h2>

            <div className="achievement-content">
              <div className="achievement-score">
                ⭐{" "}
                {dashboardLoading
                  ? "..."
                  : Number(
                      stats.trustScore || 0
                    ).toFixed(1)}
              </div>

              <p>
                Your trust score increases
                whenever resources are
                returned on time and
                positively rated by other
                community members.
              </p>
            </div>
          </div>

          {/* Community Statistics */}
          <div className="community-card">
            <h2>
              📊 Community Statistics
            </h2>

            <div className="community-stats">
              <div className="community-item">
                <h3>
                  {dashboardLoading
                    ? "..."
                    : stats.totalResources}
                </h3>

                <span>
                  Total Resources
                </span>
              </div>

              <div className="community-item">
                <h3>
                  {dashboardLoading
                    ? "..."
                    : stats.successfulBorrowings}
                </h3>

                <span>
                  Successful Borrowings
                </span>
              </div>

              <div className="community-item">
                <h3>
                  {dashboardLoading
                    ? "..."
                    : stats.activeMembers}
                </h3>

                <span>
                  Active Members
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Monthly Activity ================= */}
        <section className="activity-section">
          <div className="activity-card">
            <h2>
              📈 Monthly Activity
            </h2>

            <div className="activity-empty">
              <div className="activity-icon">
                📊
              </div>

              <h3>
                No Activity Yet
              </h3>

              <p>
                Borrowing and sharing
                activities will be displayed
                here after you start using the
                system.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;