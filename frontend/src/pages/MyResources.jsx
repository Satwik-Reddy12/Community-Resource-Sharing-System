import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/MyResources.css";

function MyResources() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingResource, setEditingResource] = useState(null);

  const [formData, setFormData] = useState({
    resourceName: "",
    category: "",
    price: "",
    description: "",
    condition: "",
    location: ""
  });

  const [image, setImage] = useState(null);

  // ==========================================
  // FETCH MY RESOURCES
  // ==========================================

  const fetchMyResources = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/resources/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResources(response.data.resources || []);
      setError("");
    } catch (error) {
      console.error("Fetch My Resources Error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load your resources"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResources();
  }, []);

  // ==========================================
  // DELETE RESOURCE
  // ==========================================

  const handleDelete = async (resourceId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/resources/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      fetchMyResources();
    } catch (error) {
      console.error("Delete Resource Error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete resource"
      );
    }
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const handleEdit = (resource) => {
    setEditingResource(resource);

    setFormData({
      resourceName: resource.resourceName || "",
      category: resource.category || "",
      price:
        resource.price !== null && resource.price !== undefined
          ? resource.price
          : "",
      description: resource.description || "",
      condition: resource.condition || "",
      location: resource.location || ""
    });

    setImage(null);
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // ==========================================
  // UPDATE RESOURCE
  // ==========================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (formData.price !== "" && formData.price !== null) {
        const numPrice = Number(formData.price);
        if (isNaN(numPrice) || numPrice < 0) {
          alert("Price per day must be a valid non-negative number.");
          return;
        }
      }

      const data = new FormData();

      data.append(
        "resourceName",
        formData.resourceName
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "price",
        formData.price !== "" ? Number(formData.price) : ""
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "condition",
        formData.condition
      );

      data.append(
        "location",
        formData.location
      );

      if (image) {
        data.append("image", image);
      }

      const response = await axios.put(
        `http://localhost:5000/api/resources/${editingResource._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      setEditingResource(null);
      setImage(null);

      fetchMyResources();
    } catch (error) {
      console.error("Update Resource Error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to update resource"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="my-resources-page">
        <div className="my-resources-container">
          <h1>My Resources</h1>
          <p>Loading your resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-resources-page">
      <div className="my-resources-container">
        {/* HEADER */}

        <div className="my-resources-header">
          <div>
            <h1>My Resources</h1>
            <p>
              Manage the resources you have shared
              with the community.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="my-resources-error">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!error && resources.length === 0 && (
          <div className="my-resources-empty">
            <div className="empty-resource-icon">
              📦
            </div>

            <h2>No Resources Added</h2>

            <p>
              Resources you add will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/add-resource")
              }
            >
              Add Resource
            </button>
          </div>
        )}

        {/* RESOURCE GRID */}

        {resources.length > 0 && (
          <div className="my-resource-grid">
            {resources.map((resource) => (
              <div
                className="my-resource-card"
                key={resource._id}
              >
                {/* IMAGE */}

                <div className="my-resource-image">
                  {resource.image ? (
                    <img
                      src={`http://localhost:5000${resource.image}`}
                      alt={resource.resourceName}
                    />
                  ) : (
                    <div className="no-resource-image">
                      No Image
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div className="my-resource-content">
                  <h2>
                    {resource.resourceName}
                  </h2>

                  <p>
                    Category: {resource.category}
                  </p>

                  <p>
                    Condition: {resource.condition}
                  </p>

                  <p>
                    Location: {resource.location}
                  </p>

                  <p>
                    Price:{" "}
                    <strong style={{ color: "#2563eb" }}>
                      {resource.price !== null && resource.price !== undefined
                        ? `₹${resource.price} / day`
                        : "Not specified"}
                    </strong>
                  </p>

                  <p>
                    {resource.description}
                  </p>

                  <div className="resource-availability">
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
                      {resource.availability}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div className="my-resource-actions">
                    <button
                      type="button"
                      className="edit-resource-btn"
                      disabled={
                        resource.availability ===
                        "Borrowed"
                      }
                      onClick={() =>
                        handleEdit(resource)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-resource-btn"
                      disabled={
                        resource.availability ===
                        "Borrowed"
                      }
                      onClick={() =>
                        handleDelete(resource._id)
                      }
                    >
                      Delete
                    </button>
                  </div>

                  {resource.availability ===
                    "Borrowed" && (
                    <p className="borrowed-warning">
                      This resource is currently
                      borrowed and cannot be edited
                      or deleted.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDIT FORM */}

        {editingResource && (
          <div className="edit-resource-overlay">
            <div className="edit-resource-modal">
              <h2>Edit Resource</h2>

              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  name="resourceName"
                  placeholder="Resource Name"
                  value={formData.resourceName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="price"
                  placeholder="Price per day (₹) (Optional)"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="any"
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="condition"
                  placeholder="Condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />

                <label>
                  Change Image
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={(event) =>
                    setImage(
                      event.target.files[0]
                    )
                  }
                />

                <div className="edit-form-actions">
                  <button
                    type="submit"
                    className="save-resource-btn"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={() =>
                      setEditingResource(null)
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyResources;