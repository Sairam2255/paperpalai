const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const Career = require("../models/Career");

const {
  generateCareerAnalysis,
} = require("../services/geminiService");

/* =========================================================
   EXTRACT PDF
========================================================= */

const extractPdfText = async (filePath) => {
  const buffer = fs.readFileSync(filePath);

  const data = await pdfParse(buffer);

  return data.text || "";
};

/* =========================================================
   EXTRACT DOCX
========================================================= */

const extractDocxText = async (filePath) => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result.value || "";
};

/* =========================================================
   ANALYZE CAREER
========================================================= */

const analyzeCareer = async (req, res) => {
  try {
    const { careerGoal, targetRole } = req.body;

    /* -----------------------------------------------------
       VALIDATE CAREER GOAL
    ----------------------------------------------------- */

    if (!careerGoal || !careerGoal.trim()) {
      return res.status(400).json({
        message: "Career goal is required.",
      });
    }

    /* -----------------------------------------------------
       VALIDATE TARGET ROLE
    ----------------------------------------------------- */

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        message: "Target career role is required.",
      });
    }

    /* -----------------------------------------------------
       RESUME IS OPTIONAL
    ----------------------------------------------------- */

    let resumeText = "";
    let resumeFileName = "";
    let resumeFilePath = "";
    let resumeFileType = "";

    if (req.file) {
      resumeFileName = req.file.originalname;
      resumeFilePath = req.file.path;
      resumeFileType = req.file.mimetype;

      /* ---------------------------------------------------
         PDF
      --------------------------------------------------- */

      if (
        req.file.mimetype ===
        "application/pdf"
      ) {
        resumeText = await extractPdfText(
          req.file.path
        );
      }

      /* ---------------------------------------------------
         DOCX
      --------------------------------------------------- */

      else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        resumeText = await extractDocxText(
          req.file.path
        );
      }

      /* ---------------------------------------------------
         UNSUPPORTED FILE
      --------------------------------------------------- */

      else {
        return res.status(400).json({
          message:
            "Please upload a PDF or DOCX resume.",
        });
      }

      /* ---------------------------------------------------
         FILE EXISTS BUT TEXT COULD NOT BE EXTRACTED
      --------------------------------------------------- */

      if (!resumeText.trim()) {
        return res.status(400).json({
          message:
            "Unable to extract text from the resume. Please upload a text-based PDF or DOCX resume.",
        });
      }
    }

    /* -----------------------------------------------------
       LIMIT RESUME TEXT
    ----------------------------------------------------- */

    const limitedResumeText = resumeText
      .trim()
      .slice(0, 30000);

    /* -----------------------------------------------------
       AI CAREER ANALYSIS

       When there is no resume, the AI receives a clear
       indication that the analysis should be based only
       on the career goal and target role.
    ----------------------------------------------------- */

    const analysis = await generateCareerAnalysis(
      careerGoal.trim(),
      targetRole.trim(),
      limitedResumeText ||
        "No resume was provided. Base the analysis on the career goal and target role only."
    );

    /* -----------------------------------------------------
       SAVE CAREER PROFILE
    ----------------------------------------------------- */

    const career = await Career.create({
      user: req.user._id,

      careerGoal: careerGoal.trim(),

      targetRole: targetRole.trim(),

      resumeFileName: resumeFileName || "",

      resumeFilePath: resumeFilePath || "",

      resumeFileType: resumeFileType || "",

      resumeText: limitedResumeText || "",

      currentSkills:
        analysis.currentSkills,

      skillsToImprove:
        analysis.skillsToImprove,

      recommendedSkills:
        analysis.recommendedSkills,

      careerReadiness:
        analysis.careerReadiness,

      roadmap:
        analysis.roadmap,

      aiAnalysis:
        analysis.analysis,
    });

    return res.status(201).json({
      message:
        "Career analysis generated successfully.",

      career,
    });
  } catch (error) {
    console.error(
      "Career Analysis Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to analyze career profile.",
    });
  }
};

/* =========================================================
   GET LATEST CAREER PROFILE
========================================================= */

const getLatestCareer = async (req, res) => {
  try {
    const career = await Career.findOne({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      career,
    });
  } catch (error) {
    console.error(
      "Get Career Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to load career profile.",
    });
  }
};

/* =========================================================
   GET CAREER HISTORY
========================================================= */

const getCareerHistory = async (req, res) => {
  try {
    const careers = await Career.find({
      user: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .select(
        "careerGoal targetRole careerReadiness resumeFileName createdAt"
      );

    return res.status(200).json({
      careers,
    });
  } catch (error) {
    console.error(
      "Career History Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to load career history.",
    });
  }
};

module.exports = {
  analyzeCareer,
  getLatestCareer,
  getCareerHistory,
};