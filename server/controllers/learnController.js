const { learnTopic } = require("../services/geminiService");

// ==========================================
// LEARN ANY TOPIC
// ==========================================
const askLearnTopic = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim() === "") {
      return res.status(400).json({
        message: "Please enter a topic",
      });
    }

    const answer = await learnTopic(topic);

    res.status(200).json({
      message: "Topic explained successfully",
      topic,
      answer,
    });
  } catch (error) {
    console.error("Learn Topic Error:", error);

    // Gemini quota handling
    if (
      error.status === 429 ||
      error.code === 429 ||
      error.message?.includes("quota")
    ) {
      return res.status(429).json({
        message:
          "AI request limit reached. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      message: "Failed to generate learning response",
      error: error.message,
    });
  }
};

module.exports = {
  askLearnTopic,
};