import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Upload,
  FileText,
  Sparkles,
  Trash2,
  FileImage,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import Layout from "../components/Layout";
import API from "../services/api";

function Library() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DOCUMENTS
  // ==========================================
  const fetchDocuments = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await API.get("/documents");

      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Fetch documents error:", error);
      setError("Failed to fetch documents. Please try again.");
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
      setError("Please select a document first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append(
        "title",
        title.trim() || selectedFile.name
      );

      await API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset
      setSelectedFile(null);
      setTitle("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh documents
      await fetchDocuments();

    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to upload document."
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

      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc._id !== id)
      );

    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document.");
    }
  };

  // ==========================================
  // FILE SELECT
  // ==========================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setError("");
  };

  return (
    <Layout>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>
              <Sparkles size={14} />
              DOCUMENT INTELLIGENCE
            </div>

            <h1 style={styles.title}>
              Your knowledge workspace 📚
            </h1>

            <p style={styles.subtitle}>
              Upload, organize, and interact with your documents.
              Let AI help you understand information faster.
            </p>
          </div>

          <button
            style={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={18} />
            Upload Document
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              style={styles.closeError}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* UPLOAD SECTION */}
        <div style={styles.uploadCard}>
          <div style={styles.uploadTop}>
            <div>
              <h2 style={styles.uploadTitle}>
                Add a document
              </h2>

              <p style={styles.uploadDescription}>
                Upload a PDF or image and let PaperPal AI understand it.
              </p>
            </div>

            <div style={styles.uploadIcon}>
              <Upload size={24} />
            </div>
          </div>

          <form onSubmit={handleUpload}>
            <div style={styles.uploadForm}>

              {/* TITLE */}
              <input
                type="text"
                placeholder="Document title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.titleInput}
              />

              {/* FILE */}
              <input
                ref={fileInputRef}
                id="libraryFileInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={styles.hiddenInput}
              />

              <button
                type="button"
                style={styles.chooseButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText size={18} />

                {selectedFile
                  ? selectedFile.name.length > 25
                    ? selectedFile.name.substring(0, 25) + "..."
                    : selectedFile.name
                  : "Choose File"}
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload
                  </>
                )}
              </button>

            </div>
          </form>

          <p style={styles.supportText}>
            Supported formats: PDF, JPG, JPEG, PNG
          </p>
        </div>

        {/* DOCUMENTS HEADER */}
        <div style={styles.documentsHeader}>
          <div>
            <h2 style={styles.documentsTitle}>
              Your Documents
            </h2>

            <p style={styles.documentsSubtitle}>
              {documents.length}{" "}
              {documents.length === 1
                ? "document"
                : "documents"}{" "}
              in your workspace
            </p>
          </div>
        </div>

        {/* LOADING */}
        {fetching ? (
          <div style={styles.loadingContainer}>
            <Loader2
              size={30}
              style={{
                color: "#6366f1",
                animation: "spin 1s linear infinite",
              }}
            />

            <p>Loading your documents...</p>
          </div>
        ) : documents.length === 0 ? (

          /* EMPTY STATE */
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <FolderOpen size={38} />
            </div>

            <h2>Your library is empty</h2>

            <p>
              Upload your first document and let AI help you
              understand it.
            </p>

            <button
              style={styles.emptyButton}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={17} />
              Upload your first document
            </button>
          </div>

        ) : (

          /* DOCUMENT GRID */
          <div style={styles.documentGrid}>
            {documents.map((doc) => (
              <div
                key={doc._id}
                style={styles.documentCard}
                onClick={() =>
                  navigate(`/document/${doc._id}`)
                }
              >

                <div style={styles.cardTop}>
                  <div
                    style={{
                      ...styles.fileIcon,
                      background:
                        doc.fileType === "application/pdf"
                          ? "#fff1f2"
                          : "#eff6ff",
                      color:
                        doc.fileType === "application/pdf"
                          ? "#e11d48"
                          : "#2563eb",
                    }}
                  >
                    {doc.fileType === "application/pdf" ? (
                      <FileText size={25} />
                    ) : (
                      <FileImage size={25} />
                    )}
                  </div>

                  <button
                    onClick={(event) =>
                      handleDelete(doc._id, event)
                    }
                    style={styles.deleteButton}
                    title="Delete document"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div style={styles.documentInfo}>
                  <h3 style={styles.documentName}>
                    {doc.title}
                  </h3>

                  <p style={styles.fileName}>
                    {doc.originalFileName}
                  </p>

                  <div style={styles.documentFooter}>
                    <span>
                      {new Date(
                        doc.createdAt
                      ).toLocaleDateString()}
                    </span>

                    <span style={styles.openText}>
                      Open →
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#eef2ff",
    color: "#6366f1",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },

  title: {
    fontSize: "34px",
    color: "#0f172a",
    margin: "16px 0 10px",
    fontWeight: "750",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    maxWidth: "650px",
    lineHeight: "1.6",
    margin: 0,
  },

  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  error: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#e11d48",
    padding: "12px 15px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeError: {
    border: "none",
    background: "transparent",
    color: "#e11d48",
    cursor: "pointer",
    display: "flex",
  },

  uploadCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "38px",
    boxShadow: "0 4px 20px rgba(15,23,42,0.03)",
  },

  uploadTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  uploadTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "18px",
  },

  uploadDescription: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  uploadIcon: {
    width: "48px",
    height: "48px",
    background: "#eef2ff",
    color: "#6366f1",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadForm: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  titleInput: {
    flex: "1",
    minWidth: "200px",
    padding: "12px 14px",
    border: "1px solid #dbe1ea",
    borderRadius: "9px",
    outline: "none",
    fontSize: "14px",
  },

  hiddenInput: {
    display: "none",
  },

  chooseButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #dbe1ea",
    borderRadius: "9px",
    cursor: "pointer",
    color: "#475569",
    maxWidth: "260px",
    overflow: "hidden",
  },

  submitButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    fontWeight: "600",
  },

  supportText: {
    margin: "14px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  documentsHeader: {
    marginBottom: "18px",
  },

  documentsTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
  },

  documentsSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  loadingContainer: {
    minHeight: "250px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },

  empty: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    width: "76px",
    height: "76px",
    background: "#f1f5f9",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    marginBottom: "18px",
  },

  emptyButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    padding: "11px 16px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },

  documentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "18px",
  },

  documentCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  fileIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: "36px",
    height: "36px",
    border: "none",
    background: "#fff1f2",
    color: "#e11d48",
    borderRadius: "9px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  documentInfo: {
    minWidth: 0,
  },

  documentName: {
    margin: 0,
    color: "#1e293b",
    fontSize: "16px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  fileName: {
    margin: "7px 0 16px",
    color: "#94a3b8",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  documentFooter: {
    borderTop: "1px solid #f1f5f9",
    paddingTop: "13px",
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: "12px",
  },

  openText: {
    color: "#6366f1",
    fontWeight: "600",
  },
};

export default Library;