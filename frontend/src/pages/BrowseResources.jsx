import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaComments } from "react-icons/fa";
import "../styles/BrowseResources.css";

function BrowseResources() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [resources, setResources] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH RESOURCES
  // ==========================================

  const fetchResources = async (searchValue = "") => {
    try {
      setError("");

      const url =
        searchValue.trim() === ""
          ? "http://localhost:5000/api/resources"
          : `http://localhost:5000/api/resources?search=${encodeURIComponent(
              searchValue.trim()
            )}`;

      console.log("Calling:", url);

      const response = await axios.get(url);

      console.log("Resources:", response.data);

      if (Array.isArray(response.data)) {
        setResources(response.data);
      } else if (Array.isArray(response.data.resources)) {
        setResources(response.data.resources);
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error("Fetch Resources Error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load resources"
      );

      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH USER WISHLIST
  // ==========================================

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const wishlistData =
        response.data.wishlist || [];

      const resourceIds = wishlistData
        .map((item) => {
          if (
            item.resourceId &&
            typeof item.resourceId === "object"
          ) {
            return item.resourceId._id;
          }

          return item.resourceId;
        })
        .filter(Boolean);

      setWishlist(resourceIds);
    } catch (error) {
      console.error(
        "Fetch Wishlist Error:",
        error
      );
    }
  };

  // ==========================================
  // BORROW RESOURCE
  // ==========================================

  const handleBorrow = async (resourceId) => {
    try {
      const token = localStorage.getItem("token");

      console.log("========== BORROW REQUEST ==========");
      console.log("Resource ID:", resourceId);
      console.log("Token exists:", !!token);

      if (!token) {
        alert("Please login to borrow a resource.");
        navigate("/");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/borrow/request",
        {
          resourceId: resourceId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Borrow Success:", response.data);

      alert(response.data.message);

      fetchResources(search);
    } catch (error) {
      console.error(
        "========== BORROW FAILED =========="
      );
      console.error("ERROR:", error);
      console.error("MESSAGE:", error.message);
      console.error(
        "STATUS:",
        error.response?.status
      );
      console.error(
        "DATA:",
        error.response?.data
      );

      const backendMessage =
        error.response?.data?.message;

      alert(
        backendMessage
          ? `Backend Error: ${backendMessage}`
          : `Request failed: ${error.message}`
      );
    }
  };

  // ==========================================
  // ADD / REMOVE WISHLIST
  // ==========================================

  const handleWishlist = async (resourceId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to use wishlist.");
        navigate("/");
        return;
      }

      setWishlistLoading(true);

      const isWishlisted =
        wishlist.includes(resourceId);

      if (isWishlisted) {
        const response = await axios.delete(
          `http://localhost:5000/api/wishlist/${resourceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log(
          "Wishlist Remove:",
          response.data
        );

        setWishlist((previous) =>
          previous.filter(
            (id) => id !== resourceId
          )
        );

        alert(
          response.data.message ||
            "Resource removed from wishlist"
        );
      } else {
        const response = await axios.post(
          `http://localhost:5000/api/wishlist/${resourceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        console.log(
          "Wishlist Add:",
          response.data
        );

        setWishlist((previous) => [
          ...previous,
          resourceId
        ]);

        alert(
          response.data.message ||
            "Resource added to wishlist"
        );
      }
    } catch (error) {
      console.error(
        "Wishlist Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Wishlist operation failed"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // ==========================================
  // SEARCH / INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================
  // LOAD WISHLIST
  // ==========================================

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ==========================================
  // SEARCH INPUT
  // ==========================================

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="browse-page">
      <div className="browse-container">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="browse-header">
          <div className="browse-title">
            <h1>Browse Resources</h1>

            <p>
              Discover resources shared by your
              community.
            </p>
          </div>

          {/* ==========================================
              SEARCH BAR
          ========================================== */}

          <div className="search-box">
            <input
              type="text"
              placeholder="Search resources by name..."
              value={search}
              onChange={handleSearch}
            />

            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={clearSearch}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ==========================================
            INITIAL LOADING
        ========================================== */}

        {loading && (
          <div className="browse-loading">
            Loading resources...
          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {!loading && error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ==========================================
            EMPTY RESULT
        ========================================== */}

        {!loading &&
          !error &&
          resources.length === 0 && (
            <div className="empty-resources">
              <div className="empty-icon">
                📦
              </div>

              <h2>
                {search
                  ? "No Matching Resources"
                  : "No Resources Available"}
              </h2>

              <p>
                {search
                  ? `No resources found for "${search}".`
                  : "Resources added by community members will appear here."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/add-resource")
                  }
                >
                  Add a Resource
                </button>
              )}
            </div>
          )}

        {/* ==========================================
            RESOURCE LIST
        ========================================== */}

        {!loading &&
          !error &&
          resources.length > 0 && (
            <div className="resource-grid">
              {resources.map((resource) => {
                const isWishlisted =
                  wishlist.includes(
                    resource._id
                  );

                return (
                  <div
                    className="resource-card"
                    key={resource._id}
                  >
                    {/* ==========================================
                        RESOURCE IMAGE
                    ========================================== */}

                    <div className="resource-image-container">
                      {resource.image ? (
                        <img
                          src={`http://localhost:5000${resource.image}`}
                          alt={
                            resource.resourceName
                          }
                          className="resource-image"
                          onError={(event) => {
                            console.error(
                              "Image failed:",
                              `http://localhost:5000${resource.image}`
                            );

                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="no-image">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        RESOURCE CONTENT
                    ========================================== */}

                    <div className="resource-content">
                      <div className="resource-title-row">
                        <h2>
                          {
                            resource.resourceName
                          }
                        </h2>

                        <button
                          type="button"
                          className={
                            isWishlisted
                              ? "wishlist-heart active"
                              : "wishlist-heart"
                          }
                          onClick={() =>
                            handleWishlist(
                              resource._id
                            )
                          }
                          disabled={
                            wishlistLoading
                          }
                          title={
                            isWishlisted
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                        >
                          <FaHeart />
                        </button>
                      </div>

                      <p className="resource-category">
                        {resource.category}
                      </p>

                      <p className="resource-description">
                        {resource.description}
                      </p>

                      {/* ==========================================
                          RESOURCE DETAILS
                      ========================================== */}

                      <div className="resource-details">
                        <div>
                          <strong>
                            Condition:
                          </strong>

                          <span>
                            {resource.condition}
                          </span>
                        </div>

                        <div>
                          <strong>
                            Location:
                          </strong>

                          <span>
                            {resource.location}
                          </span>
                        </div>

                        <div>
                          <strong>
                            Price:
                          </strong>

                          <span className="resource-price-text">
                            {resource.price !== null && resource.price !== undefined
                              ? `₹${resource.price} / day`
                              : "Not specified"}
                          </span>
                        </div>

                        <div>
                          <strong>
                            Availability:
                          </strong>

                          <span
                            className={
                              resource.availability ===
                              "Available"
                                ? "available"
                                : "borrowed"
                            }
                          >
                            {resource.availability ||
                              "Available"}
                          </span>
                        </div>
                      </div>

                      {/* ==========================================
                          OWNER
                      ========================================== */}

                      {(resource.ownerId || resource.owner) && (
                        <div className="resource-owner-row">
                          <p className="resource-owner">
                            Shared by{" "}
                            <strong>
                              {typeof (resource.ownerId || resource.owner) ===
                              "object"
                                ? (resource.ownerId || resource.owner)
                                    .fullName
                                : "Community Member"}
                            </strong>
                          </p>

                          {(() => {
                            let currentUserId = null;
                            try {
                              const u = JSON.parse(localStorage.getItem("user"));
                              currentUserId = u?.id || u?._id;
                            } catch {
                              currentUserId = null;
                            }
                            const ownerObj = resource.ownerId || resource.owner;
                            const ownerId =
                              typeof ownerObj === "object"
                                ? ownerObj._id
                                : ownerObj;

                            if (ownerId && currentUserId && ownerId.toString() !== currentUserId.toString()) {
                              return (
                                <button
                                  type="button"
                                  className="chat-owner-btn"
                                  onClick={() => navigate(`/messages?recipientId=${ownerId}`)}
                                  title="Chat with owner"
                                >
                                  <FaComments /> Message
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}

                      {/* ==========================================
                          ACTION BUTTONS
                      ========================================== */}

                      <div className="resource-actions">
                        {resource.availability ===
                          "Available" ||
                        !resource.availability ? (
                          <button
                            type="button"
                            className="borrow-btn"
                            onClick={() =>
                              handleBorrow(
                                resource._id
                              )
                            }
                          >
                            Borrow
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="borrow-btn disabled"
                            disabled
                          >
                            Currently Borrowed
                          </button>
                        )}

                        <button
                          type="button"
                          className={
                            isWishlisted
                              ? "wishlist-btn wishlisted"
                              : "wishlist-btn"
                          }
                          onClick={() =>
                            handleWishlist(
                              resource._id
                            )
                          }
                          disabled={
                            wishlistLoading
                          }
                        >
                          <FaHeart />

                          {isWishlisted
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

export default BrowseResources;