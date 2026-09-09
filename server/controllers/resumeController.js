const Resume = require("../models/Resume");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const {
  generateResume,
  enhanceResume: generateEnhancedResume,
} = require("../services/geminiService");


const parseJsonField = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};


const validateJobDescription = (jobDescription) => {
  if (!jobDescription || !jobDescription.trim()) {
    const error = new Error(
      "Please provide the job description and requirements."
    );

    error.status = 400;
    throw error;
  }

  if (jobDescription.length > 30000) {
    const error = new Error(
      "Job description is too long. Please keep it below 30,000 characters."
    );

    error.status = 400;
    throw error;
  }
};


const extractResumeText = async (file) => {
  if (!file || !file.path) {
    throw new Error("Resume file is missing.");
  }

  if (file.mimetype === "application/pdf") {
    const buffer = fs.readFileSync(file.path);
    const data = await pdfParse(buffer);

    return data.text || "";
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      path: file.path,
    });

    return result.value || "";
  }

  throw new Error(
    "Unsupported resume file type. Only PDF and DOCX are allowed."
  );
};


/* =========================================================
   BUILD NEW RESUME
========================================================= */

const buildResume = async (req, res) => {
  try {
    const body = req.body || {};

    const personalDetails = parseJsonField(
      body.personalDetails,
      {}
    );

    const education = parseJsonField(
      body.education,
      []
    );

    const experience = parseJsonField(
      body.experience,
      []
    );

    const projects = parseJsonField(
      body.projects,
      []
    );

    const targetRole =
      body.targetRole?.trim() || "";

    const jobDescription =
      body.jobDescription?.trim() || "";

    const summary =
      body.summary?.trim() || "";

    const skills =
      body.skills || "";

    const tools =
      body.tools || "";

    const softSkills =
      body.softSkills || "";

    const certifications =
      body.certifications || "";

    const achievements =
      body.achievements || "";


    if (
      !personalDetails?.fullName ||
      !personalDetails.fullName.trim()
    ) {
      return res.status(400).json({
        message: "Please provide your full name.",
      });
    }

    if (!targetRole) {
      return res.status(400).json({
        message: "Please provide the target role.",
      });
    }

    validateJobDescription(jobDescription);


    console.log(
      "Building resume for:",
      targetRole
    );


    const generated = await generateResume(
      {
        personalDetails,
        summary,
        education,
        experience,
        skills,
        tools,
        softSkills,
        certifications,
        achievements,
        projects,
      },
      jobDescription,
      targetRole
    );


    if (!generated || typeof generated !== "object") {
      throw new Error(
        "AI returned an invalid resume response."
      );
    }


    const resume = await Resume.create({
      user: req.user._id,

      mode: "build",

      targetRole,

      jobDescription,

      title:
        generated.title ||
        `${targetRole} Resume`,

      atsScore:
        Number(generated.atsScore) || 0,

      matchedKeywords:
        Array.isArray(generated.matchedKeywords)
          ? generated.matchedKeywords
          : [],

      missingKeywords:
        Array.isArray(generated.missingKeywords)
          ? generated.missingKeywords
          : [],

      personalDetails:
        generated.personalDetails ||
        personalDetails,

      summary:
        generated.summary ||
        summary,

      skills:
        Array.isArray(generated.skills)
          ? generated.skills
          : [],

      education:
        Array.isArray(generated.education)
          ? generated.education
          : education,

      experience:
        Array.isArray(generated.experience)
          ? generated.experience
          : experience,

      projects:
        Array.isArray(generated.projects)
          ? generated.projects
          : projects,

      certifications:
        Array.isArray(generated.certifications)
          ? generated.certifications
          : [],

      achievements:
        Array.isArray(generated.achievements)
          ? generated.achievements
          : [],
    });


    return res.status(201).json({
      message: "Resume built successfully.",
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


/* =========================================================
   ENHANCE EXISTING RESUME
========================================================= */

const enhanceResume = async (req, res) => {
  let uploadedFilePath = null;
  let resumeSaved = false;

  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Please upload an existing resume.",
      });
    }

    uploadedFilePath = req.file.path;

    const targetRole =
      req.body.targetRole?.trim() || "";

    const jobDescription =
      req.body.jobDescription?.trim() || "";


    if (!targetRole) {
      return res.status(400).json({
        message:
          "Please provide the target role.",
      });
    }

    validateJobDescription(
      jobDescription
    );


    console.log(
      "Extracting resume:",
      req.file.originalname
    );


    const extractedText =
      await extractResumeText(
        req.file
      );


    if (
      !extractedText ||
      !extractedText.trim()
    ) {
      return res.status(400).json({
        message:
          "Could not extract readable text from the resume.",
      });
    }


    const limitedResumeText =
      extractedText.slice(
        0,
        30000
      );


    console.log(
      "Extracted characters:",
      limitedResumeText.length
    );


    const generated =
      await generateEnhancedResume(
        limitedResumeText,
        jobDescription,
        targetRole
      );


    if (
      !generated ||
      typeof generated !== "object"
    ) {
      throw new Error(
        "AI returned an invalid enhanced resume response."
      );
    }


    const resume =
      await Resume.create({
        user:
          req.user._id,

        mode:
          "enhance",

        targetRole,

        jobDescription,

        originalFileName:
          req.file.originalname,

        originalFilePath:
          req.file.path,

        title:
          generated.title ||
          `${targetRole} Resume`,

        atsScore:
          Number(
            generated.atsScore
          ) || 0,

        matchedKeywords:
          Array.isArray(
            generated.matchedKeywords
          )
            ? generated.matchedKeywords
            : [],

        missingKeywords:
          Array.isArray(
            generated.missingKeywords
          )
            ? generated.missingKeywords
            : [],

        personalDetails:
          generated.personalDetails ||
          {},

        summary:
          generated.summary ||
          "",

        skills:
          Array.isArray(
            generated.skills
          )
            ? generated.skills
            : [],

        education:
          Array.isArray(
            generated.education
          )
            ? generated.education
            : [],

        experience:
          Array.isArray(
            generated.experience
          )
            ? generated.experience
            : [],

        projects:
          Array.isArray(
            generated.projects
          )
            ? generated.projects
            : [],

        certifications:
          Array.isArray(
            generated.certifications
          )
            ? generated.certifications
            : [],

        achievements:
          Array.isArray(
            generated.achievements
          )
            ? generated.achievements
            : [],
      });


    resumeSaved = true;


    return res.status(201).json({
      message:
        "Resume enhanced successfully.",

      resume,
    });

  } catch (error) {
    console.error(
      "Enhance Resume Error:",
      error
    );


    if (
      !resumeSaved &&
      uploadedFilePath &&
      fs.existsSync(
        uploadedFilePath
      )
    ) {
      try {
        fs.unlinkSync(
          uploadedFilePath
        );
      } catch (cleanupError) {
        console.error(
          "Cleanup Error:",
          cleanupError.message
        );
      }
    }


    return res.status(
      error.status || 500
    ).json({
      message:
        error.message ||
        "Failed to enhance resume.",
    });
  }
};


