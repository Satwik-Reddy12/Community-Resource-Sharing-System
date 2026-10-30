import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/MyBorrowings.css";

function MyBorrowings() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingRequest, setRatingRequest] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratedRequests, setRatedRequests] = useState([]);

  const fetchBorrowings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/borrow/borrower",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const borrowingRequests = response.data.requests || [];
      setRequests(borrowingRequests);
      setError("");

      const returnedRequests = borrowingRequests.filter(
        (request) => request.status === "Returned"
      );

      const rated = [];

      for (const request of returnedRequests) {
        try {
          const ratingResponse = await axios.get(
            `http://localhost:5000/api/ratings/check/${request._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (ratingResponse.data.alreadyRated) {
            rated.push(request._id);
          }
        } catch (ratingError) {
          console.error(
            "Check Rating Error:",
            ratingError
          );
        }
      }

      setRatedRequests(rated);
    } catch (error) {
      console.error(
        "Fetch Borrowings Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load your borrowings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturn = async (requestId) => {
    const confirmReturn = window.confirm(
      "Are you sure you want to return this resource?"
    );

    if (!confirmReturn) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/borrow/return/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
        "Resource returned successfully"
      );

      fetchBorrowings();
    } catch (error) {
      console.error(
        "Return Resource Error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to return resource"
      );
    }
  };

  const openRating = (request) => {
    setRatingRequest(request);
    setSelectedRating(0);
    setComment("");
  };

  const closeRating = () => {
    if (ratingLoading) {
      return;
    }

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

      alert(
        response.data.message ||
        "Rating submitted successfully"
      );

      setRatedRequests((previous) => [
        ...previous,
        ratingRequest._id,
      ]);

      setRatingRequest(null);
      setSelectedRating(0);
      setComment("");
    } catch (error) {
      console.error(
        "Submit Rating Error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to submit rating"
      );
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="borrowings-page">
        <div className="borrowings-container">
          <h1>My Borrowings</h1>
          <p>Loading your borrowings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="borrowings-page">
      <div className="borrowings-container">
        <div className="borrowings-header">
          <div>
            <h1>My Borrowings</h1>
            <p>
              View resources you have requested and borrowed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!error && requests.length === 0 && (
          <div className="empty-borrowings">
            <div className="empty-icon">
              📦
            </div>

            <h2>No Borrowings Yet</h2>

            <p>
              Resources you request or borrow will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/browse-resources")
              }
            >
              Browse Resources
            </button>
          </div>
        )}

        {requests.length > 0 && (
          <div className="borrowings-list">
            {requests.map((request) => (
              <div
                className="borrowing-card"
                key={request._id}
              >
                <div className="borrowing-image">
                  {request.resourceId?.image ? (
                    <img
                      src={`http://localhost:5000${request.resourceId.image}`}
                      alt={
                        request.resourceId.resourceName
                      }
                    />
                  ) : (
                    <div className="no-image">
                      No Image
                    </div>
                  )}
                </div>

                <div className="borrowing-content">
                  <h2>
                    {request.resourceId?.resourceName ||
                      "Resource"}
                  </h2>

                  <p>
                    Category:{" "}
                    {request.resourceId?.category ||
                      "N/A"}
                  </p>

                  <p>
                    Owner:{" "}
                    {request.ownerId?.fullName ||
                      "Community Member"}
                  </p>

                  <p>
                    Request Date:{" "}
                    {new Date(
                      request.requestDate ||
                        request.createdAt
                    ).toLocaleDateString()}
                  </p>

                  {request.approvedDate && (
                    <p>
                      Approved Date:{" "}
                      {new Date(
                        request.approvedDate
                      ).toLocaleDateString()}
                    </p>
                  )}

                  {request.returnedDate && (
                    <p>
                      Returned Date:{" "}
                      {new Date(
                        request.returnedDate
                      ).toLocaleDateString()}
                    </p>
                  )}

                  <div className="status-row">
                    <strong>Status:</strong>

                    <span
                      className={`status ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  {request.status === "Approved" && (
                    <button
                      type="button"
                      className="return-btn"
                      onClick={() =>
                        handleReturn(request._id)
                      }
                    >
                      Return Resource
                    </button>
                  )}

                  {request.status === "Pending" && (
                    <p className="pending-text">
                      Waiting for owner approval.
                    </p>
                  )}

                  {request.status === "Rejected" && (
                    <p className="rejected-text">
                      Your borrow request was rejected.
                    </p>
                  )}

                  {request.status === "Returned" && (
                    <>
                      <p className="returned-text">
                        Resource has been returned successfully.
                      </p>

                      {ratedRequests.includes(
                        request._id
                      ) ? (
                        <button
                          type="button"
                          className="return-btn"
                          disabled
                        >
                          ✓ Rated
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="return-btn"
                          onClick={() =>
                            openRating(request)
                          }
                        >
                          ⭐ Rate Owner
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              boxShadow:
                "0 10px 40px rgba(0, 0, 0, 0.25)",
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
                {ratingRequest.ownerId?.fullName ||
                  "the owner"}
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
                  onClick={() =>
                    setSelectedRating(star)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "38px",
                    cursor: "pointer",
                    color:
                      star <= selectedRating
                        ? "#f5b301"
                        : "#cccccc",
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
              onChange={(event) =>
                setComment(event.target.value)
              }
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
                }}
              >
                {ratingLoading
                  ? "Submitting..."
                  : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBorrowings;