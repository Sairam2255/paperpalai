const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  summarizeDocument,
  askDocumentQuestion,
  deleteDocument,
} = require("../controllers/documentController");

// ==========================================
// UPLOAD DOCUMENT
// ==========================================
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

// ==========================================
// GET ALL DOCUMENTS
// ==========================================
router.get(
  "/",
  authMiddleware,
  getMyDocuments
);

// ==========================================
// GET SINGLE DOCUMENT
// ==========================================
router.get(
  "/:id",
  authMiddleware,
  getDocumentById
);

// ==========================================
// SUMMARIZE DOCUMENT
// ==========================================
router.post(
  "/:id/summarize",
  authMiddleware,
  summarizeDocument
);

// ==========================================
// ASK QUESTION ABOUT DOCUMENT
// ==========================================
router.post(
  "/:id/ask",
  authMiddleware,
  askDocumentQuestion
);

// ==========================================
// DELETE DOCUMENT
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  deleteDocument
);

module.exports = router;