import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import "../styles/Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchWishlist = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response =
        await axios.get(
          "http://localhost:5000/api/wishlist",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setWishlist(
        response.data.wishlist || []
      );

      setError("");
    } catch (error) {
      console.error(
        "Fetch Wishlist Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (
    resourceId
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/wishlist/${resourceId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setWishlist((previous) =>
        previous.filter(
          (item) =>
            item.resourceId?._id !==
            resourceId
        )
      );
    } catch (error) {
      console.error(
        "Remove Wishlist Error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to remove resource"
      );
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-loading">
            Loading wishlist...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* ================= HEADER ================= */}

        <div className="wishlist-header">
          <div>
            <h1>
              <FaHeart />
              Wishlist
            </h1>

            <p>
              Resources you've saved for later.
            </p>
          </div>

          <button
            type="button"
            className="wishlist-dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="wishlist-error">
            {error}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!error &&
          wishlist.length === 0 && (
            <div className="wishlist-empty">
              <FaHeart />

              <h2>
                Your Wishlist is Empty
              </h2>

              <p>
                Save resources you're
                interested in and find them
                here later.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/browse-resources"
                  )
                }
              >
                Browse Resources
              </button>
            </div>
          )}

        {/* ================= WISHLIST ================= */}

        {wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const resource =
                item.resourceId;

              if (!resource) {
                return null;
              }

              return (
                <div
                  className="wishlist-card"
                  key={item._id}
                >
                  <div className="wishlist-image-container">
                    {resource.image ? (
                      <img
                        src={`http://localhost:5000${resource.image}`}
                        alt={
                          resource.resourceName
                        }
                        className="wishlist-image"
                      />
                    ) : (
                      <div className="wishlist-no-image">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="wishlist-content">
                    <div className="wishlist-title-row">
                      <div>
                        <h2>
                          {
                            resource.resourceName
                          }
                        </h2>

                        <p>
                          {
                            resource.category
                          }
                        </p>
                      </div>

                      <FaHeart className="wishlist-heart" />
                    </div>

                    <p className="wishlist-description">
                      {
                        resource.description
                      }
                    </p>

                    <div className="wishlist-details">
                      <div>
                        <strong>
                          Condition:
                        </strong>

                        <span>
                          {
                            resource.condition
                          }
                        </span>
                      </div>

                      <div>
                        <strong>
                          Location:
                        </strong>

                        <span>
                          {
                            resource.location
                          }
                        </span>
                      </div>

                      <div>
                        <strong>
                          Price:
                        </strong>

                        <span style={{ fontWeight: 600, color: "#2563eb" }}>
                          {
                            resource.price !== null && resource.price !== undefined
                              ? `₹${resource.price} / day`
                              : "Not specified"
                          }
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
                              ? "wishlist-available"
                              : "wishlist-borrowed"
                          }
                        >
                          {
                            resource.availability
                          }
                        </span>
                      </div>
                    </div>

                    <div className="wishlist-actions">
                      {resource.availability ===
                        "Available" ||
                      !resource.availability ? (
                        <button
                          type="button"
                          className="wishlist-borrow-btn"
                          onClick={() =>
                            alert(
                              `Borrow request for ${resource.resourceName} will be implemented next.`
                            )
                          }
                        >
                          Borrow
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="wishlist-borrow-btn disabled"
                          disabled
                        >
                          Currently Borrowed
                        </button>
                      )}

                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={() =>
                          removeFromWishlist(
                            resource._id
                          )
                        }
                      >
                        <FaHeart />
                        Remove
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

export default Wishlist;