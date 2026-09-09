import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageCircle,
  Receipt,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Layout from "../components/Layout";
import API from "../services/api";

import "./Home.css";

const ROTATING_PROMPTS = [
  "Explain Python decorators in simple words",
  "Help me prepare for a software developer interview",
  "Explain SQL joins with an example",
  "Create a study plan for learning Salesforce",
  "Help me understand this topic step by step",
];

const quickIdeas = [
  {
    title: "Explain something",
    text: "Explain a difficult topic in simple words",
    icon: Lightbulb,
  },
  {
    title: "Learn a skill",
    text: "Create a learning plan for me",
    icon: BookOpen,
  },
  {
    title: "Career help",
    text: "Help me prepare for my career",
    icon: BriefcaseBusiness,
  },
  {
    title: "Ask PaperPal",
    text: "Start a normal AI conversation",
    icon: MessageCircle,
  },
];

function Home() {
  const navigate = useNavigate();

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [promptIndex, setPromptIndex] =
    useState(0);

  const [userName, setUserName] =
    useState("Learner");

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const parsed =
          JSON.parse(storedUser);

        setUserName(
          parsed?.name?.trim() ||
            "Learner"
        );
      }
    } catch {
      setUserName("Learner");
    }
  }, []);

  useEffect(() => {
    const timer =
      setInterval(() => {
        setPromptIndex(
          (current) =>
            (current + 1) %
            ROTATING_PROMPTS.length
        );
      }, 3200);

    return () =>
      clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  const createAndSendChat =
    async (message) => {
      const text =
        message.trim();

      if (!text || loading) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const createResponse =
          await API.post(
            "/chat",
            {
              type: "general",
            }
          );

        const conversation =
          createResponse.data
            ?.conversation;

        if (!conversation?._id) {
          throw new Error(
            "Could not create a chat."
          );
        }

        await API.post(
          `/chat/${conversation._id}/message`,
          {
            message: text,
          }
        );

        window.dispatchEvent(
          new Event(
            "paperpal-chat-updated"
          )
        );

        navigate(
          `/chat?conversation=${conversation._id}`
        );
      } catch (err) {
        console.error(
          "Home chat error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            err.message ||
            "PaperPal could not process your request."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      await createAndSendChat(
        input
      );
    };

  const handleQuickIdea =
    async (text) => {
      setInput(text);
      await createAndSendChat(
        text
      );
    };

  return (
    <Layout>
      <main className="home-page">

        {/* ====================================
            BACKGROUND DECORATION
        ==================================== */}

        <div className="home-orb home-orb-one" />
        <div className="home-orb home-orb-two" />
        <div className="home-orb home-orb-three" />

        <section className="home-shell">

          {/* ==================================
              HERO
          ================================== */}

          <header className="home-hero">

            <div className="home-hero-copy">
              <div className="home-kicker">
                <Sparkles size={14} />
                PAPERPAL INTELLIGENCE
              </div>

              <h1>
                {greeting},{" "}
                <span>{userName}</span>
                <span className="wave">
                  👋
                </span>
              </h1>

              <p>
                Turn documents, questions,
                and ideas into things you can
                understand, learn, and use.
              </p>
            </div>

            <div className="hero-status">
              <div className="status-dot" />
              <span>
                AI is ready
              </span>
            </div>
          </header>

          {/* ==================================
              AI COMMAND CENTER
          ================================== */}

          <section className="home-command">

            <div className="command-glow" />

            <div className="command-icon">
              <Sparkles size={25} />
            </div>

            <div className="command-copy">
              <span>
                ASK PAPERPAL
              </span>

              <strong>
                Your AI starting point
              </strong>
            </div>

            <form
              className="home-command-form"
              onSubmit={handleSubmit}
            >
              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                placeholder={
                  ROTATING_PROMPTS[
                    promptIndex
                  ]
                }
                disabled={loading}
                aria-label="Ask PaperPal"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
              >
                {loading ? (
                  <span className="home-loader">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <ArrowRight size={21} />
                )}
              </button>
            </form>

            <div className="command-footer">
              <span>
                Press Enter to start a conversation
              </span>

              <div className="command-ai-pulse">
                <Zap size={13} />
                Live AI workspace
              </div>
            </div>

          </section>

          {error && (
            <div className="home-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>
            </div>
          )}

          {/* ==================================
              QUICK IDEAS
          ================================== */}

          <section className="home-section">

            <div className="home-section-heading">
              <div>
                <span>
                  EXPLORE
                </span>

                <h2>
                  What can PaperPal do for you?
                </h2>
              </div>

              <p>
                Choose a path or ask
                anything directly.
              </p>
            </div>

            <div className="home-quick-grid">

              {quickIdeas.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="quick-card"
                      onClick={() =>
                        handleQuickIdea(
                          item.text
                        )
                      }
                    >
                      <div className="quick-card-icon">
                        <Icon size={21} />
                      </div>

                      <div className="quick-card-copy">
                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.text}
                        </span>
                      </div>

                      <ArrowRight size={18} />
                    </button>
                  );
                }
              )}

            </div>

          </section>

          {/* ==================================
              MAIN WORKSPACE
          ================================== */}

          <section className="home-section">

            <div className="home-section-heading">
              <div>
                <span>
                  WORKSPACE
                </span>

                <h2>
                  Start with what matters
                </h2>
              </div>

              <p>
                Jump directly into your
                most useful PaperPal tools.
              </p>
            </div>

            <div className="home-feature-grid">

              {/* BILL */}
              <button
                type="button"
                className="workspace-card bill"
                onClick={() =>
                  navigate("/bills")
                }
              >
                <div className="workspace-card-top">
                  <div className="workspace-icon">
                    <Receipt size={23} />
                  </div>

                  <ArrowRight size={19} />
                </div>

                <div className="workspace-card-content">
                  <span className="workspace-label">
                    DOCUMENT INTELLIGENCE
                  </span>

                  <h3>
                    Analyze a Bill
                  </h3>

                  <p>
                    Understand charges,
                    due dates, usage,
                    alerts, and practical
                    saving opportunities.
                  </p>
                </div>

                <div className="workspace-card-bottom">
                  <span>
                    Upload or photograph
                  </span>

                  <span className="card-arrow">
                    →
                  </span>
                </div>
              </button>

              {/* CAREER */}
              <button
                type="button"
                className="workspace-card career"
                onClick={() =>
                  navigate("/career")
                }
              >
                <div className="workspace-card-top">
                  <div className="workspace-icon">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <ArrowRight size={19} />
                </div>

                <div className="workspace-card-content">
                  <span className="workspace-label">
                    CAREER INTELLIGENCE
                  </span>

                  <h3>
                    Build Your Next Move
                  </h3>

                  <p>
                    Explore career paths,
                    strengthen your skills,
                    prepare for interviews,
                    and improve your direction.
                  </p>
                </div>

                <div className="workspace-card-bottom">
                  <span>
                    Plan your growth
                  </span>

                  <span className="card-arrow">
                    →
                  </span>
                </div>
              </button>

              {/* LEARN */}
              <button
                type="button"
                className="workspace-card learn"
                onClick={() =>
                  navigate("/learn")
                }
              >
                <div className="workspace-card-top">
                  <div className="workspace-icon">
                    <BookOpen size={23} />
                  </div>

                  <ArrowRight size={19} />
                </div>

                <div className="workspace-card-content">
                  <span className="workspace-label">
                    LEARNING INTELLIGENCE
                  </span>

                  <h3>
                    Learn Smarter
                  </h3>

                  <p>
                    Learn any topic step by
                    step, ask follow-ups,
                    translate answers, listen,
                    and practise with quizzes.
                  </p>
                </div>

                <div className="workspace-card-bottom">
                  <span>
                    Start learning
                  </span>

                  <span className="card-arrow">
                    →
                  </span>
                </div>
              </button>

            </div>
          </section>

          {/* ==================================
              INTELLIGENCE PANEL
          ================================== */}

          <section className="home-intelligence">

            <div className="intelligence-rays" />

            <div className="intelligence-content">

              <div className="intelligence-kicker">
                <Sparkles size={14} />
                PAPERPAL INTELLIGENCE
              </div>

              <h2>
                More than document storage.
              </h2>

              <p>
                Every document becomes something
                you can understand, question,
                learn from, and use.
              </p>

              <div className="intelligence-metrics">

                <div>
                  <CheckCircle2 size={18} />
                  <span>
                    Understand
                  </span>
                </div>

                <div>
                  <TrendingUp size={18} />
                  <span>
                    Improve
                  </span>
                </div>

                <div>
                  <MessageCircle size={18} />
                  <span>
                    Question
                  </span>
                </div>

                <div>
                  <FileText size={18} />
                  <span>
                    Organize
                  </span>
                </div>

              </div>

            </div>

            <div className="intelligence-visual">

              <div className="visual-ring ring-one" />
              <div className="visual-ring ring-two" />
              <div className="visual-ring ring-three" />

              <div className="visual-orb">
                <Sparkles size={35} />
              </div>

              <div className="floating-card float-one">
                <Receipt size={17} />
                <span>
                  Bill analyzed
                </span>
              </div>

              <div className="floating-card float-two">
                <BookOpen size={17} />
                <span>
                  Lesson ready
                </span>
              </div>

              <div className="floating-card float-three">
                <BriefcaseBusiness size={17} />
                <span>
                  Career insight
                </span>
              </div>

            </div>

          </section>

          {/* ==================================
              BOTTOM MESSAGE
          ================================== */}

          <div className="home-bottom-note">
            <Sparkles size={15} />

            <span>
              PaperPal remembers your conversations
              so your work can continue naturally.
            </span>
          </div>

        </section>
      </main>
    </Layout>
  );
}

export default Home;