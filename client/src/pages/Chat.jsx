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
  MessageCircle,
  Send,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Sparkles,
  Bot,
  User,
  Menu,
  X,
} from "lucide-react";

import Layout from "../components/Layout";
import API from "../services/api";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  const [error, setError] = useState("");

  const [mobileHistoryOpen, setMobileHistoryOpen] =
    useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, loading]);

  /* =========================================================
     AUTO RESIZE TEXTAREA
  ========================================================= */

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height =
      `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  /* =========================================================
     LOAD RECENT CHATS
  ========================================================= */

  const loadConversations = async () => {
    try {
      setLoadingChats(true);

      const response = await API.get("/chat");

      setConversations(
        response.data?.conversations || []
      );
    } catch (error) {
      console.error(
        "Load Conversations Error:",
        error
      );
    } finally {
      setLoadingChats(false);
    }
  };

  /* =========================================================
     LOAD ONE CHAT
  ========================================================= */

  const loadConversation = async (id) => {
    if (!id) return;

    try {
      setError("");

      const response = await API.get(
        `/chat/${id}`
      );

      const conversation =
        response.data?.conversation;

      if (!conversation) return;

      setActiveConversationId(
        conversation._id
      );

      setMessages(
        conversation.messages || []
      );

      navigate(
        `/chat?conversation=${conversation._id}`,
        {
          replace: true,
        }
      );

      setMobileHistoryOpen(false);
    } catch (error) {
      console.error(
        "Load Conversation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load this chat."
      );
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const id =
      searchParams.get("conversation");

    loadConversations();

    if (id) {
      loadConversation(id);
    } else {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [searchParams]);

  /* =========================================================
     CREATE CHAT
  ========================================================= */

  const createConversation = async () => {
    try {
      const response = await API.post(
        "/chat",
        {
          type: "general",
        }
      );

      const conversation =
        response.data?.conversation;

      if (!conversation) {
        throw new Error(
          "Conversation was not created."
        );
      }

      setActiveConversationId(
        conversation._id
      );

      setMessages([]);
      setInput("");

      navigate(
        `/chat?conversation=${conversation._id}`
      );

      await loadConversations();

      window.dispatchEvent(
        new Event("paperpal-chat-updated")
      );

      setMobileHistoryOpen(false);

      return conversation;
    } catch (error) {
      console.error(
        "Create Chat Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create chat."
      );

      return null;
    }
  };

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    try {
      setLoading(true);
      setError("");

      let conversationId =
        activeConversationId;

      if (!conversationId) {
        const newConversation =
          await createConversation();

        if (!newConversation) {
          return;
        }

        conversationId =
          newConversation._id;
      }

      const temporaryUserMessage = {
        _id:
          `temp-user-${Date.now()}`,
        role: "user",
        content: text,
        createdAt:
          new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        temporaryUserMessage,
      ]);

      setInput("");

      const response = await API.post(
        `/chat/${conversationId}/message`,
        {
          message: text,
        }
      );

      const conversation =
        response.data?.conversation;

      if (conversation) {
        setMessages(
          conversation.messages || []
        );
      }

      await loadConversations();

      window.dispatchEvent(
        new Event("paperpal-chat-updated")
      );
    } catch (error) {
      console.error(
        "Send Message Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to send message."
      );

      setMessages((prev) =>
        prev.filter(
          (message) =>
            !String(
              message._id
            ).startsWith("temp-user-")
        )
      );
    } finally {
      setLoading(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  };

  /* =========================================================
     KEYBOARD
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
     RENAME
  ========================================================= */

  const renameChat = async (
    conversation
  ) => {
    const title = window.prompt(
      "Enter new chat name:",
      conversation.title
    );

    if (!title?.trim()) return;

    try {
      await API.patch(
        `/chat/${conversation._id}`,
        {
          title: title.trim(),
        }
      );

      await loadConversations();

      window.dispatchEvent(
        new Event("paperpal-chat-updated")
      );
    } catch (error) {
      console.error(
        "Rename Chat Error:",
        error
      );

      setError(
        "Failed to rename this chat."
      );
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteChat = async (
    conversation
  ) => {
    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) return;

    try {
      await API.delete(
        `/chat/${conversation._id}`
      );

      if (
        activeConversationId ===
        conversation._id
      ) {
        setActiveConversationId(null);
        setMessages([]);
        setInput("");
        navigate("/chat");
      }

      await loadConversations();

      window.dispatchEvent(
        new Event("paperpal-chat-updated")
      );
    } catch (error) {
      console.error(
        "Delete Chat Error:",
        error
      );

      setError(
        "Failed to delete this chat."
      );
    }
  };

  /* =========================================================
     NEW CHAT
  ========================================================= */

  const handleNewChat = async () => {
    await createConversation();
  };

  /* =========================================================
     SUGGESTION
  ========================================================= */

  const useSuggestion = (text) => {
    setInput(text);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatChatDate = (value) => {
    if (!value) return "";

    try {
      return new Date(
        value
      ).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Layout>
      <div className="chat-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="chat-header">
          <div className="chat-heading">
            <button
              className="chat-mobile-menu"
              onClick={() =>
                setMobileHistoryOpen(true)
              }
              aria-label="Open recent chats"
            >
              <Menu size={20} />
            </button>

            <div className="chat-icon">
              <MessageCircle size={22} />
            </div>

            <div>
              <h1>PaperPal AI</h1>

              <p>
                Your intelligent learning and
                productivity assistant.
              </p>
            </div>
          </div>

          <button
            className="chat-new-button"
            onClick={handleNewChat}
            disabled={loading}
          >
            <Plus size={17} />
            <span>New Chat</span>
          </button>
        </header>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="chat-error">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* =====================================================
            CHAT LAYOUT
        ===================================================== */}

        <div className="chat-layout">

          {/* ===================================================
              DESKTOP HISTORY
          =================================================== */}

          <aside className="chat-sidebar">
            <ChatHistory
              conversations={conversations}
              loadingChats={loadingChats}
              activeConversationId={
                activeConversationId
              }
              loadConversation={
                loadConversation
              }
              renameChat={renameChat}
              deleteChat={deleteChat}
              handleNewChat={
                handleNewChat
              }
              formatChatDate={
                formatChatDate
              }
            />
          </aside>

          {/* ===================================================
              MAIN CHAT
          =================================================== */}

          <section className="chat-main">

            {/* Messages */}

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-welcome">
                  <div className="chat-welcome-glow">
                    <div className="chat-welcome-icon">
                      <Sparkles size={28} />
                    </div>
                  </div>

                  <span className="chat-welcome-kicker">
                    PAPERPAL AI
                  </span>

                  <h2>
                    What would you
                    like to learn?
                  </h2>

                  <p>
                    Ask PaperPal anything,
                    solve doubts, prepare for
                    interviews, create study plans,
                    or continue an existing
                    conversation.
                  </p>

                  <div className="chat-suggestions">

                    <button
                      onClick={() =>
                        useSuggestion(
                          "Explain JavaScript promises in simple words"
                        )
                      }
                    >
                      <span>⚡</span>
                      Explain JavaScript promises
                    </button>

                    <button
                      onClick={() =>
                        useSuggestion(
                          "Teach me Salesforce from beginner level"
                        )
                      }
                    >
                      <span>☁️</span>
                      Teach me Salesforce
                    </button>

                    <button
                      onClick={() =>
                        useSuggestion(
                          "Help me prepare for a software developer interview"
                        )
                      }
                    >
                      <span>🎯</span>
                      Prepare for an interview
                    </button>

                    <button
                      onClick={() =>
                        useSuggestion(
                          "Give me a practical study plan for learning Python"
                        )
                      }
                    >
                      <span>📚</span>
                      Create a study plan
                    </button>

                  </div>
                </div>
              ) : (
                <div className="chat-message-list">

                  {messages.map(
                    (message) => (
                      <div
                        key={
                          message._id
                        }
                        className={`chat-message ${message.role}`}
                      >

                        <div className="chat-avatar">
                          {message.role ===
                          "assistant" ? (
                            <Bot size={17} />
                          ) : (
                            <User size={17} />
                          )}
                        </div>

                        <div className="chat-message-body">

                          <div className="chat-message-meta">
                            <span>
                              {message.role ===
                              "assistant"
                                ? "PaperPal AI"
                                : "You"}
                            </span>

                            {message.createdAt && (
                              <time>
                                {new Date(
                                  message.createdAt
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </time>
                            )}
                          </div>

                          <div className="chat-bubble">
                            {message.content}
                          </div>

                        </div>
                      </div>
                    )
                  )}

                  {loading && (
                    <div className="chat-message assistant">
                      <div className="chat-avatar">
                        <Bot size={17} />
                      </div>

                      <div className="chat-message-body">
                        <div className="chat-message-meta">
                          <span>
                            PaperPal AI
                          </span>
                        </div>

                        <div className="chat-thinking">
                          <span className="thinking-dot one" />
                          <span className="thinking-dot two" />
                          <span className="thinking-dot three" />

                          <span>
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* =================================================
                COMPOSER
            ================================================= */}

            <div className="chat-composer-wrapper">
              <div className="chat-composer">

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Message PaperPal AI..."
                  rows={1}
                  disabled={loading}
                />

                <button
                  className="chat-send-button"
                  onClick={sendMessage}
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  aria-label="Send message"
                  title="Send message"
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="chat-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              <div className="chat-hint">
                <span>
                  Enter to send
                </span>

                <span className="chat-hint-dot">
                  •
                </span>

                <span>
                  Shift + Enter for a new line
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            MOBILE CHAT HISTORY DRAWER
        ===================================================== */}

        {mobileHistoryOpen && (
          <div
            className="chat-mobile-overlay"
            onClick={() =>
              setMobileHistoryOpen(false)
            }
          >
            <aside
              className="chat-mobile-sidebar"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="chat-mobile-sidebar-top">
                <strong>
                  Recent Chats
                </strong>

                <button
                  onClick={() =>
                    setMobileHistoryOpen(
                      false
                    )
                  }
                  aria-label="Close recent chats"
                >
                  <X size={19} />
                </button>
              </div>

              <ChatHistory
                conversations={
                  conversations
                }
                loadingChats={
                  loadingChats
                }
                activeConversationId={
                  activeConversationId
                }
                loadConversation={
                  loadConversation
                }
                renameChat={
                  renameChat
                }
                deleteChat={
                  deleteChat
                }
                handleNewChat={
                  handleNewChat
                }
                formatChatDate={
                  formatChatDate
                }
                mobile
              />
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
};

/* =============================================================
   CHAT HISTORY COMPONENT
============================================================= */

const ChatHistory = ({
  conversations,
  loadingChats,
  activeConversationId,
  loadConversation,
  renameChat,
  deleteChat,
  handleNewChat,
  formatChatDate,
  mobile = false,
}) => {
  return (
    <div
      className={
        mobile
          ? "chat-history-wrapper mobile"
          : "chat-history-wrapper"
      }
    >
      <div className="chat-sidebar-header">
        <div>
          <strong>
            Recent Chats
          </strong>

          <span>
            {conversations.length}{" "}
            conversations
          </span>
        </div>

        {!mobile && (
          <button
            onClick={handleNewChat}
            title="New chat"
          >
            <Plus size={17} />
          </button>
        )}
      </div>

      <div className="chat-history">
        {loadingChats ? (
          <div className="chat-loading-small">
            <Loader2
              size={20}
              className="chat-spin"
            />

            <span>Loading chats...</span>
          </div>
        ) : conversations.length ===
          0 ? (
          <div className="chat-empty-history">
            <div>
              <MessageCircle size={21} />
            </div>

            <strong>
              No chats yet
            </strong>

            <span>
              Start a conversation with
              PaperPal AI.
            </span>
          </div>
        ) : (
          conversations.map(
            (conversation) => (
              <div
                key={
                  conversation._id
                }
                className={`chat-history-item ${
                  activeConversationId ===
                  conversation._id
                    ? "active"
                    : ""
                }`}
              >
                <button
                  className="chat-history-main"
                  onClick={() =>
                    loadConversation(
                      conversation._id
                    )
                  }
                >
                  <div className="chat-history-icon">
                    <MessageCircle
                      size={15}
                    />
                  </div>

                  <div className="chat-history-text">
                    <span>
                      {conversation.title ||
                        "New Chat"}
                    </span>

                    <small>
                      {formatChatDate(
                        conversation.lastMessageAt
                      )}
                    </small>
                  </div>
                </button>

                <div className="chat-history-actions">
                  <button
                    onClick={() =>
                      renameChat(
                        conversation
                      )
                    }
                    title="Rename"
                    aria-label="Rename chat"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    onClick={() =>
                      deleteChat(
                        conversation
                      )
                    }
                    title="Delete"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default Chat;