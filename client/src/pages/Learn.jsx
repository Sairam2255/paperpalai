import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  BookOpen,
  Send,
  Plus,
  Bot,
  User,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles,
  Languages,
  Brain,
  CheckCircle2,
  XCircle,
  Trophy,
  History,
  BarChart3,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Target,
  Eye,
  X,
} from "lucide-react";

import Layout from "../components/Layout";
import API from "../services/api";

import "./Learn.css";

const quickTopics = [
  "JavaScript",
  "Python",
  "Salesforce",
  "SQL",
  "DBMS",
  "Data Structures",
  "Aptitude",
  "Machine Learning",
];

const QUIZ_HISTORY_KEY = "paperpal-learn-quiz-history";

const readQuizHistory = () => {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Learn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const [translateLanguage, setTranslateLanguage] = useState("Telugu");
  const [translating, setTranslating] = useState(false);

  const [quizCount, setQuizCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizTopic, setQuizTopic] = useState("");
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const [quizHistory, setQuizHistory] = useState(readQuizHistory);

  const textareaRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      QUIZ_HISTORY_KEY,
      JSON.stringify(quizHistory)
    );
  }, [quizHistory]);

  /* =========================================================
     LOAD EXISTING LEARN CHAT
  ========================================================= */

  const loadConversation = async (id) => {
    if (!id) return;

    try {
      setLoadingConversation(true);
      setError("");

      const response = await API.get(`/chat/${id}`);
      const conversation = response.data?.conversation;

      if (!conversation) return;

      setConversationId(conversation._id);
      setMessages(conversation.messages || []);

      navigate(`/learn?conversation=${conversation._id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Load Learn Conversation Error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load learning conversation."
      );
    } finally {
      setLoadingConversation(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get("conversation");

    if (id) {
      loadConversation(id);
    } else {
      setConversationId(null);
      setMessages([]);
    }
  }, [searchParams]);

  /* =========================================================
     CREATE LEARN CHAT
  ========================================================= */

  const createLearnConversation = async () => {
    try {
      const response = await API.post("/chat", {
        type: "learn",
      });

      const conversation = response.data?.conversation;

      if (!conversation) {
        throw new Error(
          "Failed to create learning conversation."
        );
      }

      setConversationId(conversation._id);

      navigate(`/learn?conversation=${conversation._id}`);

      return conversation;
    } catch (error) {
      console.error(
        "Create Learn Conversation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create learning chat."
      );

      return null;
    }
  };

  /* =========================================================
     BUILD FIRST PROMPT
  ========================================================= */

  const buildFirstPrompt = (selectedTopic) => {
    return `
Teach me "${selectedTopic}" as a ${level} learner.

Language preference: ${language}.

Start the lesson in a conversational way.

First:
1. Explain the core idea simply.
2. Give a practical example.
3. Explain why it is useful.
4. Give me a small question/checkpoint.

Remember that I want to continue asking follow-up questions in this same conversation.
`;
  };

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage = async () => {
    const text = topic.trim();

    if (!text || loading) return;

    try {
      setLoading(true);
      setError("");

      let activeId = conversationId;

      if (!activeId) {
        const conversation = await createLearnConversation();

        if (!conversation) {
          return;
        }

        activeId = conversation._id;
      }

      const isFirstMessage = messages.length === 0;

      const finalMessage = isFirstMessage
        ? buildFirstPrompt(text)
        : text;

      const temporaryUserMessage = {
        _id: `temporary-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        temporaryUserMessage,
      ]);

      setTopic("");

      const response = await API.post(
        `/chat/${activeId}/message`,
        {
          message: finalMessage,
        }
      );

      const conversation =
        response.data?.conversation;

      if (conversation) {
        setMessages(conversation.messages || []);
        setConversationId(conversation._id);

        navigate(
          `/learn?conversation=${conversation._id}`,
          { replace: true }
        );
      }

      window.dispatchEvent(
        new Event("paperpal-chat-updated")
      );
    } catch (error) {
      console.error("Learn Message Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to continue the lesson."
      );

      setMessages((prev) =>
        prev.filter(
          (message) =>
            !String(message._id).startsWith(
              "temporary-"
            )
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     NEW LEARNING CHAT
  ========================================================= */

  const newLearningChat = async () => {
    try {
      const response = await API.post("/chat", {
        type: "learn",
      });

      const conversation = response.data?.conversation;

      if (!conversation) return;

      setConversationId(conversation._id);
      setMessages([]);
      setTopic("");
      setQuiz(null);
      setQuizScore(null);
      setQuizAnswers([]);
      setQuizSubmitted(false);

      navigate(
        `/learn?conversation=${conversation._id}`
      );

      window.dispatchEvent(
        new Event("paperpal-chat-updated")
      );
    } catch (error) {
      console.error("New Learning Chat Error:", error);
      setError("Failed to start new learning chat.");
    }
  };

  /* =========================================================
     ENTER KEY
  ========================================================= */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /* =========================================================
     TEXT TO SPEECH
  ========================================================= */

  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    const speechLanguages = {
      English: "en-US",
      Telugu: "te-IN",
      Hindi: "hi-IN",
      Tamil: "ta-IN",
      Kannada: "kn-IN",
    };

    utterance.lang =
      speechLanguages[language] || "en-US";

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  /* =========================================================
     TRANSLATE LATEST ASSISTANT MESSAGE
  ========================================================= */

  const translateLatestResponse = async () => {
    const assistantMessages = messages.filter(
      (message) => message.role === "assistant"
    );

    const latest =
      assistantMessages[assistantMessages.length - 1];

    if (!latest?.content) return;

    try {
      setTranslating(true);
      setError("");

      const result = await API.post(
        "/ai/translate",
        {
          text: latest.content,
          language: translateLanguage,
        }
      );

      const translatedText =
        result.data?.translatedText;

      if (!translatedText) return;

      setMessages((prev) =>
        prev.map((message) =>
          message._id === latest._id
            ? {
                ...message,
                content: translatedText,
              }
            : message
        )
      );
    } catch (error) {
      console.error(
        "Translation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Translation failed."
      );
    } finally {
      setTranslating(false);
    }
  };

  /* =========================================================
     QUIZ GENERATION
  ========================================================= */

  const normalizeQuizQuestions = (rawQuestions) => {
    if (!Array.isArray(rawQuestions)) {
      return [];
    }

    const getAnswerValue = (question) => {
      const keys = [
        "correctAnswer",
        "correct_answer",
        "answer",
        "correctOption",
        "correct_option",
        "answerIndex",
        "answer_index",
      ];

      for (const key of keys) {
        if (
          question &&
          question[key] !== undefined &&
          question[key] !== null
        ) {
          return question[key];
        }
      }

      return null;
    };

    const normalizeCorrectAnswer = (value, options) => {
      if (value === null || value === undefined) {
        return null;
      }

      if (typeof value === "number") {
        return Number.isInteger(value) && value >= 0 && value < options.length
          ? value
          : null;
      }

      const text = String(value).trim();

      if (!text) {
        return null;
      }

      // 0, 1, 2, 3
      if (/^[0-3]$/.test(text)) {
        const index = Number(text);
        return index < options.length ? index : null;
      }

      // A, B, C, D
      const letterMatch = text.match(/^(?:option\s*)?([A-D])$/i);
      if (letterMatch) {
        const index =
          letterMatch[1].toUpperCase().charCodeAt(0) - 65;
        return index < options.length ? index : null;
      }

      // 1, 2, 3, 4 as human-readable positions
      if (/^[1-4]$/.test(text)) {
        const index = Number(text) - 1;
        return index < options.length ? index : null;
      }

      // Full option text
      const exactMatch = options.findIndex(
        (option) =>
          option.toLowerCase() === text.toLowerCase()
      );

      if (exactMatch !== -1) {
        return exactMatch;
      }

      // Sometimes Gemini may return the option with a letter prefix,
      // e.g. "B. Java" or "B) Java".
      const stripped = text
        .replace(/^[A-D]\s*[.)-]\s*/i, "")
        .trim();

      const strippedMatch = options.findIndex(
        (option) =>
          option.toLowerCase() === stripped.toLowerCase()
      );

      if (strippedMatch !== -1) {
        return strippedMatch;
      }

      return null;
    };

    return rawQuestions
      .map((question) => {
        const options = Array.isArray(question?.options)
          ? question.options
              .map((option) => String(option ?? "").trim())
              .filter(Boolean)
          : [];

        if (!question?.question || options.length !== 4) {
          return null;
        }

        const correctAnswer = normalizeCorrectAnswer(
          getAnswerValue(question),
          options
        );

        if (correctAnswer === null) {
          return null;
        }

        return {
          ...question,
          question: String(question.question).trim(),
          options,
          correctAnswer,
          explanation: String(question.explanation || "").trim(),
        };
      })
      .filter(Boolean);
  };

  const startQuiz = async () => {
    const selectedTopic =
      topic.trim() ||
      quickTopics[0];

    const requestedCount = Math.max(
      1,
      Math.min(15, Number(quizCount) || 5)
    );

    setQuizTopic(selectedTopic);
    setQuizLoading(true);
    setQuiz(null);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(null);
    setError("");

    try {
      const response = await API.post(
        "/ai/quiz",
        {
          topic: selectedTopic,
          level,
          language,
          count: requestedCount,
        }
      );

      const generated =
        response.data?.quiz ||
        response.data;

      const questions = normalizeQuizQuestions(
        generated?.questions || []
      );

      if (!questions.length) {
        throw new Error(
          "Gemini returned quiz questions with an invalid answer key. Please generate the quiz again."
        );
      }

      if (questions.length < requestedCount) {
        throw new Error(
          `Gemini returned ${questions.length} valid question${
            questions.length === 1 ? "" : "s"
          } out of ${requestedCount}. Please generate the quiz again.`
        );
      }

      const finalQuestions = questions.slice(
        0,
        requestedCount
      );

      setQuiz({
        questions: finalQuestions,
      });

      setQuizAnswers(
        Array(finalQuestions.length).fill(null)
      );
    } catch (error) {
      console.error(
        "Quiz Generation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate quiz."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const selectQuizAnswer = (
    questionIndex,
    optionIndex
  ) => {
    if (quizSubmitted) return;

    setQuizAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const submitQuiz = () => {
    if (!quiz?.questions?.length) return;

    const unanswered = quizAnswers.some(
      (answer) => answer === null
    );

    if (unanswered) {
      setError(
        "Please answer all quiz questions before submitting."
      );
      return;
    }

    let score = 0;

    quiz.questions.forEach(
      (question, index) => {
        if (
          Number(
            question.correctAnswer
          ) ===
          Number(quizAnswers[index])
        ) {
          score += 1;
        }
      }
    );

    const result = {
      id: `quiz-${Date.now()}`,
      topic: quizTopic,
      level,
      language,
      questions: quiz.questions,
      answers: quizAnswers,
      score,
      total: quiz.questions.length,
      percentage: Math.round(
        (score / quiz.questions.length) *
          100
      ),
      createdAt:
        new Date().toISOString(),
    };

    setQuizScore(result);
    setQuizSubmitted(true);

    setQuizHistory((prev) => [
      result,
      ...prev,
    ]);

    window.dispatchEvent(
      new Event("paperpal-learn-progress-updated")
    );
  };

  const resetQuiz = () => {
    setQuiz(null);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const analytics = (() => {
    const attempts = quizHistory.length;

    const questionsAnswered =
      quizHistory.reduce(
        (sum, item) =>
          sum + Number(item.total || 0),
        0
      );

    const totalCorrect =
      quizHistory.reduce(
        (sum, item) =>
          sum + Number(item.score || 0),
        0
      );

    const average =
      attempts > 0
        ? Math.round(
            quizHistory.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.percentage || 0
                ),
              0
            ) / attempts
          )
        : 0;

    const best =
      attempts > 0
        ? Math.max(
            ...quizHistory.map(
              (item) =>
                Number(
                  item.percentage || 0
                )
            )
          )
        : 0;

    return {
      attempts,
      questionsAnswered,
      totalCorrect,
      average,
      best,
    };
  })();

  const latestAssistant = [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant"
    );

  return (
    <Layout>
      <div className="learn-page">
        <div className="learn-shell">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="learn-header">
            <div className="learn-heading">
              <div className="learn-icon">
                <BookOpen size={23} />
              </div>

              <div>
                <div className="learn-kicker">
                  <Sparkles size={13} />
                  PAPERPAL LEARN
                </div>

                <h1>Learn anything, your way.</h1>

                <p>
                  Learn through conversation,
                  practice with quizzes, and
                  track your progress.
                </p>
              </div>
            </div>

            <button
              className="learn-new-button"
              onClick={newLearningChat}
            >
              <Plus size={17} />
              New Learning Chat
            </button>
          </header>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="learn-error">
              <span>{error}</span>

              <button
                onClick={() => setError("")}
                aria-label="Close error"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* =================================================
              TOP CONTROLS
          ================================================= */}

          <section className="learn-control-card">
            <div className="learn-control-card-title">
              <Brain size={18} />
              <div>
                <h2>Set your learning preferences</h2>
                <p>
                  PaperPal adjusts the lesson to
                  your level and language.
                </p>
              </div>
            </div>

            <div className="learn-controls">
              <div className="learn-control">
                <label>Learning Level</label>

                <select
                  value={level}
                  onChange={(event) =>
                    setLevel(event.target.value)
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="learn-control">
                <label>Response Language</label>

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                >
                  <option>English</option>
                  <option>Telugu</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                  <option>Kannada</option>
                </select>
              </div>

              <div className="learn-control">
                <label>Quick Quiz Size</label>

                <select
                  value={quizCount}
                  onChange={(event) =>
                    setQuizCount(
                      Number(event.target.value)
                    )
                  }
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>
            </div>
          </section>

          {/* =================================================
              QUICK TOPICS
          ================================================= */}

          <section className="quick-section">
            <div className="section-title">
              <Lightbulb size={17} />
              <span>Try learning about</span>
            </div>

            <div className="quick-topics">
              {quickTopics.map((item) => (
                <button
                  key={item}
                  onClick={() => setTopic(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <div className="learn-main-grid">
            {/* =================================================
                LEFT — CONVERSATION
            ================================================= */}

            <section className="learn-chat-card">
              <div className="learn-chat-header">
                <div>
                  <div className="chat-header-title">
                    <Bot size={18} />
                    Learning Conversation
                  </div>

                  <p>
                    Your lesson stays in one
                    conversation so follow-up
                    questions keep the context.
                  </p>
                </div>

                {speaking && (
                  <button
                    className="voice-active"
                    onClick={stopSpeaking}
                  >
                    <VolumeX size={15} />
                    Stop Voice
                  </button>
                )}
              </div>

              <div className="learn-messages">
                {loadingConversation ? (
                  <div className="learn-loading">
                    <Loader2
                      size={22}
                      className="learn-spin"
                    />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="learn-welcome">
                    <div className="learn-welcome-icon">
                      <Sparkles size={26} />
                    </div>

                    <h2>
                      What do you want to learn?
                    </h2>

                    <p>
                      Start with a quick topic
                      or type your own topic,
                      question, or doubt below.
                    </p>

                    <div className="welcome-hints">
                      <span>
                        <Target size={14} />
                        Step-by-step explanations
                      </span>

                      <span>
                        <History size={14} />
                        Conversation memory
                      </span>

                      <span>
                        <Trophy size={14} />
                        Practice quizzes
                      </span>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`learn-message ${message.role}`}
                    >
                      <div className="learn-avatar">
                        {message.role ===
                        "assistant" ? (
                          <Bot size={16} />
                        ) : (
                          <User size={16} />
                        )}
                      </div>

                      <div className="learn-bubble-wrapper">
                        <div className="learn-role">
                          {message.role ===
                          "assistant"
                            ? "PaperPal AI"
                            : "You"}
                        </div>

                        <div className="learn-bubble">
                          {message.content}
                        </div>

                        {message.role ===
                          "assistant" && (
                          <div className="message-actions">
                            <button
                              className="learn-speak"
                              onClick={() =>
                                speakText(
                                  message.content
                                )
                              }
                            >
                              <Volume2 size={13} />
                              Listen
                            </button>

                            {message._id ===
                              latestAssistant?._id && (
                              <>
                                <select
                                  className="message-translate-select"
                                  value={
                                    translateLanguage
                                  }
                                  onChange={(event) =>
                                    setTranslateLanguage(
                                      event.target.value
                                    )
                                  }
                                >
                                  <option>
                                    Telugu
                                  </option>
                                  <option>
                                    Hindi
                                  </option>
                                  <option>
                                    Tamil
                                  </option>
                                  <option>
                                    Kannada
                                  </option>
                                  <option>
                                    English
                                  </option>
                                </select>

                                <button
                                  className="learn-translate"
                                  disabled={
                                    translating
                                  }
                                  onClick={
                                    translateLatestResponse
                                  }
                                >
                                  {translating ? (
                                    <Loader2
                                      size={13}
                                      className="learn-spin"
                                    />
                                  ) : (
                                    <Languages
                                      size={13}
                                    />
                                  )}
                                  Translate
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div className="learn-message assistant">
                    <div className="learn-avatar">
                      <Bot size={16} />
                    </div>

                    <div className="learn-bubble-wrapper">
                      <div className="learn-role">
                        PaperPal AI
                      </div>

                      <div className="learn-thinking">
                        <Loader2
                          size={16}
                          className="learn-spin"
                        />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="learn-composer">
                <textarea
                  ref={textareaRef}
                  value={topic}
                  onChange={(event) =>
                    setTopic(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    messages.length === 0
                      ? "Enter a topic you want to learn..."
                      : "Ask a follow-up question..."
                  }
                  rows={2}
                  disabled={loading}
                />

                <button
                  className="learn-send"
                  onClick={sendMessage}
                  disabled={
                    loading ||
                    !topic.trim()
                  }
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="learn-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </button>

                <div className="learn-composer-footer">
                  <span>
                    Enter to send · Shift + Enter
                    for new line
                  </span>

                  <button
                    onClick={stopSpeaking}
                    disabled={!speaking}
                    className="learn-stop-speaking"
                  >
                    {speaking ? (
                      <>
                        <VolumeX size={13} />
                        Stop
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} />
                        Voice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                RIGHT — QUIZ
            ================================================= */}

            <aside className="learn-side">
              {!quiz ? (
                <section className="quiz-setup-card">
                  <div className="quiz-setup-header">
                    <div className="quiz-icon">
                      <Trophy size={21} />
                    </div>

                    <div>
                      <h2 className="quiz-setup-title">
                        Quiz
                      </h2>

                      <p className="quiz-setup-description">
                        Test what you just learned.
                      </p>
                    </div>
                  </div>

                  <div className="quiz-setup-field">
                    <label>Quiz Topic</label>

                    <input
                      value={topic}
                      onChange={(event) =>
                        setTopic(event.target.value)
                      }
                      placeholder="e.g. SQL Joins"
                    />
                  </div>

                  <div className="quiz-count-row">
                    <div className="quiz-count-field">
                      <label>Questions</label>

                      <select
                        value={quizCount}
                        onChange={(event) =>
                          setQuizCount(
                            Number(event.target.value)
                          )
                        }
                      >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                      </select>

                      <small>
                        Current level: {level}
                      </small>
                    </div>

                    <button
                      className="learn-btn learn-btn-quiz"
                      onClick={startQuiz}
                      disabled={quizLoading}
                    >
                      {quizLoading ? (
                        <>
                          <Loader2
                            size={16}
                            className="learn-spin"
                          />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Trophy size={16} />
                          Start Quiz
                        </>
                      )}
                    </button>
                  </div>

                  <div className="quiz-setup-note">
                    <Sparkles size={14} />
                    AI creates questions based on
                    your topic and level.
                  </div>
                </section>
              ) : (
                <>
                  {!quizSubmitted ? (
                    <section className="quiz-card">
                      <div className="quiz-top">
                        <div>
                          <div className="quiz-mode">
                            <Trophy size={14} />
                            Practice Quiz
                          </div>

                          <div className="quiz-topic">
                            {quizTopic}
                          </div>

                          <div className="quiz-meta">
                            {level} · {language}
                          </div>
                        </div>

                        <div className="quiz-progress">
                          {
                            quizAnswers.filter(
                              (answer) =>
                                answer !== null
                            ).length
                          } / {quiz.questions.length}
                        </div>
                      </div>

                      {quiz.questions.map(
                        (question, index) => (
                          <div
                            key={index}
                            className="quiz-question"
                          >
                            <div className="quiz-question-number">
                              Question {index + 1}
                            </div>

                            <h3 className="quiz-question-text">
                              {question.question}
                            </h3>

                            <div className="quiz-options">
                              {question.options.map(
                                (option, optionIndex) => (
                                  <button
                                    key={optionIndex}
                                    className={`quiz-option ${
                                      quizAnswers[index] ===
                                      optionIndex
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      selectQuizAnswer(
                                        index,
                                        optionIndex
                                      )
                                    }
                                  >
                                    <span className="quiz-option-letter">
                                      {String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}
                                    </span>
                                    {option}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}

                      <div className="quiz-submit-row">
                        <button
                          className="learn-btn learn-btn-primary"
                          onClick={
                            submitQuiz
                          }
                        >
                          <CheckCircle2 size={16} />
                          Submit Quiz
                        </button>
                      </div>
                    </section>
                  ) : (
                    <>
                      <section className="quiz-result-card">
                        <div className="quiz-trophy">
                          <Trophy size={30} />
                        </div>

                        <h2 className="quiz-result-title">
                          Quiz Complete
                        </h2>

                        <div className="quiz-result-topic">
                          {quizTopic}
                        </div>

                        <div className="quiz-score">
                          {quizScore?.percentage || 0}%
                        </div>

                        <div className="quiz-score-detail">
                          {quizScore?.score || 0} /{" "}
                          {quizScore?.total || 0} correct
                        </div>

                        <div className="quiz-result-actions">
                          <button
                            className="learn-btn learn-btn-quiz"
                            onClick={startQuiz}
                          >
                            <RotateCcw size={16} />
                            Retake
                          </button>

                          <button
                            className="learn-btn learn-btn-outline"
                            onClick={resetQuiz}
                          >
                            <ChevronRight size={16} />
                            Back to Quiz Setup
                          </button>
                        </div>
                      </section>

                      <section className="analysis-card">
                        <div className="analysis-header">
                          <CheckCircle2
                            className="analysis-icon"
                            size={20}
                          />

                          <div>
                            <h2 className="analysis-title">
                              Question Analysis
                            </h2>

                            <p className="analysis-description">
                              Review every answer and
                              learn from mistakes.
                            </p>
                          </div>
                        </div>

                        {quiz.questions.map(
                          (question, index) => {
                            const selected =
                              quizAnswers[index];

                            const correct =
                              Number(
                                question.correctAnswer
                              );

                            const isCorrect =
                              Number(selected) ===
                              correct;

                            return (
                              <div
                                key={index}
                                className={`analysis-question ${
                                  isCorrect
                                    ? "correct"
                                    : "incorrect"
                                }`}
                              >
                                <div className="analysis-question-head">
                                  <div className="analysis-status">
                                    {isCorrect ? (
                                      <CheckCircle2 className="correct-icon" size={19} />
                                    ) : (
                                      <XCircle className="incorrect-icon" size={19} />
                                    )}
                                  </div>

                                  <div>
                                    <p className="analysis-question-text">
                                      {index + 1}.{" "}
                                      {question.question}
                                    </p>

                                    <div
                                      className={`analysis-status-text ${
                                        isCorrect
                                          ? "correct-text"
                                          : "incorrect-text"
                                      }`}
                                    >
                                      {isCorrect
                                        ? "Correct"
                                        : "Incorrect"}
                                    </div>
                                  </div>
                                </div>

                                <div className="analysis-options">
                                  {question.options.map(
                                    (
                                      option,
                                      optionIndex
                                    ) => {
                                      const isRight =
                                        optionIndex ===
                                        correct;

                                      const isSelectedWrong =
                                        optionIndex ===
                                          selected &&
                                        !isCorrect;

                                      return (
                                        <div
                                          key={optionIndex}
                                          className={`analysis-option ${
                                            isRight
                                              ? "correct-option"
                                              : ""
                                          } ${
                                            isSelectedWrong
                                              ? "selected-wrong"
                                              : ""
                                          }`}
                                        >
                                          <span>
                                            {String.fromCharCode(
                                              65 +
                                                optionIndex
                                            )}
                                          .{" "}
                                          </span>
                                          {option}

                                          {isRight && (
                                            <span className="analysis-badge">
                                              Correct answer
                                            </span>
                                          )}

                                          {isSelectedWrong && (
                                            <span className="analysis-badge">
                                              Your answer
                                            </span>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>

                                {question.explanation && (
                                  <div className="analysis-explanation">
                                    <div className="analysis-explanation-title">
                                      Explanation
                                    </div>

                                    <div className="analysis-explanation-text">
                                      {question.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </section>
                    </>
                  )}
                </>
              )}
            </aside>
          </div>

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <section className="analytics-card">
            <div className="analytics-header">
              <div className="analytics-header-left">
                <div className="analytics-icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <h2 className="analytics-title">
                    Learning Analytics
                  </h2>

                  <p className="analytics-subtitle">
                    Your quiz-based learning progress.
                  </p>
                </div>
              </div>

              <div className="analytics-goal">
                <Target size={14} />
                Keep improving
              </div>
            </div>

            <div className="analytics-stat-grid">
              <div className="analytics-stat">
                <span>Quiz Attempts</span>
                <strong>
                  {analytics.attempts}
                </strong>
              </div>

              <div className="analytics-stat">
                <span>Questions Practiced</span>
                <strong>
                  {analytics.questionsAnswered}
                </strong>
              </div>

              <div className="analytics-stat">
                <span>Average Score</span>
                <strong>
                  {analytics.average}%
                </strong>
              </div>

              <div className="analytics-stat">
                <span>Best Score</span>
                <strong>
                  {analytics.best}%
                </strong>
              </div>
            </div>

            <div className="analytics-progress-section">
              <div className="progress-label">
                <span>Overall quiz performance</span>
                <strong>
                  {analytics.average}%
                </strong>
              </div>

              <div className="analytics-progress">
                <div
                  style={{
                    width: `${analytics.average}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              QUIZ HISTORY
          ================================================= */}

          <section className="quiz-history-card">
            <div className="quiz-history-header">
              <div className="quiz-history-title-row">
                <div className="quiz-history-icon">
                  <History size={20} />
                </div>

                <div>
                  <h2 className="quiz-history-title">
                    Quiz History
                  </h2>

                  <p className="quiz-history-subtitle">
                    Review completed quizzes and
                    previous performance.
                  </p>
                </div>
              </div>

              <span className="quiz-history-count">
                {quizHistory.length} attempt
                {quizHistory.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            {quizHistory.length === 0 ? (
              <div className="quiz-history-empty">
                <History size={34} />
                <h3>No quiz attempts yet</h3>
                <p>
                  Complete your first quiz and
                  it will appear here.
                </p>
              </div>
            ) : (
              <div className="quiz-history-list">
                {quizHistory.map((item) => (
                  <div
                    key={item.id}
                    className="quiz-history-item"
                  >
                    <div>
                      <div className="quiz-history-topic">
                        {item.topic}
                      </div>

                      <div className="quiz-history-meta">
                        <span>
                          {item.level}
                        </span>
                        <span>•</span>
                        <span>
                          {item.total} questions
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="quiz-history-score">
                      <div className="quiz-history-percentage">
                        {item.percentage}%
                      </div>

                      <div className="quiz-history-score-small">
                        {item.score}/{item.total}
                      </div>
                    </div>

                    <button
                      className="learn-btn learn-btn-outline quiz-history-view"
                      onClick={() =>
                        setSelectedHistory(
                          item
                        )
                      }
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================================
              HISTORY ANALYSIS MODAL
          ================================================= */}

          {selectedHistory && (
            <div
              className="quiz-analysis-overlay"
              onClick={() =>
                setSelectedHistory(null)
              }
            >
              <div
                className="quiz-analysis-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <div className="quiz-analysis-modal-header">
                  <div>
                    <h2 className="quiz-analysis-modal-title">
                      {selectedHistory.topic}
                    </h2>

                    <p className="quiz-analysis-modal-meta">
                      {selectedHistory.level} ·{" "}
                      {selectedHistory.total} questions ·{" "}
                      {new Date(
                        selectedHistory.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <button
                    className="quiz-history-close"
                    onClick={() =>
                      setSelectedHistory(
                        null
                      )
                    }
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="quiz-history-result">
                  <div className="quiz-history-result-icon">
                    <Trophy size={23} />
                  </div>

                  <div>
                    <div className="quiz-history-result-score">
                      {selectedHistory.percentage}%
                    </div>

                    <div className="quiz-history-result-detail">
                      {selectedHistory.score} of{" "}
                      {selectedHistory.total} correct
                    </div>
                  </div>
                </div>

                <div className="quiz-history-analysis">
                  {selectedHistory.questions?.map(
                    (question, index) => {
                      const selected =
                        selectedHistory.answers?.[
                          index
                        ];

                      const correct =
                        Number(
                          question.correctAnswer
                        );

                      const isCorrect =
                        Number(selected) ===
                        correct;

                      return (
                        <div
                          key={index}
                          className={`analysis-question ${
                            isCorrect
                              ? "correct"
                              : "incorrect"
                          }`}
                        >
                          <div className="analysis-question-head">
                            <div className="analysis-status">
                              {isCorrect ? (
                                <CheckCircle2 className="correct-icon" size={19} />
                              ) : (
                                <XCircle className="incorrect-icon" size={19} />
                              )}
                            </div>

                            <div>
                              <p className="analysis-question-text">
                                {index + 1}.{" "}
                                {question.question}
                              </p>

                              <div
                                className={`analysis-status-text ${
                                  isCorrect
                                    ? "correct-text"
                                    : "incorrect-text"
                                }`}
                              >
                                {isCorrect
                                  ? "Correct"
                                  : "Incorrect"}
                              </div>
                            </div>
                          </div>

                          <div className="analysis-options">
                            {question.options?.map(
                              (
                                option,
                                optionIndex
                              ) => (
                                <div
                                  key={
                                    optionIndex
                                  }
                                  className={`analysis-option ${
                                    optionIndex ===
                                    correct
                                      ? "correct-option"
                                      : ""
                                  } ${
                                    optionIndex ===
                                      selected &&
                                    !isCorrect
                                      ? "selected-wrong"
                                      : ""
                                  }`}
                                >
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex
                                  )}
                                  . {option}
                                </div>
                              )
                            )}
                          </div>

                          {question.explanation && (
                            <div className="analysis-explanation">
                              <div className="analysis-explanation-title">
                                Explanation
                              </div>

                              <div className="analysis-explanation-text">
                                {
                                  question.explanation
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Learn;
