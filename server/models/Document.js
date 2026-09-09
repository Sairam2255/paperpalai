const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    // ==========================================
    // AI GENERATED DOCUMENT SUMMARY
    // ==========================================
    summary: {
      type: String,
      default: "",
    },

    // ==========================================
    // AI BILL ANALYSIS CACHE
    // ==========================================
    billAnalysis: {
      type: String,
      default: "",
    },

    // ==========================================
    // TRANSLATIONS CACHE
    // Example:
    // {
    //   Telugu: "...",
    //   Hindi: "..."
    // }
    // ==========================================
    translations: {
      type: Map,
      of: String,
      default: {},
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model(
  "Document",
  documentSchema
);

module.exports = Document;