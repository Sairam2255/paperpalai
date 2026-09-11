const express = require("express");

const router =
  express.Router();

const protect =
  require("../middleware/authMiddleware");

const {
  getGeminiSettings,
  saveGeminiKey,
  deleteGeminiKey,
} =
  require("../controllers/aiSettingsController");

router.get(
  "/gemini",
  protect,
  getGeminiSettings
);

router.post(
  "/gemini",
  protect,
  saveGeminiKey
);

router.delete(
  "/gemini",
  protect,
  deleteGeminiKey
);

module.exports = router;