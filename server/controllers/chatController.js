const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");

const {
  generateChatResponse,
} = require("../services/chatService");

/* =========================================================
   CREATE CONVERSATION
========================================================= */

const createConversation = async (req, res) => {
  try {
    const {
      title,
      type,
      document,
    } = req.body;

    const conversation =
      await Conversation.create({
        user: req.user._id,

        title:
          title?.trim() ||
          "New Chat",

        type:
          type || "general",

        document:
          document || null,

        messages: [],

        lastMessageAt: new Date(),
      });

    return res.status(201).json({
      message:
        "Conversation created successfully.",
      conversation,
    });
  } catch (error) {
    console.error(
      "Create Conversation Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create conversation.",
    });
  }
};

/* =========================================================
   GET CONVERSATIONS
========================================================= */

const getConversations = async (
  req,
  res
) => {
  try {
    const conversations =
      await Conversation.find({
        user: req.user._id,
      })
        .sort({
          lastMessageAt: -1,
        })
        .limit(50)
        .lean();

    const result = conversations.map(
      (conversation) => {
        const messages =
          conversation.messages || [];

        const lastMessage =
          messages.length
            ? messages[
                messages.length - 1
              ]
            : null;

        return {
          _id: conversation._id,
          title:
            conversation.title ||
            "New Chat",
          type:
            conversation.type ||
            "general",
          document:
            conversation.document || null,
          messageCount:
            messages.length,
          preview:
            lastMessage?.content ||
            "New conversation",
          lastMessageAt:
            conversation.lastMessageAt ||
            conversation.updatedAt ||
            conversation.createdAt,
          createdAt:
            conversation.createdAt,
          updatedAt:
            conversation.updatedAt,
        };
      }
    );

    return res.status(200).json({
      conversations: result,
    });
  } catch (error) {
    console.error(
      "Get Conversations Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load conversations.",
    });
  }
};

/* =========================================================
   GET SINGLE CONVERSATION
========================================================= */

const getConversation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    const conversation =
      await Conversation.findOne({
        _id: id,
        user: req.user._id,
      }).lean();

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    return res.status(200).json({
      conversation,
    });
  } catch (error) {
    console.error(
      "Get Conversation Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load conversation.",
    });
  }
};

/* =========================================================
   SEND MESSAGE
========================================================= */

const sendMessage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      message,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        message:
          "Message cannot be empty.",
      });
    }

    const conversation =
      await Conversation.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    const previousMessages =
      conversation.messages.map(
        (item) => ({
          role: item.role,
          content: item.content,
        })
      );

    const wasEmpty =
      previousMessages.length === 0;

    const userMessage =
      message.trim();

    const assistantResponse =
      await generateChatResponse(
        previousMessages,
        userMessage,
        conversation.type
      );

    conversation.messages.push({
      role: "user",
      content: userMessage,
    });

    conversation.messages.push({
      role: "assistant",
      content: assistantResponse,
    });

    if (
      wasEmpty &&
      conversation.title === "New Chat"
    ) {
      conversation.title =
        userMessage.length > 60
          ? `${userMessage.slice(0, 57)}...`
          : userMessage;
    }

    /* Keep database size reasonable */
    if (
      conversation.messages.length >
      100
    ) {
      conversation.messages =
        conversation.messages.slice(
          -100
        );
    }

    conversation.lastMessageAt =
      new Date();

    await conversation.save();

    return res.status(200).json({
      message:
        "Message sent successfully.",
      conversation,
      assistantMessage:
        assistantResponse,
    });
  } catch (error) {
    console.error(
      "Send Message Error:",
      error
    );

    return res.status(
      error.status || 500
    ).json({
      message:
        error.message ||
        "Failed to send message.",
    });
  }
};

/* =========================================================
   RENAME
========================================================= */

const renameConversation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      title,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        message:
          "Chat title cannot be empty.",
      });
    }

    const conversation =
      await Conversation.findOneAndUpdate(
        {
          _id: id,
          user: req.user._id,
        },
        {
          $set: {
            title:
              title.trim().slice(0, 120),
          },
        },
        {
          new: true,
        }
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    return res.status(200).json({
      message:
        "Conversation renamed successfully.",
      conversation,
    });
  } catch (error) {
    console.error(
      "Rename Conversation Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to rename conversation.",
    });
  }
};

/* =========================================================
   DELETE
========================================================= */

const deleteConversation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid conversation ID.",
      });
    }

    const conversation =
      await Conversation.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found.",
      });
    }

    return res.status(200).json({
      message:
        "Conversation deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Conversation Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete conversation.",
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  renameConversation,
  deleteConversation,
};