const express = require("express");

const router = express.Router();

const {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  renameConversation,
  deleteConversation,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

// Create conversation
router.post(
  "/",
  authMiddleware,
  createConversation
);

// Get all conversations
router.get(
  "/",
  authMiddleware,
  getConversations
);

// Get one conversation
router.get(
  "/:id",
  authMiddleware,
  getConversation
);

// Send message
router.post(
  "/:id/message",
  authMiddleware,
  sendMessage
);

// Rename conversation
router.patch(
  "/:id",
  authMiddleware,
  renameConversation
);

// Delete conversation
router.delete(
  "/:id",
  authMiddleware,
  deleteConversation
);

module.exports = router;