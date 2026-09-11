const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const {
  decrypt,
} = require("../utils/encryption");

const {
  runWithAIKey,
} = require("../utils/aiContext");

const aiKeyMiddleware =
  async (
    req,
    res,
    next
  ) => {
    let personalKey =
      null;

    try {
      const header =
        req.headers.authorization ||
        "";

      const token =
        header.startsWith(
          "Bearer "
        )
          ? header
              .slice(7)
              .trim()
          : "";

      if (token) {
        const decoded =
          jwt.verify(
            token,
            process.env.JWT_SECRET
          );

        const user =
          await User.findById(
            decoded.userId
          )
            .select(
              "+geminiApiKeyEncrypted geminiApiKeyEnabled"
            )
            .lean();

        if (
          user?.geminiApiKeyEnabled &&
          user?.geminiApiKeyEncrypted
        ) {
          try {
            personalKey =
              decrypt(
                user.geminiApiKeyEncrypted
              );
          } catch (error) {
            console.error(
              "Personal Gemini key decrypt failed:",
              error.message
            );
          }
        }
      }
    } catch (error) {
      /*
       * Never block the request just because
       * BYOK context failed to load.
       *
       * Protected routes are still protected
       * by authMiddleware.
       */
    }

    return runWithAIKey(
      personalKey || null,
      () => next()
    );
  };

module.exports =
  aiKeyMiddleware;