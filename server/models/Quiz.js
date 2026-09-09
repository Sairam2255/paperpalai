const mongoose = require("mongoose");

/* =========================================================
   QUIZ QUESTION
========================================================= */

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 4;
        },
        message: "Each question must have exactly 4 options.",
      },
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

/* =========================================================
   USER ANSWER
========================================================= */

const userAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    selectedAnswer: {
      type: Number,
      default: null,
      min: 0,
      max: 3,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   QUIZ
========================================================= */

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      default: "Beginner",
      trim: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0 && value.length <= 50;
        },
        message: "Quiz must contain between 1 and 50 questions.",
      },
    },

    answers: {
      type: [userAnswerSchema],
      default: [],
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },

    score: {
      type: Number,
      default: null,
      min: 0,
    },

    percentage: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    submitted: {
      type: Boolean,
      default: false,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);