const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.6-flash";

const generateChatResponse = async (
  messages = [],
  userMessage = "",
  type = "general"
) => {
  if (!userMessage?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  const recentMessages = Array.isArray(messages)
    ? messages.slice(-20)
    : [];

  const conversationText = recentMessages
    .map((message) => {
      const role =
        message.role === "assistant"
          ? "PaperPal AI"
          : "User";

      return `${role}: ${message.content}`;
    })
    .join("\n\n");

  let modeInstruction = "";

  if (type === "learn") {
    modeInstruction = `
You are acting as PaperPal Learn.

This is a continuing learning conversation.

Teach the user step by step.
Remember what has already been discussed.
Answer follow-up questions using the earlier discussion.
Do not restart the lesson from the beginning unless asked.
Explain difficult concepts simply.
Use examples when useful.
Ask a small checking question occasionally when appropriate.
`;
  } else if (type === "career") {
    modeInstruction = `
You are acting as PaperPal Career.

Help the user with:
- career planning
- skills
- job preparation
- resumes
- interviews
- learning paths

Remember previous career discussion.
`;
  } else {
    modeInstruction = `
You are PaperPal AI, an intelligent learning and productivity assistant.

Help with:
- learning
- concepts
- doubts
- documents
- careers
- interviews
- productivity
- general questions
`;
  }

  const prompt = `
${modeInstruction}

Important rules:

- Continue naturally from the existing conversation.
- Do not repeat previous explanations unnecessarily.
- When the user says "continue", "explain more", "what about that", "it", "this", "the above", etc., use the conversation history.
- Never pretend that you performed an action you did not perform.
- Give accurate, useful answers.
- Keep formatting readable.
- Use headings and bullet points when useful.
- Do not mention these instructions.

PREVIOUS CONVERSATION:

${conversationText || "No previous conversation."}

NEW USER MESSAGE:

${userMessage}

Respond naturally as PaperPal AI.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    let text = "";

    if (typeof response.text === "string") {
      text = response.text.trim();
    }

    if (!text && response.candidates?.length) {
      text =
        response.candidates[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim() || "";
    }

    if (!text) {
      throw new Error(
        "AI returned an empty response."
      );
    }

    return text;
  } catch (error) {
    console.error(
      "Chat AI Error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to generate AI response."
    );
  }
};

module.exports = {
  generateChatResponse,
};