const User = require("../models/User");

const {
  encryptSecret,
} = require("../utils/encryption");

/* =====================================================
   GET GEMINI SETTINGS
===================================================== */

const getGeminiSettings =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user._id
        ).select(
          "geminiApiKeyEnabled geminiApiKeyEncrypted"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User account not found.",
        });
      }

      return res.status(200).json({
        enabled:
          Boolean(
            user.geminiApiKeyEnabled &&
            user.geminiApiKeyEncrypted
          ),

        hasKey:
          Boolean(
            user.geminiApiKeyEncrypted
          ),
      });
    } catch (error) {
      console.error(
        "Get Gemini Settings Error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load Gemini settings.",
      });
    }
  };

/* =====================================================
   SAVE GEMINI API KEY
===================================================== */

const saveGeminiKey =
  async (req, res) => {
    try {
      const apiKey =
        String(
          req.body?.apiKey || ""
        ).trim();

      if (!apiKey) {
        return res.status(400).json({
          message:
            "Please provide a Gemini API key.",
        });
      }

      if (apiKey.length < 20) {
        return res.status(400).json({
          message:
            "The Gemini API key appears to be invalid.",
        });
      }

      const encrypted =
        encryptSecret(apiKey);

      await User.findByIdAndUpdate(
        req.user._id,
        {
          geminiApiKeyEncrypted:
            encrypted,

          geminiApiKeyEnabled:
            true,
        }
      );

      return res.status(200).json({
        message:
          "Your personal Gemini API key has been saved securely.",
        enabled: true,
        hasKey: true,
      });
    } catch (error) {
      console.error(
        "Save Gemini Key Error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to save Gemini API key.",
      });
    }
  };

/* =====================================================
   REMOVE GEMINI API KEY
===================================================== */

const deleteGeminiKey =
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          geminiApiKeyEncrypted: "",
          geminiApiKeyEnabled: false,
        }
      );

      return res.status(200).json({
        message:
          "Your personal Gemini API key has been removed.",
        enabled: false,
        hasKey: false,
      });
    } catch (error) {
      console.error(
        "Delete Gemini Key Error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to remove Gemini API key.",
      });
    }
  };

module.exports = {
  getGeminiSettings,
  saveGeminiKey,
  deleteGeminiKey,
};