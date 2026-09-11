const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const aiKeyMiddleware =
  require("./middleware/aiKeyMiddleware");

const authMiddleware =
  require("./middleware/authMiddleware");

const upload =
  require("./middleware/resumeUploadMiddleware");

const {
  analyzeResume,
} = require("./controllers/resumeController");

const authRoutes =
  require("./routes/authRoutes");

const documentRoutes =
  require("./routes/documentRoutes");

const aiRoutes =
  require("./routes/aiRoutes");

const careerRoutes =
  require("./routes/careerRoutes");

const interviewRoutes =
  require("./routes/interviewRoutes");

const resumeRoutes =
  require("./routes/resumeRoutes");

const aiSettingsRoutes =
  require("./routes/aiSettingsRoutes");

// ✅ CHAT ROUTES
const chatRoutes =
  require("./routes/chatRoutes");

const app = express();

/* =========================================================
   DEBUG
========================================================= */

console.log(
  "🔥 PAPERPAL SERVER FILE LOADED"
);

console.log(
  "🔥 SERVER FILE:",
  __filename
);

const PORT =
  process.env.PORT || 5000;

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://paperpalai.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          `CORS blocked origin: ${origin}`
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================================================
   PERSONAL GEMINI KEY CONTEXT
========================================================= */

app.use(
  aiKeyMiddleware
);

/* =========================================================
   NORMAL API ROUTES
========================================================= */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/documents",
  documentRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/ai-settings",
  aiSettingsRoutes
);

app.use(
  "/api/career",
  careerRoutes
);

app.use(
  "/api/interview",
  interviewRoutes
);

/* =========================================================
   DIRECT ATS RESUME ANALYSIS ROUTE
========================================================= */

console.log(
  "🔥 REGISTERING POST /api/resume/analyze"
);

app.post(
  "/api/resume/analyze",
  authMiddleware,
  upload.single("resume"),
  (req, res, next) => {
    console.log(
      "🔥 /api/resume/analyze ROUTE HIT"
    );

    analyzeResume(
      req,
      res,
      next
    );
  }
);

/* =========================================================
   OTHER RESUME ROUTES
========================================================= */

app.use(
  "/api/resume",
  resumeRoutes
);

/* =========================================================
   CHAT ROUTES
========================================================= */

console.log(
  "🔥 REGISTERING CHAT ROUTES /api/chat"
);

app.use(
  "/api/chat",
  chatRoutes
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      message:
        "PaperPal AI Backend is Running 🚀",
    });
  }
);

/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server Error:",
      error
    );

    return res.status(
      error.status || 500
    ).json({
      message:
        error.message ||
        "Internal server error.",
    });
  }
);

/* =========================================================
   START
========================================================= */

const startServer =
  async () => {
    try {
      await connectDB();

      app.listen(
        PORT,
        () => {
          console.log(
            `PaperPal AI server running on port ${PORT} 🚀`
          );
        }
      );
    } catch (error) {
      console.error(
        "Database connection / server startup failed:",
        error
      );

      process.exit(1);
    }
  };

startServer();