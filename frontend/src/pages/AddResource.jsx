
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaImage,
  FaMapMarkerAlt,
  FaTag,
  FaAlignLeft,
  FaCheckCircle,
  FaTimes,
  FaRupeeSign,
} from "react-icons/fa";
import "../styles/AddResource.css";

const initialFormData = {
  resourceName: "",
  category: "",
  description: "",
  condition: "",
  location: "",
  price: "",
};

function AddResource() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(image);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [image]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedImage) {
      setImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedImage.type)) {
      setErrorMessage(
        "Please select a JPG, PNG, or WebP image."
      );
      setImage(null);
      event.target.value = "";
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be 5 MB or less.");
      setImage(null);
      event.target.value = "";
      return;
    }

    setImage(selectedImage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Please log in before adding a resource.");
      return;
    }

    const requiredFields = [
      ["resourceName", "Resource name"],
      ["category", "Category"],
      ["description", "Description"],
      ["condition", "Condition"],
      ["location", "Pickup location"],
      ["price", "Price per day"],
    ];

    for (const [field, label] of requiredFields) {
      const value = formData[field];

      if (
        value === "" ||
        value === null ||
        value === undefined ||
        (typeof value === "string" && !value.trim())
      ) {
        setErrorMessage(`${label} is required.`);
        return;
      }
    }

    const priceText = formData.price.trim();
    const price = Number(priceText);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !/^\d+(\.\d{1,2})?$/.test(priceText)
    ) {
      setErrorMessage(
        "Enter a valid non-negative price with up to two decimal places. Enter 0 for free resources."
      );
      return;
    }

    if (!image) {
      setErrorMessage("Please upload a resource image.");
      return;
    }

    const data = new FormData();

    data.append("resourceName", formData.resourceName.trim());
    data.append("category", formData.category);
    data.append("description", formData.description.trim());
    data.append("condition", formData.condition);
    data.append("location", formData.location.trim());
    data.append("price", String(price));
    data.append("image", image);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/resources",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Resource added successfully!"
      );

      setFormData(initialFormData);
      setImage(null);

      const fileInput = document.getElementById("resourceImage");
      if (fileInput) fileInput.value = "";

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error(
        "Add Resource Error:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        setErrorMessage(
          "Your session has expired. Please log in again."
        );
      } else if (error.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to add this resource."
        );
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response) {
        setErrorMessage(
          `Server error (${error.response.status}). Please try again.`
        );
      } else {
        setErrorMessage(
          "Cannot connect to the backend. Check whether the server is running on port 5000."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-resource-page">
      <div className="add-resource-container">
        <button
          type="button"
          className="add-resource-back"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        <div className="add-resource-heading">
          <div className="add-resource-heading-icon">
            <FaBoxOpen />
          </div>

          <div>
            <h1>Add a Resource</h1>
            <p>
              Share something useful with your community.
            </p>
          </div>
        </div>

        <form
          className="add-resource-form"
          onSubmit={handleSubmit}
        >
          {errorMessage && (
            <div className="add-resource-alert error-alert" role="alert">
              <FaTimes />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              className="add-resource-alert success-alert"
              role="status"
            >
              <FaCheckCircle />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="add-resource-section-title">
            <span>01</span>
            <div>
              <h2>Resource Information</h2>
              <p>Tell others what you want to share.</p>
            </div>
          </div>

          <div className="add-resource-field">
            <label htmlFor="resourceName">
              Resource Name <span>*</span>
            </label>

            <div className="add-resource-input-wrap">
              <FaBoxOpen className="add-resource-input-icon" />
              <input
                id="resourceName"
                type="text"
                name="resourceName"
                value={formData.resourceName}
                onChange={handleChange}
                placeholder="e.g. Cordless Drill"
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="add-resource-two-columns">
            <div className="add-resource-field">
              <label htmlFor="category">
                Category <span>*</span>
              </label>

              <div className="add-resource-input-wrap">
                <FaTag className="add-resource-input-icon" />
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Tools">Tools</option>
                  <option value="Sports">Sports</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="add-resource-field">
              <label htmlFor="condition">
                Condition <span>*</span>
              </label>

              <select
                id="condition"
                name="condition"
                className="add-resource-standalone-select"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="add-resource-field">
            <label htmlFor="description">
              Description <span>*</span>
            </label>

            <div className="add-resource-input-wrap textarea-wrap">
              <FaAlignLeft className="add-resource-input-icon" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the resource and how it can be used..."
                rows={4}
                maxLength={1000}
                required
              />
            </div>

            <small className="add-resource-helper">
              {formData.description.length}/1000 characters
            </small>
          </div>

          <div className="add-resource-section-title second-section">
            <span>02</span>
            <div>
              <h2>Price and Location</h2>
              <p>Set the daily price and pickup location.</p>
            </div>
          </div>

          <div className="add-resource-two-columns">
            <div className="add-resource-field">
              <label htmlFor="price">
                Price per Day (₹) <span>*</span>
              </label>

              <div className="add-resource-input-wrap">
                <FaRupeeSign className="add-resource-input-icon" />
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 50 or 0"
                  min="0"
                  max="1000000"
                  step="0.01"
                  required
                />
              </div>

              <small className="add-resource-helper">
                Enter 0 if you are sharing it for free.
              </small>
            </div>

            <div className="add-resource-field">
              <label htmlFor="location">
                Pickup Location <span>*</span>
              </label>

              <div className="add-resource-input-wrap">
                <FaMapMarkerAlt className="add-resource-input-icon" />
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Block A, Room 101"
                  maxLength={200}
                  required
                />
              </div>
            </div>
          </div>

          <div className="add-resource-section-title second-section">
            <span>03</span>
            <div>
              <h2>Resource Image</h2>
              <p>Upload a clear photo of your resource.</p>
            </div>
          </div>

          <div className="add-resource-field">
            <label htmlFor="resourceImage">
              Upload Image <span>*</span>
            </label>

            <label
              htmlFor="resourceImage"
              className={`add-resource-upload-box ${
                preview ? "has-preview" : ""
              }`}
            >
              {preview ? (
                <div className="add-resource-preview">
                  <img src={preview} alt="Resource preview" />
                  <span className="add-resource-change-image">
                    Change Image
                  </span>
                </div>
              ) : (
                <div className="add-resource-upload-placeholder">
                  <div className="add-resource-upload-icon">
                    <FaImage />
                  </div>
                  <strong>Click to upload an image</strong>
                  <span>JPG, PNG or WebP · Maximum 5 MB</span>
                </div>
              )}
            </label>

            <input
              id="resourceImage"
              className="add-resource-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              required={!image}
            />

            {image && (
              <div className="add-resource-selected-file">
                <FaCheckCircle />
                <span>{image.name}</span>
                <button
                  type="button"
                  aria-label="Remove selected image"
                  onClick={() => {
                    setImage(null);
                    const input = document.getElementById("resourceImage");
                    if (input) input.value = "";
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          <div className="add-resource-submit-area">
            <p>
              <span>*</span> All fields are required.
            </p>

            <div className="add-resource-actions">
              <button
                type="button"
                className="add-resource-cancel"
                onClick={() => navigate("/dashboard")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="add-resource-submit"
                disabled={loading}
              >
                {loading ? "Adding Resource..." : "Add Resource"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddResource;
