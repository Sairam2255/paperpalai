const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const resumeUpload = require("../middleware/resumeUploadMiddleware");

const {
  buildResume,
  enhanceResume,
  getLatestResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeController");


/* =====================================================
   BUILD NEW RESUME
===================================================== */

router.post(
  "/build",
  authMiddleware,
  buildResume
);


/* =====================================================
   ENHANCE EXISTING RESUME
===================================================== */

router.post(
  "/enhance",
  authMiddleware,
  resumeUpload.single("resume"),
  enhanceResume
);


/* =====================================================
   GET LATEST RESUME
===================================================== */

router.get(
  "/latest",
  authMiddleware,
  getLatestResume
);


/* =====================================================
   GET RESUME HISTORY
===================================================== */

router.get(
  "/history",
  authMiddleware,
  getResumeHistory
);


/* =====================================================
   GET RESUME BY ID
===================================================== */

router.get(
  "/:id",
  authMiddleware,
  getResumeById
);


/* =====================================================
   DELETE RESUME
===================================================== */

router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);


/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;