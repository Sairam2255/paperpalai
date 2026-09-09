import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Home as HomeIcon,
  Receipt,
  BriefcaseBusiness,
  BookOpen,
  LibraryBig,
  Settings,
  MessageCircle,
  Plus,
  Pencil,
  Trash2,
  Menu,
  X,
} from "lucide-react";

import API from "../services/api";

import "./Layout.css";

const navItems = [
  {
    label: "Home",
    path: "/home",
    icon: HomeIcon,
  },
  {
    label: "Bills",
    path: "/bills",
    icon: Receipt,
  },
  {
    label: "Career",
    path: "/career",
    icon: BriefcaseBusiness,
  },
  {
    label: "Learn",
    path: "/learn",
    icon: BookOpen,
  },
  {
    label: "Library",
    path: "/library",
    icon: LibraryBig,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const Layout = ({
  children,
}) => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [recentChats, setRecentChats] =
    useState([]);

  /* =========================================================
     LOAD RECENT CHATS
  ========================================================= */

  const loadRecentChats =
    async () => {
      try {
        const response =
          await API.get(
            "/chat"
          );

        setRecentChats(
          response.data?.conversations ||
            []
        );
      } catch (error) {
        console.error(
          "Recent Chats Error:",
          error
        );
      }
    };

  useEffect(() => {
    loadRecentChats();

    const handleChatUpdated =
      () => {
        loadRecentChats();
      };

    window.addEventListener(
      "paperpal-chat-updated",
      handleChatUpdated
    );

    return () => {
      window.removeEventListener(
        "paperpal-chat-updated",
        handleChatUpdated
      );
    };
  }, []);

  /* =========================================================
     OPEN CHAT
  ========================================================= */

  const openChat =
    (chat) => {
      if (
        chat.type ===
        "learn"
      ) {
        navigate(
          `/learn?conversation=${chat._id}`
        );
      } else {
        navigate(
          `/chat?conversation=${chat._id}`
        );
      }

      setSidebarOpen(false);
    };

  /* =========================================================
     NEW CHAT
  ========================================================= */

  const newChat =
    () => {
      navigate("/chat");

      setSidebarOpen(false);
    };

  /* =========================================================
     RENAME CHAT
  ========================================================= */

  const renameChat =
    async (chat) => {
      const title =
        window.prompt(
          "Enter chat name:",
          chat.title
        );

      if (
        !title?.trim()
      ) {
        return;
      }

      try {
        await API.patch(
          `/chat/${chat._id}`,
          {
            title:
              title.trim(),
          }
        );

        loadRecentChats();
      } catch (error) {
        console.error(
          "Rename Recent Chat Error:",
          error
        );
      }
    };

  /* =========================================================
     DELETE CHAT
  ========================================================= */

  const deleteChat =
    async (chat) => {
      const confirmed =
        window.confirm(
          "Delete this chat?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await API.delete(
          `/chat/${chat._id}`
        );

        loadRecentChats();

        const currentConversation =
          new URLSearchParams(
            location.search
          ).get(
            "conversation"
          );

        if (
          currentConversation ===
          chat._id
        ) {
          navigate(
            chat.type ===
              "learn"
              ? "/learn"
              : "/chat"
          );
        }
      } catch (error) {
        console.error(
          "Delete Recent Chat Error:",
          error
        );
      }
    };

  return (
    <div className="app-layout">
      <button
        className="mobile-menu-button"
        onClick={() =>
          setSidebarOpen(true)
        }
      >
        <Menu
          size={20}
        />
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            P
          </div>

          <div>
            <strong>
              PaperPal
            </strong>

            <span>
              AI Learning Assistant
            </span>
          </div>

          <button
            className="mobile-close-button"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
          >
            <X
              size={19}
            />
          </button>
        </div>

        <button
          className="sidebar-new-chat"
          onClick={
            newChat
          }
        >
          <Plus
            size={17}
          />
          New Chat
        </button>

        <div className="sidebar-section-title">
          Workspace
        </div>

        <nav className="sidebar-nav">
          {navItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  className={({
                    isActive,
                  }) =>
                    `sidebar-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setSidebarOpen(
                      false
                    )
                  }
                >
                  <Icon
                    size={18}
                  />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            }
          )}

          <NavLink
            to="/chat"
            className={({
              isActive,
            }) =>
              `sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
          >
            <MessageCircle
              size={18}
            />

            <span>
              Chat
            </span>
          </NavLink>
        </nav>

        <div className="sidebar-section-title recent-title">
          Recent Chats
        </div>

        <div className="sidebar-recent">
          {recentChats.length ===
          0 ? (
            <div className="sidebar-no-chats">
              No chats yet
            </div>
          ) : (
            recentChats
              .slice(0, 20)
              .map(
                (chat) => (
                  <div
                    key={
                      chat._id
                    }
                    className="sidebar-chat-item"
                  >
                    <button
                      className="sidebar-chat-main"
                      onClick={() =>
                        openChat(
                          chat
                        )
                      }
                    >
                      <MessageCircle
                        size={
                          14
                        }
                      />

                      <span>
                        {chat.title ||
                          "New Chat"}
                      </span>
                    </button>

                    <div className="sidebar-chat-actions">
                      <button
                        onClick={() =>
                          renameChat(
                            chat
                          )
                        }
                        title="Rename"
                      >
                        <Pencil
                          size={
                            13
                          }
                        />
                      </button>

                      <button
                        onClick={() =>
                          deleteChat(
                            chat
                          )
                        }
                        title="Delete"
                      >
                        <Trash2
                          size={
                            13
                          }
                        />
                      </button>
                    </div>
                  </div>
                )
              )
          )}
        </div>
      </aside>

      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
