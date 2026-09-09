import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BookOpen,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Copy,
  Eye,
  History,
  Languages,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Trophy,
  User,
  Volume2,
  VolumeX,
  X,
  XCircle,
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

const speechLanguages = {
  English: "en-US",
  Telugu: "te-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Kannada: "kn-IN",
};

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
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState("");

  const [speaking, setSpeaking] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  const [modal, setModal] = useState(null);
  const [translateLanguage, setTranslateLanguage] = useState("Telugu");
  const [translation, setTranslation] = useState("");
  const [translating, setTranslating] = useState(false);

  const [quizCount, setQuizCount] = useState(5);
  const [quizLevel, setQuizLevel] = useState("Beginner");
  const [quizTopic, setQuizTopic] = useState("");

  const [quizLoading, setQuizLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const [quizHistory, setQuizHistory] = useState(readQuizHistory);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const [copyStatus, setCopyStatus] = useState("");
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      QUIZ_HISTORY_KEY,
      JSON.stringify(quizHistory)
    );
  }, [quizHistory]);

  const latestAssistant = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant"),
    [messages]
  );

  const analytics = useMemo(() => {
    const attempts = quizHistory.length;
    const questionsPracticed = quizHistory.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
    const correct = quizHistory.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );
    const average =
      attempts > 0
        ? Math.round(
            quizHistory.reduce(
              (sum, item) => sum + Number(item.percentage || 0),
              0
            ) / attempts
          )
        : 0;
    const best =
      attempts > 0
        ? Math.max(
            ...quizHistory.map((item) =>
              Number(item.percentage || 0)
            )
          )
        : 0;

    return {
      attempts,
      questionsPracticed,
      correct,
      average,
      best,
    };
  }, [quizHistory]);

  const closeModal = () => {
    setModal(null);
    setTranslation("");
  };

  const loadConversation = async (id) => {
    if (!id) return;

    try {
      setLoadingConversation(true);
      setError("");

      const response = await API.get(`/chat/${id}`);
      const conversation = response.data?.conversation;

      if (!conversation) {
        throw new Error("Conversation was not found.");
      }

      setConversationId(conversation._id);
      setMessages(conversation.messages || []);
    } catch (err) {
      console.error("Load Learn Conversation Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load learning conversation."
      );
    } finally {
      setLoadingConversation(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("conversation");

    if (id) {
      loadConversation(id);
    }
  }, []);

  const createLearnConversation = async () => {
    try {
      const response = await API.post("/chat", {
        type: "learn",
      });

      const conversation = response.data?.conversation;

      if (!conversation) {
        throw new Error("Failed to create learning conversation.");
      }

      setConversationId(conversation._id);
      window.history.replaceState(
        {},
        "",
        `/learn?conversation=${conversation._id}`
      );

      return conversation;
    } catch (err) {
      console.error("Create Learn Conversation Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create learning chat."
      );
      return null;
    }
  };

  const newLearningChat = async () => {
    await createLearnConversation();
    setMessages([]);
    setTopic("");
    setQuiz(null);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(null);
    closeModal();

    window.dispatchEvent(new Event("paperpal-chat-updated"));
  };

  const buildFirstPrompt = (selectedTopic) => `
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

  const sendMessage = async () => {
    const text = topic.trim();

    if (!text || loading) return;

    try {
      setLoading(true);
      setError("");

      let activeId = conversationId;

      if (!activeId) {
        const conversation = await createLearnConversation();

        if (!conversation) return;

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

      setMessages((prev) => [...prev, temporaryUserMessage]);
      setTopic("");

      const response = await API.post(
        `/chat/${activeId}/message`,
        {
          message: finalMessage,
        }
      );

      const conversation = response.data?.conversation;

      if (conversation) {
        setMessages(conversation.messages || []);
        setConversationId(conversation._id);

        window.history.replaceState(
          {},
          "",
          `/learn?conversation=${conversation._id}`
        );
      }

      window.dispatchEvent(new Event("paperpal-chat-updated"));
    } catch (err) {
      console.error("Learn Message Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to continue the lesson."
      );

      setMessages((prev) =>
        prev.filter(
          (message) =>
            !String(message._id).startsWith("temporary-")
        )
      );
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const speakText = (text) => {
    if (!text || !("speechSynthesis" in window)) {
      setError("Voice reading is not supported by this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

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
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (voiceListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang =
      speechLanguages[language] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        transcript += event.results[i][0].transcript;
      }

      setTopic(transcript);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    };

    recognition.onerror = (event) => {
      console.error("Voice input error:", event);
      setError(
        event.error === "not-allowed"
          ? "Microphone permission was blocked."
          : "Voice input could not be started."
      );
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus(""), 1400);
    } catch {
      setError("Could not copy the response.");
    }
  };

  const openTranslate = (message) => {
    setTranslation("");
    setModal({
      type: "translate",
      message,
    });
  };

  const translateMessage = async () => {
    if (!modal?.message?.content) return;

    try {
      setTranslating(true);
      setError("");

      const result = await API.post(
        "/ai/translate",
        {
          text: modal.message.content,
          language: translateLanguage,
        }
      );

      setTranslation(result.data?.translatedText || "");
    } catch (err) {
      console.error("Translation Error:", err);
      setError(
        err.response?.data?.message ||
          "Translation failed."
      );
    } finally {
      setTranslating(false);
    }
  };

  const openQuiz = (prefill = "") => {
    setQuizTopic(
      prefill ||
        topic.trim() ||
        latestAssistant?.content?.split("\n")[0] ||
        quickTopics[0]
    );
    setQuizLevel(level);
    setModal({ type: "quiz" });
  };

  const startQuiz = async () => {
    const selectedTopic =
      quizTopic.trim() || quickTopics[0];

    try {
      setQuizLoading(true);
      setError("");

      const response = await API.post(
        "/ai/quiz",
        {
          topic: selectedTopic,
          level: quizLevel,
          language,
          count: Number(quizCount),
        }
      );

      const generated =
        response.data?.quiz ||
        response.data;

      const questions =
        generated?.questions || [];

      if (!questions.length) {
        throw new Error(
          "No quiz questions were generated."
        );
      }

      setQuiz({
        questions,
      });
      setQuizAnswers(
        Array(questions.length).fill(null)
      );
      setQuizSubmitted(false);
      setQuizScore(null);
      setQuizTopic(selectedTopic);
      setModal({ type: "quiz" });
    } catch (err) {
      console.error("Quiz Generation Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
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

    if (
      quizAnswers.some(
        (answer) => answer === null
      )
    ) {
      setError(
        "Please answer all quiz questions before submitting."
      );
      return;
    }

    let score = 0;

    quiz.questions.forEach(
      (question, index) => {
        if (
          Number(question.correctAnswer) ===
          Number(quizAnswers[index])
        ) {
          score += 1;
        }
      }
    );

    const result = {
      id: `quiz-${Date.now()}`,
      topic: quizTopic,
      level: quizLevel,
      language,
      questions: quiz.questions,
      answers: quizAnswers,
      score,
      total: quiz.questions.length,
      percentage: Math.round(
        (score / quiz.questions.length) * 100
      ),
      createdAt: new Date().toISOString(),
    };

    setQuizScore(result);
    setQuizSubmitted(true);
    setQuizHistory((prev) => [result, ...prev]);
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

  const openHistory = () => {
    setSelectedHistory(null);
    setModal({ type: "history" });
  };

  const openAnalytics = () => {
    setModal({ type: "analytics" });
  };

  const progress =
    analytics.attempts > 0
      ? analytics.average
      : 0;

  return (
    <Layout>
      <div className="learn-page">
        <div className="learn-shell">
          <section className="learn-hero">
            <div className="hero-brand-icon">
              <BookOpen size={28} />
            </div>

            <div className="hero-copy">
              <div className="hero-kicker">
                <Sparkles size={12} />
                PAPERPAL LEARN
              </div>

              <h1>
                Learn <span>Anything</span>, your way.
              </h1>

              <p>
                Learn through conversation, practice with
                quizzes, and build real understanding.
              </p>
            </div>

            <div className="hero-robot" aria-hidden="true">
              <div className="robot-aura" />
              <div className="robot-body">
                <span className="robot-eye" />
                <span className="robot-eye" />
                <div className="robot-antenna" />
              </div>
              <Sparkles
                size={14}
                className="robot-spark spark-a"
              />
              <Sparkles
                size={12}
                className="robot-spark spark-b"
              />
            </div>

            <button
              className="new-chat-btn"
              onClick={newLearningChat}
            >
              <Plus size={16} />
              New Learning Chat
            </button>
          </section>

          {error && (
            <div className="learn-error">
              <span>{error}</span>
              <button onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}

          <section className="learning-toolbar">
            <div className="toolbar-select">
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

            <div className="toolbar-select">
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

            <div className="toolbar-divider" />

            <div className="toolbar-tip">
              <Brain size={15} />
              PaperPal adapts explanations to your level.
            </div>
          </section>

          <section className="quick-topics-bar">
            <span className="quick-label">
              <Lightbulb size={14} />
              Try learning about
            </span>

            {quickTopics.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTopic(item);
                  textareaRef.current?.focus();
                }}
              >
                {item}
              </button>
            ))}
          </section>

          <div className="learn-layout">
            <section className="conversation-card">
              <div className="conversation-head">
                <div className="conversation-title-wrap">
                  <div className="conversation-badge">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <strong>Learning Conversation</strong>
                    <span>
                      Ask, follow up, and keep the context.
                    </span>
                  </div>
                </div>

                {speaking && (
                  <button
                    className="stop-reading"
                    onClick={stopSpeaking}
                  >
                    <VolumeX size={14} />
                    Stop reading
                  </button>
                )}
              </div>

              <div className="message-scroll">
                {loadingConversation ? (
                  <div className="empty-learn">
                    <div className="thinking-card">
                      <RunnerLoader
                        title="Getting your learning space ready…"
                        subtitle="Connecting your previous conversation"
                      />
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-learn">
                    <div className="empty-orb">
                      <Sparkles size={30} />
                    </div>

                    <h2>What do you want to learn?</h2>

                    <p>
                      Start with a topic, ask a doubt, or
                      speak your question. PaperPal will
                      explain it step by step.
                    </p>

                    <div className="empty-features">
                      <span>
                        <Target size={13} />
                        Step-by-step
                      </span>
                      <span>
                        <History size={13} />
                        Conversation memory
                      </span>
                      <span>
                        <Trophy size={13} />
                        Practice quizzes
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`message-row ${message.role}`}
                      >
                        <div
                          className={`avatar ${message.role}`}
                        >
                          {message.role ===
                          "assistant" ? (
                            <Sparkles size={14} />
                          ) : (
                            <User size={14} />
                          )}
                        </div>

                        <div className="message-content-wrap">
                          <div className="message-meta">
                            <strong>
                              {message.role ===
                              "assistant"
                                ? "PaperPal AI"
                                : "You"}
                            </strong>
                            <time>
                              {message.createdAt
                                ? new Date(
                                    message.createdAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : ""}
                            </time>
                          </div>

                          <div
                            className={`message-bubble ${message.role}`}
                          >
                            {message.content}
                          </div>

                          {message.role ===
                            "assistant" && (
                            <div className="message-toolbar">
                              <button
                                className="text-action"
                                onClick={() =>
                                  speakText(
                                    message.content
                                  )
                                }
                              >
                                <Volume2 size={12} />
                                Listen
                              </button>

                              <button
                                className="text-action"
                                onClick={() =>
                                  openTranslate(
                                    message
                                  )
                                }
                              >
                                <Languages size={12} />
                                Translate
                              </button>

                              <button
                                className="text-action"
                                onClick={() =>
                                  copyMessage(
                                    message.content
                                  )
                                }
                              >
                                <Copy size={12} />
                                {copyStatus || "Copy"}
                              </button>

                              <button
                                className="quiz-mini-action"
                                title="Create a quiz from this lesson"
                                aria-label="Create quiz"
                                onClick={() =>
                                  openQuiz(
                                    topic.trim()
                                  )
                                }
                              >
                                <Trophy size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="message-row assistant">
                        <div className="avatar ai">
                          <Sparkles size={14} />
                        </div>
                        <div className="message-content-wrap">
                          <div className="message-meta">
                            <strong>PaperPal AI</strong>
                          </div>
                          <div className="thinking-card">
                            <RunnerLoader
                              title="Thinking like a tutor…"
                              subtitle="Building an explanation that fits your level"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="prompt-area">
                <div className="prompt-label">
                  <Sparkles size={12} />
                  Ask PaperPal
                </div>

                <div className="prompt-box">
                  <textarea
                    ref={textareaRef}
                    value={topic}
                    onChange={(event) =>
                      setTopic(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder={
                      messages.length === 0
                        ? "Enter a topic, question, or doubt…"
                        : "Ask a follow-up question…"
                    }
                    rows={2}
                    disabled={loading}
                  />

                  <div className="prompt-tools">
                    <button
                      className={`prompt-icon ${
                        voiceListening ? "active" : ""
                      }`}
                      onClick={startVoiceInput}
                      title={
                        voiceListening
                          ? "Stop voice input"
                          : "Speak your question"
                      }
                      aria-label="Voice input"
                    >
                      {voiceListening ? (
                        <MicOff size={18} />
                      ) : (
                        <Mic size={18} />
                      )}
                    </button>

                    <button
                      className="prompt-send"
                      onClick={sendMessage}
                      disabled={
                        loading || !topic.trim()
                      }
                      title="Send"
                      aria-label="Send"
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
                  </div>
                </div>

                <div className="prompt-footer">
                  <span>
                    Enter to send · Shift + Enter for a new
                    line
                  </span>
                  <span>
                    {voiceListening
                      ? "Listening…"
                      : "🎙 Speak your question"}
                  </span>
                </div>
              </div>
            </section>

            <aside className="right-rail">
              <section className="tool-card">
                <div className="rail-title">
                  <span>Learning Tools</span>
                  <small>Choose when needed</small>
                </div>

                <div className="tool-grid">
                  <button
                    className="tool-tile quiz"
                    onClick={() =>
                      openQuiz(topic.trim())
                    }
                  >
                    <span>
                      <Trophy size={17} />
                    </span>
                    <strong>Quiz</strong>
                    <small>Practice</small>
                  </button>

                  <button
                    className="tool-tile translate"
                    disabled={!latestAssistant}
                    onClick={() =>
                      latestAssistant &&
                      openTranslate(
                        latestAssistant
                      )
                    }
                  >
                    <span>
                      <Languages size={17} />
                    </span>
                    <strong>Translate</strong>
                    <small>Change language</small>
                  </button>

                  <button
                    className="tool-tile history"
                    onClick={openHistory}
                  >
                    <span>
                      <History size={17} />
                    </span>
                    <strong>Quiz History</strong>
                    <small>
                      {quizHistory.length} attempts
                    </small>
                  </button>

                  <button
                    className="tool-tile analytics"
                    onClick={openAnalytics}
                  >
                    <span>
                      <BarChart3 size={17} />
                    </span>
                    <strong>Analytics</strong>
                    <small>{analytics.average}% avg</small>
                  </button>
                </div>
              </section>

              <section className="progress-card">
                <div className="rail-title">
                  <span>Learning Progress</span>
                  <small>Quiz based</small>
                </div>

                <div
                  className="progress-ring"
                  style={{
                    "--progress": `${progress}%`,
                  }}
                >
                  <div>
                    <strong>{progress}%</strong>
                    <span>Average</span>
                  </div>
                </div>

                <div className="progress-grid">
                  <div>
                    <strong>{analytics.attempts}</strong>
                    <span>Attempts</span>
                  </div>
                  <div>
                    <strong>
                      {analytics.questionsPracticed}
                    </strong>
                    <span>Questions</span>
                  </div>
                  <div>
                    <strong>{analytics.correct}</strong>
                    <span>Correct</span>
                  </div>
                </div>
              </section>

              <section className="helper-card">
                <div className="helper-graphic">
                  <Brain size={29} />
                  <Sparkles size={15} />
                </div>
                <strong>Learn smarter, not harder.</strong>
                <p>
                  Ask follow-up questions. Use Listen when
                  you prefer audio. Use Quiz when you're ready
                  to test yourself.
                </p>
                <button
                  onClick={() => textareaRef.current?.focus()}
                >
                  Start learning <ChevronRight size={13} />
                </button>
              </section>
            </aside>
          </div>

          {modal?.type === "quiz" && (
            <QuizModal
              quiz={quiz}
              quizAnswers={quizAnswers}
              quizSubmitted={quizSubmitted}
              quizScore={quizScore}
              quizTopic={quizTopic}
              quizLevel={quizLevel}
              quizCount={quizCount}
              quizLoading={quizLoading}
              setQuizTopic={setQuizTopic}
              setQuizLevel={setQuizLevel}
              setQuizCount={setQuizCount}
              onClose={closeModal}
              onStart={startQuiz}
              onAnswer={selectQuizAnswer}
              onSubmit={submitQuiz}
              onRetake={startQuiz}
              onReset={resetQuiz}
            />
          )}

          {modal?.type === "translate" && (
            <div
              className="modal-overlay"
              onClick={closeModal}
            >
              <div
                className="tool-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                <div className="modal-heading-row">
                  <div>
                    <div className="eyebrow">
                      LANGUAGE TOOL
                    </div>
                    <h2>Translate this lesson</h2>
                    <p>
                      Keep the original answer intact and
                      create a translated reading copy.
                    </p>
                  </div>
                  <div className="quiz-hero-icon">
                    <Languages size={23} />
                  </div>
                </div>

                <div className="translation-controls">
                  <div>
                    <label>Target language</label>
                    <select
                      value={translateLanguage}
                      onChange={(event) =>
                        setTranslateLanguage(
                          event.target.value
                        )
                      }
                    >
                      <option>Telugu</option>
                      <option>Hindi</option>
                      <option>Tamil</option>
                      <option>Kannada</option>
                      <option>English</option>
                    </select>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={translateMessage}
                    disabled={translating}
                  >
                    {translating ? (
                      <Loader2
                        size={14}
                        className="learn-spin"
                      />
                    ) : (
                      <Languages size={14} />
                    )}
                    {translating
                      ? "Translating…"
                      : "Translate"}
                  </button>
                </div>

                <div className="translation-text">
                  {translation ||
                    "Choose a language and press Translate."}
                </div>

                {translation && (
                  <div className="modal-actions">
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        copyMessage(translation)
                      }
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      className="primary-btn"
                      onClick={() =>
                        speakText(translation)
                      }
                    >
                      <Volume2 size={14} />
                      Listen
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {modal?.type === "history" && (
            <div
              className="modal-overlay"
              onClick={closeModal}
            >
              <div
                className="tool-modal wide"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="modal-close"
                  onClick={closeModal}
                >
                  <X size={16} />
                </button>

                <div className="modal-heading-row">
                  <div>
                    <div className="eyebrow">
                      PRACTICE
                    </div>
                    <h2>Quiz History</h2>
                    <p>
                      Review previous attempts and open a
                      detailed answer analysis.
                    </p>
                  </div>
                  <div className="quiz-hero-icon">
                    <History size={23} />
                  </div>
                </div>

                {quizHistory.length === 0 ? (
                  <div className="empty-modal">
                    <History size={34} />
                    <strong>No quiz attempts yet</strong>
                    <span>
                      Complete a quiz and it will appear here.
                    </span>
                  </div>
                ) : (
                  <div className="history-list">
                    {quizHistory.map((item) => (
                      <div
                        key={item.id}
                        className="history-item"
                      >
                        <div className="history-icon">
                          <Trophy size={15} />
                        </div>
                        <div className="history-main">
                          <strong>{item.topic}</strong>
                          <span>
                            {item.level} · {item.total}{" "}
                            questions ·{" "}
                            {new Date(
                              item.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="history-score">
                          <strong>
                            {item.percentage}%
                          </strong>
                          <span>
                            {item.score}/{item.total}
                          </span>
                        </div>
                        <button
                          className="secondary-btn"
                          onClick={() =>
                            setSelectedHistory(item)
                          }
                        >
                          <Eye size={13} />
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {modal?.type === "analytics" && (
            <div
              className="modal-overlay"
              onClick={closeModal}
            >
              <div
                className="tool-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="modal-close"
                  onClick={closeModal}
                >
                  <X size={16} />
                </button>

                <div className="modal-heading-row">
                  <div>
                    <div className="eyebrow">
                      PROGRESS
                    </div>
                    <h2>Learning Analytics</h2>
                    <p>
                      A quick view of how your practice is
                      progressing.
                    </p>
                  </div>
                  <div className="quiz-hero-icon">
                    <BarChart3 size={23} />
                  </div>
                </div>

                <div className="analytics-big">
                  <div className="analytics-big-number">
                    {analytics.average}%
                  </div>
                  <div>
                    <strong>Average quiz score</strong>
                    <span>
                      Best score: {analytics.best}% ·{" "}
                      {analytics.attempts} attempt
                      {analytics.attempts === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                </div>

                <div className="analytics-stat-grid">
                  <div>
                    <strong>{analytics.attempts}</strong>
                    <span>Quiz attempts</span>
                  </div>
                  <div>
                    <strong>
                      {analytics.questionsPracticed}
                    </strong>
                    <span>Questions practiced</span>
                  </div>
                  <div>
                    <strong>{analytics.correct}</strong>
                    <span>Correct answers</span>
                  </div>
                  <div>
                    <strong>{analytics.best}%</strong>
                    <span>Best score</span>
                  </div>
                </div>

                <div className="insight-box">
                  <Lightbulb size={16} />
                  <div>
                    <strong>PaperPal insight</strong>
                    <span>
                      Keep using short quizzes after lessons.
                      Repeated retrieval practice helps reveal
                      which concepts need another explanation.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedHistory && (
            <div
              className="modal-overlay top-layer"
              onClick={() =>
                setSelectedHistory(null)
              }
            >
              <div
                className="tool-modal wide"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedHistory(null)
                  }
                >
                  <X size={16} />
                </button>

                <div className="modal-heading-row">
                  <div>
                    <div className="eyebrow">
                      QUIZ ANALYSIS
                    </div>
                    <h2>{selectedHistory.topic}</h2>
                    <p>
                      {selectedHistory.level} ·{" "}
                      {selectedHistory.total} questions ·{" "}
                      {new Date(
                        selectedHistory.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="detail-score">
                    {selectedHistory.percentage}%
                  </div>
                </div>

                <div className="detail-list">
                  {selectedHistory.questions?.map(
                    (question, index) => {
                      const selected =
                        selectedHistory.answers?.[index];

                      const correct = Number(
                        question.correctAnswer
                      );

                      const isCorrect =
                        Number(selected) === correct;

                      return (
                        <div
                          key={index}
                          className={`detail-question ${
                            isCorrect ? "ok" : "bad"
                          }`}
                        >
                          <div className="detail-q-top">
                            <span>{index + 1}</span>
                            <strong>
                              {question.question}
                            </strong>
                            {isCorrect ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                          </div>

                          <div className="detail-options">
                            {question.options?.map(
                              (option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={
                                    optionIndex === correct
                                      ? "is-correct"
                                      : optionIndex ===
                                          selected &&
                                        !isCorrect
                                      ? "is-wrong"
                                      : ""
                                  }
                                >
                                  <span>
                                    {String.fromCharCode(
                                      65 + optionIndex
                                    )}
                                  </span>
                                  {option}
                                </div>
                              )
                            )}
                          </div>

                          {question.explanation && (
                            <div className="detail-explanation">
                              <Lightbulb size={13} />
                              <span>
                                {question.explanation}
                              </span>
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

const RunnerLoader = ({ title, subtitle }) => (
  <div className="runner-loader">
    <div className="runner-stage">
      <div className="runner-track" />

      <div className="runner-person">
        <span className="runner-head">●</span>
        <span className="runner-body" />
        <span className="runner-arm runner-arm-one" />
        <span className="runner-arm runner-arm-two" />
        <span className="runner-leg runner-leg-one" />
        <span className="runner-leg runner-leg-two" />
        <span className="runner-shadow" />
      </div>

      <Brain className="runner-brain" size={19} />
      <Sparkles className="runner-spark spark-one" size={12} />
      <Sparkles className="runner-spark spark-two" size={10} />
    </div>

    <div className="runner-copy">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>

    <div className="runner-progress">
      <span />
    </div>
  </div>
);

const QuizModal = ({
  quiz,
  quizAnswers,
  quizSubmitted,
  quizScore,
  quizTopic,
  quizLevel,
  quizCount,
  quizLoading,
  setQuizTopic,
  setQuizLevel,
  setQuizCount,
  onClose,
  onStart,
  onAnswer,
  onSubmit,
  onRetake,
  onReset,
}) => (
  <div
    className="modal-overlay top-layer"
    onClick={onClose}
  >
    <div
      className="tool-modal wide"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <button
        className="modal-close"
        onClick={onClose}
        aria-label="Close quiz"
      >
        <X size={16} />
      </button>

      {!quiz ? (
        <div className="quiz-setup-view">
          <div className="modal-heading-row">
            <div>
              <div className="eyebrow">
                PRACTICE MODE
              </div>
              <h2>Quick Quiz</h2>
              <p>
                Turn your current lesson into a focused
                practice round.
              </p>
            </div>

            <div className="quiz-hero-icon">
              <Trophy size={23} />
            </div>
          </div>

          <label>Topic</label>
          <input
            value={quizTopic}
            onChange={(event) =>
              setQuizTopic(event.target.value)
            }
            placeholder="e.g. JavaScript closures"
          />

          <div className="quiz-form-grid">
            <div>
              <label>Questions</label>
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

            <div>
              <label>Difficulty</label>
              <select
                value={quizLevel}
                onChange={(event) =>
                  setQuizLevel(event.target.value)
                }
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div className="quiz-context">
            <Brain size={14} />
            AI will create four-option questions with
            explanations for every answer.
          </div>

          <div className="modal-actions">
            <button
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={onStart}
              disabled={
                quizLoading || !quizTopic.trim()
              }
            >
              {quizLoading ? (
                <>
                  <Loader2
                    size={14}
                    className="learn-spin"
                  />
                  Preparing…
                </>
              ) : (
                <>
                  <Trophy size={14} />
                  Start Quiz
                </>
              )}
            </button>
          </div>
        </div>
      ) : !quizSubmitted ? (
        <>
          <div className="modal-heading-row">
            <div>
              <div className="eyebrow">
                PRACTICE QUIZ
              </div>
              <h2>{quizTopic}</h2>
              <p>
                {quizLevel} · {quiz.questions.length}{" "}
                questions
              </p>
            </div>

            <div className="question-progress-pill">
              {
                quizAnswers.filter(
                  (answer) => answer !== null
                ).length
              } / {quiz.questions.length}
            </div>
          </div>

          <div className="quiz-question-list">
            {quiz.questions.map(
              (question, index) => (
                <div
                  className="quiz-question-card"
                  key={index}
                >
                  <div className="q-number">
                    {index + 1}
                  </div>

                  <div className="q-body">
                    <h3>{question.question}</h3>

                    <div className="option-grid">
                      {question.options.map(
                        (option, optionIndex) => (
                          <button
                            key={optionIndex}
                            className={`option-btn ${
                              quizAnswers[index] ===
                              optionIndex
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              onAnswer(
                                index,
                                optionIndex
                              )
                            }
                          >
                            <span>
                              {String.fromCharCode(
                                65 + optionIndex
                              )}
                            </span>
                            {option}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="modal-actions sticky-actions">
            <button
              className="secondary-btn"
              onClick={onClose}
            >
              Later
            </button>
            <button
              className="primary-btn"
              onClick={onSubmit}
            >
              <CheckCircle2 size={14} />
              Submit Quiz
            </button>
          </div>
        </>
      ) : (
        <div className="quiz-result-view">
          <div className="result-medal">
            <Trophy size={29} />
          </div>

          <div className="eyebrow">
            PRACTICE COMPLETE
          </div>
          <h2>Nice work.</h2>

          <div className="result-score">
            {quizScore?.percentage || 0}
            <span>%</span>
          </div>

          <p>
            {quizScore?.score || 0} of{" "}
            {quizScore?.total || 0} answers correct.
          </p>

          <div className="result-stat-row">
            <div>
              <span>Topic</span>
              <strong>{quizTopic}</strong>
            </div>
            <div>
              <span>Level</span>
              <strong>{quizLevel}</strong>
            </div>
            <div>
              <span>Questions</span>
              <strong>
                {quizScore?.total || 0}
              </strong>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="secondary-btn"
              onClick={onReset}
            >
              <ChevronRight size={14} />
              Quiz Setup
            </button>

            <button
              className="primary-btn"
              onClick={onRetake}
            >
              <RotateCcw size={14} />
              Retake
            </button>

            <button
              className="secondary-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Learn;
