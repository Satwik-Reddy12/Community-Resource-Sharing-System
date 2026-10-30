import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/History.css";

function History() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ratingRequest, setRatingRequest] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratedRequests, setRatedRequests] = useState([]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/borrow/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const items = response.data.history || [];
      setHistoryList(items);
      setError("");

      await checkExistingRatings(items, token);
    } catch (err) {
      console.error("Fetch History Error:", err);
      setError(
        err.response?.data?.message || "Failed to load borrowing history"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkExistingRatings = async (items, token) => {
    const rated = [];
    for (const item of items) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/ratings/check/${item._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.alreadyRated) {
          rated.push(item._id);
        }
      } catch (err) {
        console.error("Check Rating Error:", err);
      }
    }
    setRatedRequests(rated);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openRating = (request) => {
    setRatingRequest(request);
    setSelectedRating(0);
    setComment("");
  };

  const closeRating = () => {
    if (ratingLoading) return;
    setRatingRequest(null);
    setSelectedRating(0);
    setComment("");
  };

  const submitRating = async () => {
    if (selectedRating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setRatingLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/ratings",
        {
          borrowRequestId: ratingRequest._id,
          rating: selectedRating,
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "Rating submitted successfully");

      setRatedRequests((prev) => [...prev, ratingRequest._id]);
      closeRating();
    } catch (err) {
      console.error("Submit Rating Error:", err);
      alert(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="history-loading">Loading borrowing history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div>
            <h1>Borrowing History</h1>
            <p>View resources you have previously borrowed and returned.</p>
          </div>

          <button
            type="button"
            className="history-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {error && <div className="history-error">{error}</div>}

        {!error && historyList.length === 0 && (
          <div className="history-empty">
            <div className="history-empty-icon">📜</div>
            <h2>No History Yet</h2>
            <p>Completed borrowings will appear here once items are returned.</p>
            <button
              type="button"
              onClick={() => navigate("/browse-resources")}
            >
              Browse Resources
            </button>
          </div>
        )}

        {historyList.length > 0 && (
          <div className="history-list">
            {historyList.map((item) => {
              const resource = item.resourceId;
              const owner = item.ownerId;

              return (
                <div className="history-card" key={item._id}>
                  <div className="history-image-container">
                    {resource?.image ? (
                      <img
                        src={`http://localhost:5000${resource.image}`}
                        alt={resource.resourceName || "Resource"}
                        className="history-image"
                      />
                    ) : (
                      <div className="history-no-image">📦</div>
                    )}
                  </div>

                  <div className="history-content">
                    <div className="history-title-row">
                      <h2>{resource?.resourceName || "Resource"}</h2>
                      <span className="history-status">{item.status}</span>
                    </div>

                    <p className="history-category">
                      {resource?.category || "General"}
                    </p>

                    {resource?.location && (
                      <div className="history-location">
                        <strong>Location:</strong>
                        <span>{resource.location}</span>
                      </div>
                    )}

                    <div className="history-dates">
                      <div className="history-date-item">
                        <strong>Requested:</strong>
                        <span>
                          {item.requestDate
                            ? new Date(item.requestDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>

                      {item.approvedDate && (
                        <div className="history-date-item">
                          <strong>Approved:</strong>
                          <span>
                            {new Date(item.approvedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {item.returnedDate && (
                        <div className="history-date-item">
                          <strong>Returned:</strong>
                          <span>
                            {new Date(item.returnedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="history-owner">
                      Owner: <strong>{owner?.fullName || "Community Member"}</strong>
                    </p>

                    <div style={{ marginTop: "15px" }}>
                      {ratedRequests.includes(item._id) ? (
                        <button
                          type="button"
                          style={{
                            padding: "8px 14px",
                            border: "1px solid #16a34a",
                            background: "#dcfce7",
                            color: "#15803d",
                            borderRadius: "6px",
                            cursor: "default",
                            fontWeight: "600",
                          }}
                          disabled
                        >
                          ✓ Owner Rated
                        </button>
                      ) : (
                        <button
                          type="button"
                          style={{
                            padding: "8px 14px",
                            border: "none",
                            background: "#2563eb",
                            color: "white",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                          onClick={() => openRating(item)}
                        >
                          ⭐ Rate Owner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RATING MODAL */}
      {ratingRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "450px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "30px",
              boxSizing: "border-box",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.25)",
            }}
          >
            <button
              type="button"
              onClick={closeRating}
              disabled={ratingLoading}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                border: "none",
                background: "transparent",
                fontSize: "28px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h2>Rate Your Experience</h2>
            <p>
              How was your experience with{" "}
              <strong>
                {ratingRequest.ownerId?.fullName || "the owner"}
              </strong>
              ?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                margin: "20px 0 10px",
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "38px",
                    cursor: "pointer",
                    color: star <= selectedRating ? "#f5b301" : "#cccccc",
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <p>
              {selectedRating > 0
                ? `${selectedRating} / 5`
                : "Select a rating"}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment (optional)"
              maxLength={500}
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "8px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={closeRating}
                disabled={ratingLoading}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitRating}
                disabled={ratingLoading}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  background: "#2563eb",
                  color: "#ffffff",
                }}
              >
                {ratingLoading ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;