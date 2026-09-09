const express = require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const careerUpload =
  require("../middleware/careerUploadMiddleware");

const {
  analyzeCareer,
  getLatestCareer,
  getCareerHistory,
} = require("../controllers/careerController");

/* =========================================================
   ANALYZE CAREER
========================================================= */

router.post(
  "/analyze",
  authMiddleware,
  careerUpload.single(
    "resume"
  ),
  analyzeCareer
);

/* =========================================================
   LATEST CAREER
========================================================= */

router.get(
  "/latest",
  authMiddleware,
  getLatestCareer
);

/* =========================================================
   CAREER HISTORY
========================================================= */

router.get(
  "/history",
  authMiddleware,
  getCareerHistory
);

module.exports = router;