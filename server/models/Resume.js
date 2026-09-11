const mongoose =
  require("mongoose");

const resumeSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      mode: {
        type: String,

        enum: [
          "build",
          "enhance",
          "analyze",
        ],

        required: true,

        index: true,
      },

      targetRole: {
        type: String,

        default: "",

        trim: true,
      },

      jobDescription: {
        type: String,

        default: "",
      },

      originalFileName: {
        type: String,

        default: "",
      },

      originalFilePath: {
        type: String,

        default: "",
      },

      title: {
        type: String,

        default:
          "PaperPal Resume",
      },

      atsScore: {
        type: Number,

        default: 0,

        min: 0,

        max: 100,
      },

      jobMatchPercentage: {
        type: Number,

        default: 0,

        min: 0,

        max: 100,
      },

      experienceFitPercentage: {
        type: Number,

        default: 0,

        min: 0,

        max: 100,
      },

      matchedSkills: {
        type: [String],

        default: [],
      },

      missingSkills: {
        type: [String],

        default: [],
      },

      matchedKeywords: {
        type: [String],

        default: [],
      },

      missingKeywords: {
        type: [String],

        default: [],
      },

      improvementSuggestions: {
        type: [String],

        default: [],
      },

      personalDetails: {
        fullName: {
          type: String,
          default: "",
        },

        email: {
          type: String,
          default: "",
        },

        phone: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },

        linkedin: {
          type: String,
          default: "",
        },

        github: {
          type: String,
          default: "",
        },

        portfolio: {
          type: String,
          default: "",
        },
      },

      summary: {
        type: String,

        default: "",
      },

      skills: {
        type: [String],

        default: [],
      },

      education: {
        type: [
          mongoose.Schema.Types.Mixed,
        ],

        default: [],
      },

      experience: {
        type: [
          mongoose.Schema.Types.Mixed,
        ],

        default: [],
      },

      projects: {
        type: [
          mongoose.Schema.Types.Mixed,
        ],

        default: [],
      },

      certifications: {
        type: [String],

        default: [],
      },

      achievements: {
        type: [String],

        default: [],
      },
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Resume",
    resumeSchema
  );