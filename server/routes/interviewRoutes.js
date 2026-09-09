const express = require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  startInterview,
  submitInterviewAnswer,
  getInterview,
  getInterviewHistory,
} = require("../controllers/interviewController");


/* =====================================================
   START
===================================================== */

router.post(
  "/start",
  authMiddleware,
  startInterview
);


/* =====================================================
   HISTORY
===================================================== */

router.get(
  "/history",
  authMiddleware,
  getInterviewHistory
);


/* =====================================================
   ANSWER
===================================================== */

router.post(
  "/:id/answer",
  authMiddleware,
  submitInterviewAnswer
);


/* =====================================================
   SINGLE INTERVIEW
===================================================== */

router.get(
  "/:id",
  authMiddleware,
  getInterview
);


module.exports = router;