import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/BorrowRequests.css";

function BorrowRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // ==========================================
  // FETCH OWNER BORROW REQUESTS
  // ==========================================

  const fetchBorrowRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/borrow/owner",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Borrow Requests:", response.data);

      if (Array.isArray(response.data)) {
        setRequests(response.data);
      } else if (Array.isArray(response.data.requests)) {
        setRequests(response.data.requests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error(
        "Fetch Borrow Requests Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load borrow requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD REQUESTS
  // ==========================================

  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  // ==========================================
  // APPROVE REQUEST
  // ==========================================

  const handleApprove = async (requestId) => {
    try {
      const confirmApprove = window.confirm(
        "Are you sure you want to approve this borrow request?"
      );

      if (!confirmApprove) {
        return;
      }

      setProcessingId(requestId);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/borrow/${requestId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      // Refresh requests
      await fetchBorrowRequests();
    } catch (error) {
      console.error(
        "Approve Request Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to approve borrow request"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // REJECT REQUEST
  // ==========================================

  const handleReject = async (requestId) => {
    try {
      const confirmReject = window.confirm(
        "Are you sure you want to reject this borrow request?"
      );

      if (!confirmReject) {
        return;
      }

      setProcessingId(requestId);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/borrow/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      // Refresh requests
      await fetchBorrowRequests();
    } catch (error) {
      console.error(
        "Reject Request Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to reject borrow request"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="borrow-requests-page">
        <div className="borrow-requests-container">
          <div className="borrow-loading">
            Loading borrow requests...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="borrow-requests-page">

      <div className="borrow-requests-container">

        {/* HEADER */}

        <div className="borrow-requests-header">

          <div>
            <h1>Borrow Requests</h1>

            <p>
              Review borrowing requests for your resources.
            </p>
          </div>

          <button
            className="back-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="borrow-error">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!error && requests.length === 0 && (

          <div className="no-borrow-requests">

            <div className="empty-request-icon">
              📋
            </div>

            <h2>No Borrow Requests</h2>

            <p>
              Borrow requests for your resources
              will appear here.
            </p>

          </div>

        )}


        {/* REQUEST CARDS */}

        {requests.length > 0 && (

          <div className="borrow-request-grid">

            {requests.map((request) => {

              const resource = request.resourceId;

              const borrower = request.borrowerId;

              return (

                <div
                  className="borrow-request-card"
                  key={request._id}
                >

                  {/* RESOURCE IMAGE */}

                  <div className="borrow-resource-image">

                    {resource?.image ? (

                      <img
                        src={`http://localhost:5000${resource.image}`}
                        alt={
                          resource.resourceName ||
                          "Resource"
                        }
                      />

                    ) : (

                      <div className="borrow-no-image">
                        No Image
                      </div>

                    )}

                  </div>


                  {/* CONTENT */}

                  <div className="borrow-request-content">

                    <h2>
                      {resource?.resourceName ||
                        "Resource"}
                    </h2>


                    <div className="borrow-request-info">

                      <div>
                        <strong>Category:</strong>

                        <span>
                          {resource?.category || "N/A"}
                        </span>
                      </div>


                      <div>
                        <strong>Requested By:</strong>

                        <span>
                          {borrower?.fullName ||
                            "Community Member"}
                        </span>
                      </div>


                      <div>
                        <strong>Email:</strong>

                        <span>
                          {borrower?.email || "N/A"}
                        </span>
                      </div>


                      <div>
                        <strong>Location:</strong>

                        <span>
                          {resource?.location || "N/A"}
                        </span>
                      </div>


                      <div>
                        <strong>Request Date:</strong>

                        <span>
                          {request.requestDate
                            ? new Date(
                                request.requestDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>


                      <div>
                        <strong>Status:</strong>

                        <span
                          className={`request-status ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </div>

                    </div>


                    {/* BUTTONS */}

                    {request.status === "Pending" && (

                      <div className="request-actions">

                        <button
                          className="approve-request-btn"
                          disabled={
                            processingId === request._id
                          }
                          onClick={() =>
                            handleApprove(request._id)
                          }
                        >
                          {processingId === request._id
                            ? "Processing..."
                            : "Approve"}
                        </button>


                        <button
                          className="reject-request-btn"
                          disabled={
                            processingId === request._id
                          }
                          onClick={() =>
                            handleReject(request._id)
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}


                    {/* PROCESSED MESSAGE */}

                    {request.status !== "Pending" && (

                      <div
                        className={`processed-message ${request.status.toLowerCase()}`}
                      >
                        Request {request.status}
                      </div>

                    )}

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

export default BorrowRequests;