const mongoose = require("mongoose");

/* =========================================================
   CAREER PROFILE
========================================================= */

const careerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    careerGoal: {
      type: String,
      required: true,
      trim: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    resumeFileName: {
      type: String,
      default: "",
    },

    resumeFilePath: {
      type: String,
      default: "",
    },

    resumeFileType: {
      type: String,
      default: "",
    },

    resumeText: {
      type: String,
      default: "",
    },

    currentSkills: {
      type: [String],
      default: [],
    },

    skillsToImprove: {
      type: [String],
      default: [],
    },

    recommendedSkills: {
      type: [String],
      default: [],
    },

    careerReadiness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    roadmap: [
      {
        step: {
          type: Number,
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },

        status: {
          type: String,
          default: "Upcoming",
        },
      },
    ],

    aiAnalysis: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Career",
  careerSchema
);