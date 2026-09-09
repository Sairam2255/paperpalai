const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    expectedAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    userAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    betterAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    score: {
      type: Number,
      default: null,
      min: 0,
      max: 10,
    },

    answered: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["technical", "hr", "mock"],
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    questions: {
      type: [interviewQuestionSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0 && value.length <= 5;
        },
        message:
          "Interview must contain between 1 and 5 questions.",
      },
    },

    currentQuestion: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuestions: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    totalScore: {
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

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // FINAL AI ANALYSIS
    // ==========================================

    overallFeedback: {
      type: String,
      default: "",
      trim: true,
    },

    interviewTips: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    areasOfImprovement: {
      type: [String],
      default: [],
    },

    recommendation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Interview =
  mongoose.model(
    "Interview",
    interviewSchema
  );

module.exports = Interview;