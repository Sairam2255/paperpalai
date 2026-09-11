const express = require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/resumeUploadMiddleware");

const {
  buildResume,
  enhanceResume,
  analyzeResume,
  getLatestResume,
  getResumeHistory,
} = require("../controllers/resumeController");

router.post(
  "/build",
  authMiddleware,
  buildResume
);

router.post(
  "/enhance",
  authMiddleware,
  upload.single("resume"),
  enhanceResume
);

router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),
  analyzeResume
);

router.get(
  "/latest",
  authMiddleware,
  getLatestResume
);

router.get(
  "/history",
  authMiddleware,
  getResumeHistory
);

module.exports = router;