import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Get user information
  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // FETCH DOCUMENTS
  // ==========================================
  const fetchDocuments = async () => {
    try {
      setFetching(true);

      const response = await API.get("/documents");

      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Fetch documents error:", error);
      setError("Failed to fetch documents");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ==========================================
  // UPLOAD DOCUMENT
  // ==========================================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append(
        "title",
        title || selectedFile.name
      );

      await API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setSelectedFile(null);
      setTitle("");

      // Reset file input
      document.getElementById("fileInput").value = "";

      // Refresh documents
      fetchDocuments();

    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to upload document"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE DOCUMENT
  // ==========================================
  const handleDelete = async (id, event) => {
    event.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/documents/${id}`);

      setDocuments(
        documents.filter((doc) => doc._id !== id)
      );
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>
          📄 PaperPal AI
        </div>

        <div style={styles.userSection}>
          <span>
            Hello, {user?.name || "User"} 👋
          </span>

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <h1>My Documents</h1>

          <p>
            Upload documents and let AI help you understand them.
          </p>
        </div>

        {/* Upload Section */}
        <div style={styles.uploadCard}>
          <h2>Upload Document</h2>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <form
            onSubmit={handleUpload}
            style={styles.uploadForm}
          >
            <input
              type="text"
              placeholder="Document title (optional)"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              style={styles.input}
            />

            <input
              id="fileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setSelectedFile(e.target.files[0])
              }
              style={styles.fileInput}
            />

            <button
              type="submit"
              disabled={loading}
              style={styles.uploadButton}
            >
              {loading
                ? "Uploading..."
                : "Upload Document"}
            </button>
          </form>

          <p style={styles.supportText}>
            Supported formats: PDF, JPG, JPEG, PNG
          </p>
        </div>

        {/* Documents Section */}
        <div style={styles.documentsSection}>
          <h2>Your Documents</h2>

          {fetching ? (
            <p>Loading documents...</p>
          ) : documents.length === 0 ? (
            <div style={styles.empty}>
              <p>No documents uploaded yet 📄</p>
              <span>
                Upload your first document to get started.
              </span>
            </div>
          ) : (
            <div style={styles.documentGrid}>
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  style={styles.documentCard}
                  onClick={() =>
                    navigate(`/document/${doc._id}`)
                  }
                >
                  <div style={styles.documentIcon}>
                    {doc.fileType === "application/pdf"
                      ? "📕"
                      : "🖼️"}
                  </div>

                  <div style={styles.documentInfo}>
                    <h3>{doc.title}</h3>

                    <p>
                      {doc.originalFileName}
                    </p>

                    <small>
                      {new Date(
                        doc.createdAt
                      ).toLocaleDateString()}
                    </small>
                  </div>

                  <button
                    onClick={(event) =>
                      handleDelete(
                        doc._id,
                        event
                      )
                    }
                    style={styles.deleteButton}
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
  },

  navbar: {
    background: "#ffffff",
    padding: "16px 8%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  brand: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  logoutButton: {
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px",
  },

  header: {
    marginBottom: "30px",
  },

  uploadCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
    marginBottom: "40px",
  },

  uploadForm: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  input: {
    flex: "1",
    minWidth: "200px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "7px",
  },

  fileInput: {
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "7px",
    background: "#fafafa",
  },

  uploadButton: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px",
  },

  supportText: {
    color: "#777",
    fontSize: "13px",
    marginTop: "12px",
  },

  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "15px",
  },

  documentsSection: {
    marginTop: "20px",
  },

  documentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  documentCard: {
    background: "white",
    padding: "18px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "0.2s",
  },

  documentIcon: {
    fontSize: "30px",
  },

  documentInfo: {
    flex: 1,
  },

  deleteButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
  },

  empty: {
    background: "white",
    padding: "40px",
    textAlign: "center",
    borderRadius: "10px",
    color: "#777",
  },
};

export default Dashboard;