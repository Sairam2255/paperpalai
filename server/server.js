const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const careerRoutes = require("./routes/careerRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const chatRoutes = require("./routes/chatRoutes");

// ==========================================
// APP
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// DATABASE
// ==========================================
connectDB();

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  // Production frontend
  "https://paperpalai.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no Origin header
      // such as Postman or server-side requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(
        `CORS blocked origin: ${origin}`
      );

      return callback(
        new Error(
          `CORS blocked origin: ${origin}`
        )
      );
    },

    credentials: true,

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
  })
);

// ==========================================
// BODY PARSER
// ==========================================
app.use(
  express.json({
    limit: "10mb",
  })
);

// ==========================================
// GOOGLE POPUP / CROSS-ORIGIN COMPATIBILITY
// ==========================================
app.use((req, res, next) => {
  res.setHeader(
    "Cross-Origin-Opener-Policy",
    "unsafe-none"
  );

  next();
});

// ==========================================
// API ROUTES
// ==========================================

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
  "/api/career",
  careerRoutes
);

app.use(
  "/api/interview",
  interviewRoutes
);

app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "PaperPal AI Backend is Running 🚀",
  });
});

// ==========================================
// 404 HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================
app.use(
  (error, req, res, next) => {
    console.error(
      "Server Error:",
      error
    );

    // CORS errors
    if (
      error.message?.startsWith(
        "CORS blocked origin:"
      )
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Internal server error.",
    });
  }
);

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(
    `PaperPal AI server running on port ${PORT} 🚀`
  );

  console.log(
    "Allowed origins:",
    allowedOrigins
  );
});