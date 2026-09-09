const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  learnAnything,
  translateResponse,
  askAI,
  createQuiz,
  submitQuiz,
  getQuiz,
  getQuizHistory,
  getPreparationAnalytics,
} = require("../controllers/aiController");

/* =========================================================
   LEARNING
========================================================= */

router.post(
  "/learn",
  authMiddleware,
  learnAnything
);

router.post(
  "/translate",
  authMiddleware,
  translateResponse
);

router.post(
  "/ask",
  authMiddleware,
  askAI
);

/* =========================================================
   QUIZ
========================================================= */

router.post(
  "/quiz",
  authMiddleware,
  createQuiz
);

router.post(
  "/quiz/:id/submit",
  authMiddleware,
  submitQuiz
);

router.get(
  "/quiz/:id",
  authMiddleware,
  getQuiz
);

router.get(
  "/quizzes",
  authMiddleware,
  getQuizHistory
);

/* =========================================================
   PREPARATION ANALYTICS
========================================================= */

router.get(
  "/analytics",
  authMiddleware,
  getPreparationAnalytics
);

module.exports = router;