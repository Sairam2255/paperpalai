const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  askLearnTopic,
} = require("../controllers/learnController");

// Ask PaperPal about any topic
router.post(
  "/topic",
  authMiddleware,
  askLearnTopic
);

module.exports = router;