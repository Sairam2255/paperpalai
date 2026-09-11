const fs = require("fs");
const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const {
  generateResume,
  enhanceResume,
  analyzeResumeJobMatch,
} = require("../services/geminiService");

const removeUploadedFile = (file) => {
  if (!file?.path) return;

  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (error) {
    console.warn(
      "Resume file cleanup failed:",
      error.message
    );
  }
};

const extractResumeText = async (file) => {
  if (!file?.path) {
    const error = new Error(
      "Resume file is missing."
    );

    error.status = 400;
    throw error;
  }

  if (
    file.mimetype ===
    "application/pdf"
  ) {
    const buffer =
      fs.readFileSync(
        file.path
      );

    const data =
      await pdfParse(
        buffer
      );

    return data.text || "";
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result =
      await mammoth.extractRawText(
        {
          path: file.path,
        }
      );

    return result.value || "";
  }

  const error = new Error(
    "Unsupported resume file type."
  );

  error.status = 400;
  throw error;
};

const validateJobDescription = (
  jobDescription
) => {
  const value = String(
    jobDescription || ""
  ).trim();

  if (!value) {
    const error = new Error(
      "Please provide the job description and requirements."
    );

    error.status = 400;
    throw error;
  }

  if (value.length > 30000) {
    const error = new Error(
      "Job description is too long. Please keep it below 30,000 characters."
    );

    error.status = 400;
    throw error;
  }
};

const buildResume = async (
  req,
  res
) => {
  try {
    validateJobDescription(
      req.body?.jobDescription
    );

    const generated =
      await generateResume(
        {
          personalDetails:
            req.body?.personalDetails ||
            {},

          summary:
            req.body?.summary ||
            "",

          education:
            req.body?.education ||
            [],

          experience:
            req.body?.experience ||
            [],

          skills:
            req.body?.skills ||
            "",

          tools:
            req.body?.tools ||
            "",

          softSkills:
            req.body?.softSkills ||
            "",

          certifications:
            req.body
              ?.certifications ||
            "",

          achievements:
            req.body
              ?.achievements ||
            "",

          projects:
            req.body?.projects ||
            [],

          targetRole:
            req.body?.targetRole ||
            "",
        },
        req.body.jobDescription
      );

    const resume =
      await Resume.create({
        user: req.user._id,

        mode: "build",

        targetRole:
          req.body?.targetRole ||
          "",

        jobDescription:
          req.body.jobDescription,

        ...generated,
      });

    return res.status(201).json({
      message:
        "Resume built successfully.",

      resume,
    });
  } catch (error) {
    console.error(
      "Build Resume Error:",
      error
    );

    return res.status(
      error.status || 500
    ).json({
      message:
        error.message ||
        "Failed to build resume.",
    });
  }
};

const enhanceResumeController =
  async (
    req,
    res
  ) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "Please upload an existing resume.",
          });
      }

      validateJobDescription(
        req.body?.jobDescription
      );

      const extractedText =
        await extractResumeText(
          req.file
        );

      if (
        !extractedText.trim()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Could not extract readable text from the resume.",
          });
      }

      const generated =
        await enhanceResume(
          extractedText.slice(
            0,
            30000
          ),
          req.body
            .jobDescription,

          req.body?.targetRole ||
            ""
        );

      const resume =
        await Resume.create({
          user: req.user._id,

          mode: "enhance",

          targetRole:
            req.body
              ?.targetRole || "",

          jobDescription:
            req.body
              .jobDescription,

          originalFileName:
            req.file
              .originalname,

          originalFilePath:
            req.file.path,

          ...generated,
        });

      return res
        .status(201)
        .json({
          message:
            "Resume enhanced successfully.",

          resume,
        });
    } catch (error) {
      console.error(
        "Enhance Resume Error:",
        error
      );

      removeUploadedFile(
        req.file
      );

      return res
        .status(
          error.status || 500
        )
        .json({
          message:
            error.message ||
            "Failed to enhance resume.",
        });
    }
  };

const analyzeResume =
  async (
    req,
    res
  ) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "Please upload your resume.",
          });
      }

      validateJobDescription(
        req.body
          ?.jobDescription
      );

      const extractedText =
        await extractResumeText(
          req.file
        );

      if (
        !extractedText.trim()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Could not extract readable text from the resume.",
          });
      }

      const result =
        await analyzeResumeJobMatch(
          extractedText.slice(
            0,
            30000
          ),

          req.body
            .jobDescription,

          req.body
            ?.targetRole || ""
        );

      const resume =
        await Resume.create({
          user: req.user._id,

          mode: "analyze",

          targetRole:
            req.body
              ?.targetRole || "",

          jobDescription:
            req.body
              .jobDescription,

          originalFileName:
            req.file
              .originalname,

          originalFilePath:
            req.file.path,

          title:
            "ATS Resume Analysis",

          ...result,
        });

      return res
        .status(201)
        .json({
          message:
            "Resume analyzed successfully.",

          analysis: resume,
        });
    } catch (error) {
      console.error(
        "ATS Resume Analysis Error:",
        error
      );

      removeUploadedFile(
        req.file
      );

      return res
        .status(
          error.status || 500
        )
        .json({
          message:
            error.message ||
            "Failed to analyze resume.",
        });
    }
  };

const getLatestResume =
  async (
    req,
    res
  ) => {
    try {
      const resume =
        await Resume.findOne({
          user: req.user._id,
        }).sort({
          createdAt: -1,
        });

      return res
        .status(200)
        .json({
          resume,
        });
    } catch (error) {
      console.error(
        "Latest Resume Error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to load latest resume.",
        });
    }
  };

const getResumeHistory =
  async (
    req,
    res
  ) => {
    try {
      const resumes =
        await Resume.find({
          user: req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .limit(20);

      return res
        .status(200)
        .json({
          resumes,
        });
    } catch (error) {
      console.error(
        "Resume History Error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to load resume history.",
        });
    }
  };

module.exports = {
  buildResume,

  enhanceResume:
    enhanceResumeController,

  analyzeResume,

  getLatestResume,

  getResumeHistory,
};