/* =========================================================
   GET LATEST RESUME
========================================================= */

const getLatestResume = async (
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

    return res.status(200).json({
      resume,
    });

  } catch (error) {
    console.error(
      "Get Latest Resume Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load latest resume.",
    });
  }
};


/* =========================================================
   GET RESUME HISTORY
========================================================= */

const getResumeHistory = async (
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

    return res.status(200).json({
      resumes,
    });

  } catch (error) {
    console.error(
      "Get Resume History Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load resume history.",
    });
  }
};


/* =========================================================
   GET RESUME BY ID
========================================================= */

const getResumeById = async (
  req,
  res
) => {
  try {
    const resume =
      await Resume.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!resume) {
      return res.status(404).json({
        message:
          "Resume not found.",
      });
    }

    return res.status(200).json({
      resume,
    });

  } catch (error) {
    console.error(
      "Get Resume By ID Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load resume.",
    });
  }
};


/* =========================================================
   DELETE RESUME
========================================================= */

const deleteResume = async (
  req,
  res
) => {
  try {
    const resume =
      await Resume.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!resume) {
      return res.status(404).json({
        message:
          "Resume not found.",
      });
    }


    if (
      resume.originalFilePath &&
      fs.existsSync(
        resume.originalFilePath
      )
    ) {
      try {
        fs.unlinkSync(
          resume.originalFilePath
        );
      } catch (fileError) {
        console.error(
          "File deletion error:",
          fileError.message
        );
      }
    }


    await resume.deleteOne();


    return res.status(200).json({
      message:
        "Resume deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Resume Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete resume.",
    });
  }
};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  buildResume,
  enhanceResume,
  getLatestResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
};