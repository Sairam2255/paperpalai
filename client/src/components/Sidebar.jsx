import {
  Sparkles,
  CreditCard,
  BriefcaseBusiness,
  BookOpen,
  FolderOpen,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Home",
      path: "/home",
      icon: Sparkles,
    },
    {
      name: "Bills",
      path: "/bills",
      icon: CreditCard,
    },
    {
      name: "Career",
      path: "/career",
      icon: BriefcaseBusiness,
    },
    {
      name: "Learn",
      path: "/learn",
      icon: BookOpen,
    },
    {
      name: "Library",
      path: "/library",
      icon: FolderOpen,
    },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>
          <FileText size={22} />
        </div>

        <div>
          <div style={styles.logoText}>PaperPal</div>
          <div style={styles.logoSubText}>AI WORKSPACE</div>
        </div>
      </div>

      {/* Main Navigation */}
      <div style={styles.navSection}>
        <p style={styles.sectionLabel}>WORKSPACE</p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.activeNavItem : {}),
              })}
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomSection}>
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            ...styles.navItem,
            ...(isActive ? styles.activeNavItem : {}),
          })}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        <div style={styles.brandFooter}>
          <div style={styles.aiDot}></div>

          <span>AI Intelligence Ready</span>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 10px",
    marginBottom: "42px",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },

  logoSubText: {
    fontSize: "9px",
    color: "#9ca3af",
    letterSpacing: "1.5px",
    marginTop: "2px",
  },

  navSection: {
    flex: 1,
  },

  sectionLabel: {
    fontSize: "10px",
    color: "#6b7280",
    letterSpacing: "1.5px",
    fontWeight: "600",
    padding: "0 12px",
    marginBottom: "12px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px",
    marginBottom: "5px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#9ca3af",
    fontSize: "15px",
    fontWeight: "500",
    transition: "0.2s",
  },

  activeNavItem: {
    background: "rgba(99,102,241,0.18)",
    color: "#ffffff",
  },

  bottomSection: {
    borderTop: "1px solid #1f2937",
    paddingTop: "15px",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px",
    fontSize: "15px",
    cursor: "pointer",
    borderRadius: "10px",
    textAlign: "left",
  },

  brandFooter: {
    marginTop: "20px",
    padding: "12px",
    background: "#1f2937",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: "#9ca3af",
  },

  aiDot: {
    width: "7px",
    height: "7px",
    background: "#10b981",
    borderRadius: "50%",
  },
};

export default Sidebar;