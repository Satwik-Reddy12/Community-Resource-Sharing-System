import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.mobile ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            mobile: formData.mobile,
            newPassword: formData.newPassword
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Password reset successfully");
        navigate("/");
      } else {
        alert(
          data.message ||
          "Failed to reset password"
        );
      }
    } catch (error) {
      console.error("Reset Password Error:", error);

      alert(
        "Cannot connect to backend: " +
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h2>Forgot Password?</h2>

        <p>
          Enter your registered details to reset your password.
        </p>

        <form onSubmit={handleResetPassword}>
          <div className="forgot-input-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter registered email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="forgot-input-group">
            <label>Mobile Number</label>

            <input
              type="text"
              name="mobile"
              placeholder="Enter registered mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="forgot-input-group">
            <label>New Password</label>

            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="forgot-input-group">
            <label>Confirm New Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>
        </form>

        <button
          type="button"
          className="back-login-btn"
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;