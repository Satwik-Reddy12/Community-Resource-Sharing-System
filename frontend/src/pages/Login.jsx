import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";
import hero from "../assets/hero.png";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("========== LOGIN START ==========");
      console.log("Email:", formData.email);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      console.log("HTTP Status:", response.status);
      console.log("Response OK:", response.ok);

      const data = await response.json();

      console.log("Backend Response:", data);

      if (response.ok) {
        alert(data.message);

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        console.log("Token saved:", !!data.token);

        navigate("/dashboard");
      } else {
        alert(
          data.message ||
          `Login failed. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        "========== LOGIN FETCH ERROR =========="
      );

      console.error(error);

      alert(
        "Cannot connect to backend: " +
        error.message
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src={hero}
          alt="Hero"
          className="hero-image"
        />

        <h1>Community Resource Sharing System</h1>

        <p>
          Share More. Save More.
          <br />
          Build Community Together.
        </p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back 👋</h2>

          <p>Please login to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <FaEnvelope className="icon" />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <FaLock className="icon" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                className="eye"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </span>
            </div>

            <div className="forgot">
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="login-btn"
            >
              Login
            </button>
          </form>

          <div className="register-link">
            Don't have an account?{" "}
            <Link to="/register">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;