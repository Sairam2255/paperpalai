const Document = require("../models/Document");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

const {
  generateSummary,
  askQuestion,
  translateText,
} = require("../services/geminiService");

// ==========================================
// UPLOAD DOCUMENT
// ==========================================
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    let extractedText = "";

    // Extract text from PDF
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    }

    // Extract text from Image using OCR
    if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/jpg" ||
      req.file.mimetype === "image/png"
    ) {
      const result = await Tesseract.recognize(
        req.file.path,
        "eng"
      );

      extractedText = result.data.text;
    }

    // Save document
    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      extractedText,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY DOCUMENTS
// ==========================================
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      uploadedBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Documents fetched successfully",
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get Documents Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE DOCUMENT
// ==========================================
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json({
      message: "Document fetched successfully",
      document,
    });
  } catch (error) {
    console.error("Get Document Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GENERATE AI SUMMARY
// ==========================================
const summarizeDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (!document.extractedText?.trim()) {
      return res.status(400).json({
        message: "No text available to summarize",
      });
    }

    const summary = await generateSummary(
      document.extractedText
    );

    document.summary = summary;
    await document.save();

    res.status(200).json({
      message: "Document summarized successfully",
      summary,
    });
  } catch (error) {
    console.error("Summary Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ASK QUESTION ABOUT DOCUMENT
// ==========================================
const askDocumentQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        message: "Please provide a question",
      });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (!document.extractedText?.trim()) {
      return res.status(400).json({
        message: "No text available in this document",
      });
    }

    const answer = await askQuestion(
      document.extractedText,
      question
    );

    res.status(200).json({
      message: "Question answered successfully",
      question,
      answer,
    });
  } catch (error) {
    console.error("Question Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// TRANSLATE DOCUMENT
// ==========================================
const translateDocument = async (req, res) => {
  try {
    const { language, text } = req.body;

    if (!language?.trim()) {
      return res.status(400).json({
        message: "Please select a language",
      });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Priority:
    // 1. Text sent from frontend
    // 2. Saved summary
    // 3. Extracted document text
    const contentToTranslate =
      text ||
      document.summary ||
      document.extractedText;

    if (!contentToTranslate?.trim()) {
      return res.status(400).json({
        message: "No content available to translate",
      });
    }

    const translatedText = await translateText(
      contentToTranslate,
      language
    );

    res.status(200).json({
      message: "Text translated successfully",
      language,
      translatedText,
    });
  } catch (error) {
    console.error("Translation Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE DOCUMENT
// ==========================================
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Delete physical file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete MongoDB document
    await document.deleteOne();

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  summarizeDocument,
  askDocumentQuestion,
  translateDocument,
  deleteDocument,
};