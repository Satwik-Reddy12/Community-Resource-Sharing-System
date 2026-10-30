import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUsers,
} from "react-icons/fa";
import hero from "../assets/hero.png";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    community: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            mobile: formData.mobile,
            community: formData.community,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        setFormData({
          fullName: "",
          email: "",
          mobile: "",
          community: "",
          password: "",
          confirmPassword: "",
        });

        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Server Error");
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={hero} alt="hero" className="hero-image" />

        <h1>Community Resource Sharing System</h1>

        <p>
          Share More. Save More.
          <br />
          Build Community Together.
        </p>
      </div>

      <div className="register-right">
        <div className="register-card">
          <h2>Create Account</h2>

          <p>Join our sharing community today.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <FaUser className="icon" />

              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

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
              <FaPhone className="icon" />

              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <FaUsers className="icon" />

              <select
                name="community"
                value={formData.community}
                onChange={handleChange}
                required
              >
                <option value="">Select Community</option>
                <option value="VIT Chennai">VIT Chennai</option>
                <option value="Apartment">Apartment</option>
                <option value="Office">Office</option>
                <option value="Neighborhood">Neighborhood</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-box">
              <FaLock className="icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="input-box">
              <FaLock className="icon" />

              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <span
                className="eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="terms">
              <input type="checkbox" required />

              <label>I agree to the Terms & Conditions</label>
            </div>

            <button type="submit" className="register-btn">
              Register
            </button>
          </form>

          <div className="login-link">
            Already have an account?{" "}
            <Link to="/">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;