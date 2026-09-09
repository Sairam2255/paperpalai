import {
  Bell,
  Search,
  Sparkles,
} from "lucide-react";

function Topbar() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const firstName =
    user.name?.split(" ")[0] || "User";

  return (
    <header style={styles.topbar}>
      <div style={styles.searchBox}>
        <Search size={19} color="#94a3b8" />

        <input
          placeholder="Search your knowledge..."
          style={styles.searchInput}
        />

        <span style={styles.shortcut}>⌘ K</span>
      </div>

      <div style={styles.rightSection}>
        <button style={styles.aiButton}>
          <Sparkles size={17} />
          Ask PaperPal
        </button>

        <button style={styles.iconButton}>
          <Bell size={20} />
        </button>

        <div style={styles.userProfile}>
          <div style={styles.avatar}>
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div style={styles.userInfo}>
            <div style={styles.userName}>
              {firstName}
            </div>

            <div style={styles.userStatus}>
              Personal Workspace
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    height: "76px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 34px",
    boxSizing: "border-box",
  },

  searchBox: {
    width: "360px",
    height: "42px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    gap: "10px",
    background: "#f8fafc",
  },

  searchInput: {
    border: "none",
    outline: "none",
    flex: 1,
    background: "transparent",
    fontSize: "14px",
  },

  shortcut: {
    fontSize: "11px",
    color: "#94a3b8",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "3px 6px",
    borderRadius: "5px",
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  aiButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#ffffff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  iconButton: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
  },

  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
  },

  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
  },

  userStatus: {
    fontSize: "10px",
    color: "#94a3b8",
  },
};

export default Topbar;