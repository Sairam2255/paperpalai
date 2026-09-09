import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  // Translation
  const [language, setLanguage] = useState("Telugu");
  const [translatedText, setTranslatedText] = useState("");
  const [translationLoading, setTranslationLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH DOCUMENT
  // ==========================================
  const fetchDocument = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/documents/${id}`);

      setDocument(response.data.document);

      if (response.data.document.summary) {
        setSummary(response.data.document.summary);
      }
    } catch (error) {
      console.error("Fetch document error:", error);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // ==========================================
  // GENERATE SUMMARY
  // ==========================================
  const handleSummarize = async () => {
    try {
      setSummaryLoading(true);
      setError("");

      const response = await API.post(
        `/documents/${id}/summarize`
      );

      setSummary(response.data.summary);
    } catch (error) {
      console.error("Summary Error:", error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to generate summary"
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // ==========================================
  // ASK QUESTION
  // ==========================================
  const handleAskQuestion = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    try {
      setQuestionLoading(true);
      setError("");
      setAnswer("");

      const response = await API.post(
        `/documents/${id}/ask`,
        {
          question,
        }
      );

      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Question Error:", error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to get AI response"
      );
    } finally {
      setQuestionLoading(false);
    }
  };

  // ==========================================
  // TRANSLATE DOCUMENT
  // ==========================================
  const handleTranslate = async () => {
    try {
      setTranslationLoading(true);
      setError("");
      setTranslatedText("");

      // Translate summary if available.
      // Otherwise translate extracted document text.
      const textToTranslate =
        summary || document.extractedText;

      const response = await API.post(
        `/documents/${id}/translate`,
        {
          language,
          text: textToTranslate,
        }
      );

      setTranslatedText(
        response.data.translatedText
      );
    } catch (error) {
      console.error("Translation Error:", error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to translate document"
      );
    } finally {
      setTranslationLoading(false);
    }
  };

  // ==========================================
  // DELETE DOCUMENT
  // ==========================================
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/documents/${id}`);

      navigate("/dashboard");
    } catch (error) {
      console.error("Delete Error:", error);

      setError("Failed to delete document");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div style={styles.loading}>
        Loading document...
      </div>
    );
  }

  if (!document) {
    return (
      <div style={styles.loading}>
        Document not found
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div
          style={styles.brand}
          onClick={() => navigate("/dashboard")}
        >
          📄 PaperPal AI
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          ← Back to Documents
        </button>
      </nav>

      <main style={styles.main}>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* DOCUMENT HEADER */}
        <div style={styles.documentHeader}>
          <div>
            <div style={styles.fileIcon}>
              {document.fileType === "application/pdf"
                ? "📕"
                : "🖼️"}
            </div>

            <h1>{document.title}</h1>

            <p style={styles.fileName}>
              {document.originalFileName}
            </p>

            <p style={styles.date}>
              Uploaded on{" "}
              {new Date(
                document.createdAt
              ).toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleDelete}
            style={styles.deleteButton}
          >
            🗑️ Delete
          </button>
        </div>

        {/* AI SUMMARY */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>🤖 AI Summary</h2>

              <p style={styles.description}>
                Understand the important information quickly.
              </p>
            </div>

            <button
              onClick={handleSummarize}
              disabled={summaryLoading}
              style={styles.primaryButton}
            >
              {summaryLoading
                ? "Generating..."
                : summary
                ? "Regenerate Summary"
                : "Generate Summary"}
            </button>
          </div>

          {summary ? (
            <div style={styles.aiContent}>
              {summary}
            </div>
          ) : (
            <div style={styles.placeholder}>
              Click "Generate Summary" to let PaperPal AI
              analyze your document.
            </div>
          )}
        </section>

        {/* TRANSLATE DOCUMENT */}
        <section style={styles.section}>
          <h2>🌐 Translate Document</h2>

          <p style={styles.description}>
            Understand your document in the language
            you are most comfortable with.
          </p>

          <div style={styles.translationControls}>
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
              style={styles.languageSelect}
            >
              <option value="Telugu">
                తెలుగు (Telugu)
              </option>

              <option value="Hindi">
                हिंदी (Hindi)
              </option>

              <option value="Tamil">
                தமிழ் (Tamil)
              </option>

              <option value="Kannada">
                ಕನ್ನಡ (Kannada)
              </option>

              <option value="Malayalam">
                മലയാളം (Malayalam)
              </option>

              <option value="English">
                English
              </option>
            </select>

            <button
              onClick={handleTranslate}
              disabled={translationLoading}
              style={styles.primaryButton}
            >
              {translationLoading
                ? "Translating..."
                : "🌐 Translate"}
            </button>
          </div>

          {translatedText && (
            <div style={styles.translationBox}>
              <h3>
                🌐 {language} Translation
              </h3>

              <div style={styles.answerText}>
                {translatedText}
              </div>
            </div>
          )}
        </section>

        {/* ASK DOCUMENT */}
        <section style={styles.section}>
          <h2>💬 Ask Your Document</h2>

          <p style={styles.description}>
            Ask anything about the content of this document.
          </p>

          <form
            onSubmit={handleAskQuestion}
            style={styles.questionForm}
          >
            <input
              type="text"
              placeholder="Ask anything about this document..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              style={styles.questionInput}
            />

            <button
              type="submit"
              disabled={questionLoading}
              style={styles.primaryButton}
            >
              {questionLoading
                ? "Thinking..."
                : "Ask AI"}
            </button>
          </form>

          {answer && (
            <div style={styles.answerBox}>
              <h3>🤖 PaperPal AI</h3>

              <div style={styles.answerText}>
                {answer}
              </div>
            </div>
          )}
        </section>

        {/* EXTRACTED TEXT */}
        <section style={styles.section}>
          <h2>📄 Extracted Text</h2>

          <p style={styles.description}>
            Text extracted from your uploaded document.
          </p>

          {document.extractedText ? (
            <div style={styles.textBox}>
              <pre style={styles.extractedText}>
                {document.extractedText}
              </pre>
            </div>
          ) : (
            <div style={styles.placeholder}>
              No text could be extracted from this document.
            </div>
          )}
        </section>

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
    cursor: "pointer",
  },

  backButton: {
    padding: "9px 15px",
    border: "1px solid #ddd",
    background: "white",
    borderRadius: "7px",
    cursor: "pointer",
  },

  main: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "35px 20px",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "18px",
  },

  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  documentHeader: {
    background: "white",
    padding: "28px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  },

  fileIcon: {
    fontSize: "38px",
    marginBottom: "8px",
  },

  fileName: {
    color: "#666",
    margin: "5px 0",
  },

  date: {
    color: "#999",
    fontSize: "13px",
  },

  deleteButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },

  section: {
    background: "white",
    padding: "28px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  description: {
    color: "#666",
    marginBottom: "18px",
    lineHeight: "1.6",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  placeholder: {
    padding: "30px",
    background: "#f8fafc",
    borderRadius: "8px",
    color: "#777",
    textAlign: "center",
  },

  aiContent: {
    background: "#eff6ff",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: "4px solid #2563eb",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },

  translationControls: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  languageSelect: {
    flex: 1,
    padding: "11px",
    borderRadius: "7px",
    border: "1px solid #ddd",
    fontSize: "15px",
    background: "white",
  },

  translationBox: {
    background: "#f0fdf4",
    padding: "20px",
    borderRadius: "10px",
    borderLeft: "4px solid #22c55e",
  },

  questionForm: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  questionInput: {
    flex: 1,
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "7px",
    fontSize: "15px",
  },

  answerBox: {
    background: "#eff6ff",
    padding: "20px",
    borderRadius: "10px",
    borderLeft: "4px solid #2563eb",
  },

  answerText: {
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },

  textBox: {
    maxHeight: "400px",
    overflowY: "auto",
    background: "#f8fafc",
    padding: "18px",
    borderRadius: "8px",
    border: "1px solid #eee",
  },

  extractedText: {
    whiteSpace: "pre-wrap",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
};

export default DocumentDetails;