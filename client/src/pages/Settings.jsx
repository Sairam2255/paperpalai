import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Globe2,
  LogOut,
  Moon,
  Palette,
  Sun,
  User,
  Settings as SettingsIcon,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Trash2,
  Loader2,
} from "lucide-react";

import Layout from "../components/Layout";
import API from "../services/api";
import "./Settings.css";

const LANGUAGES = [
  { value: "English", native: "English", flag: "🇬🇧" },
  { value: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { value: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { value: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { value: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

const applyTheme = (theme) => {
  const safeTheme =
    theme === "dark" ? "dark" : "light";

  document.documentElement.dataset.theme =
    safeTheme;

  document.body.dataset.theme =
    safeTheme;

  localStorage.setItem(
    "paperpal-theme",
    safeTheme
  );

  window.dispatchEvent(
    new CustomEvent(
      "paperpal-settings-changed",
      {
        detail: {
          theme: safeTheme,
        },
      }
    )
  );
};

const applyLanguage = (language) => {
  const validLanguage =
    LANGUAGES.some(
      (item) => item.value === language
    )
      ? language
      : "English";

  localStorage.setItem(
    "paperpal-language",
    validLanguage
  );

  // Keep the Bills preference in sync.
  localStorage.setItem(
    "paperpal-bill-default-language",
    validLanguage
  );

  // Keep a simple Learn preference in sync.
  localStorage.setItem(
    "paperpal-learn-default-language",
    validLanguage
  );

  window.dispatchEvent(
    new CustomEvent(
      "paperpal-settings-changed",
      {
        detail: {
          language: validLanguage,
        },
      }
    )
  );
};

function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] =
    useState(
      () =>
        localStorage.getItem(
          "paperpal-theme"
        ) || "light"
    );

  const [language, setLanguage] =
    useState(
      () =>
        localStorage.getItem(
          "paperpal-language"
        ) || "English"
    );

  const [savedMessage, setSavedMessage] =
    useState("");

  const [geminiKey, setGeminiKey] =
    useState("");

  const [geminiEnabled, setGeminiEnabled] =
    useState(false);

  const [geminiHasKey, setGeminiHasKey] =
    useState(false);

  const [geminiLoading, setGeminiLoading] =
    useState(false);

  const [geminiMessage, setGeminiMessage] =
    useState("");

  const [geminiError, setGeminiError] =
    useState("");

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          "null"
      );
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    loadGeminiSettings();
  }, []);

  const loadGeminiSettings = async () => {
    try {
      setGeminiError("");

      const response = await API.get(
        "/ai-settings/gemini"
      );

      setGeminiEnabled(
        Boolean(response.data?.enabled)
      );

      setGeminiHasKey(
        Boolean(response.data?.hasKey)
      );
    } catch (error) {
      console.error(
        "Load Gemini Settings Error:",
        error
      );
    }
  };

  const saveGeminiApiKey = async () => {
    const apiKey = geminiKey.trim();

    if (!apiKey) {
      setGeminiError(
        "Please enter your Gemini API key."
      );
      return;
    }

    try {
      setGeminiLoading(true);
      setGeminiError("");
      setGeminiMessage("");

      const response = await API.post(
        "/ai-settings/gemini",
        { apiKey }
      );

      setGeminiKey("");
      setGeminiEnabled(
        Boolean(response.data?.enabled)
      );
      setGeminiHasKey(
        Boolean(response.data?.hasKey)
      );
      setGeminiMessage(
        response.data?.message ||
          "Your personal Gemini API key has been saved securely."
      );
    } catch (error) {
      console.error(
        "Save Gemini Key Error:",
        error
      );

      setGeminiError(
        error.response?.data?.message ||
          "Failed to save Gemini API key."
      );
    } finally {
      setGeminiLoading(false);
    }
  };

  const removeGeminiApiKey = async () => {
    const confirmed = window.confirm(
      "Remove your personal Gemini API key and return to PaperPal's default AI?"
    );

    if (!confirmed) return;

    try {
      setGeminiLoading(true);
      setGeminiError("");
      setGeminiMessage("");

      const response = await API.delete(
        "/ai-settings/gemini"
      );

      setGeminiKey("");
      setGeminiEnabled(false);
      setGeminiHasKey(false);
      setGeminiMessage(
        response.data?.message ||
          "Your personal Gemini API key has been removed."
      );
    } catch (error) {
      console.error(
        "Remove Gemini Key Error:",
        error
      );

      setGeminiError(
        error.response?.data?.message ||
          "Failed to remove Gemini API key."
      );
    } finally {
      setGeminiLoading(false);
    }
  };

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    showSaved("Appearance updated");
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    applyLanguage(nextLanguage);
    showSaved("Language preference updated");
  };

  const showSaved = (message) => {
    setSavedMessage(message);

    window.setTimeout(() => {
      setSavedMessage("");
    }, 1800);
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("paperpal-logout")
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Layout>
      <main className="settings-page">
        <header className="settings-header">
          <div className="settings-header-icon">
            <SettingsIcon size={22} />
          </div>

          <div>
            <span className="settings-kicker">
              PAPERPAL
            </span>

            <h1>Settings</h1>

            <p>
              Personalize how PaperPal looks,
              speaks, and responds.
            </p>
          </div>
        </header>

        {savedMessage && (
          <div className="settings-saved">
            <Check size={15} />
            {savedMessage}
          </div>
        )}

        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-heading-icon">
              <Palette size={19} />
            </div>

            <div>
              <h2>Appearance</h2>
              <p>
                Choose the look that is comfortable
                for you.
              </p>
            </div>
          </div>

          <div className="theme-grid">
            <button
              type="button"
              className={`theme-card ${
                theme === "light"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeTheme("light")
              }
            >
              <div className="theme-preview light-preview">
                <div className="preview-sidebar" />
                <div className="preview-content">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="theme-card-bottom">
                <div>
                  <strong>
                    <Sun size={16} />
                    Light
                  </strong>

                  <small>
                    Clean and bright
                  </small>
                </div>

                {theme === "light" && (
                  <span className="selected-check">
                    <Check size={13} />
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              className={`theme-card ${
                theme === "dark"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeTheme("dark")
              }
            >
              <div className="theme-preview dark-preview">
                <div className="preview-sidebar" />
                <div className="preview-content">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="theme-card-bottom">
                <div>
                  <strong>
                    <Moon size={16} />
                    Dark
                  </strong>

                  <small>
                    Easy on the eyes
                  </small>
                </div>

                {theme === "dark" && (
                  <span className="selected-check">
                    <Check size={13} />
                  </span>
                )}
              </div>
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-heading-icon">
              <Globe2 size={19} />
            </div>

            <div>
              <h2>Language</h2>
              <p>
                Choose your default PaperPal
                language.
              </p>
            </div>
          </div>

          <div className="settings-language-grid">
            {LANGUAGES.map((item) => (
              <button
                type="button"
                key={item.value}
                className={`settings-language ${
                  language === item.value
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  changeLanguage(
                    item.value
                  )
                }
              >
                <span className="language-flag">
                  {item.flag}
                </span>

                <span className="language-names">
                  <strong>
                    {item.native}
                  </strong>

                  <small>
                    {item.value}
                  </small>
                </span>

                {language ===
                  item.value && (
                  <span className="selected-check">
                    <Check size={13} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="language-note">
            <Sparkles size={14} />

            <span>
              Your selected language is shared
              with Bills and Learn preferences.
              New analysis and learning requests
              can use it automatically.
            </span>
          </div>
        </section>

        <section className="settings-section gemini-settings-section">
          <div className="settings-section-heading">
            <div className="settings-heading-icon">
              <KeyRound size={19} />
            </div>

            <div>
              <h2>Gemini AI</h2>
              <p>
                Use your own Gemini API quota for PaperPal AI.
              </p>
            </div>
          </div>

          <div className="gemini-settings-card">
            <div className="gemini-status-row">
              <div className="gemini-status-icon">
                <ShieldCheck size={20} />
              </div>

              <div className="gemini-status-copy">
                <strong>
                  {geminiEnabled
                    ? "Personal Gemini AI is active"
                    : "Using PaperPal AI"}
                </strong>

                <span>
                  {geminiEnabled
                    ? "Your Gemini API key is being used for your AI requests."
                    : "PaperPal's default Gemini key is being used."}
                </span>
              </div>

              <div
                className={`gemini-status-pill ${
                  geminiEnabled ? "active" : ""
                }`}
              >
                {geminiEnabled ? "Personal" : "Default"}
              </div>
            </div>

            <div className="gemini-input-row">
              <input
                type="password"
                value={geminiKey}
                onChange={(event) =>
                  setGeminiKey(event.target.value)
                }
                placeholder="Paste your Gemini API key"
                autoComplete="off"
                spellCheck="false"
                disabled={geminiLoading}
              />

              <button
                type="button"
                onClick={saveGeminiApiKey}
                disabled={geminiLoading}
              >
                {geminiLoading ? (
                  <>
                    <Loader2 size={16} className="gemini-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Save Key
                  </>
                )}
              </button>
            </div>

            {geminiHasKey && (
              <button
                type="button"
                className="gemini-remove-button"
                onClick={removeGeminiApiKey}
                disabled={geminiLoading}
              >
                <Trash2 size={15} />
                Remove Personal Key
              </button>
            )}

            {geminiMessage && (
              <div className="gemini-success-message">
                <Check size={15} />
                {geminiMessage}
              </div>
            )}

            {geminiError && (
              <div className="gemini-error-message">
                {geminiError}
              </div>
            )}

            <div className="gemini-security-note">
              <ShieldCheck size={15} />
              <span>
                Your API key is encrypted before it is stored. PaperPal never displays the saved key back to you.
              </span>
            </div>
          </div>
        </section>

        <section className="settings-section profile-section">
          <div className="settings-section-heading">
            <div className="settings-heading-icon">
              <User size={19} />
            </div>

            <div>
              <h2>Account</h2>
              <p>
                Your current PaperPal account.
              </p>
            </div>
          </div>

          <div className="account-card">
            <div className="account-avatar">
              {(
                user?.name ||
                "U"
              )
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="account-info">
              <strong>
                {user?.name ||
                  "PaperPal User"}
              </strong>

              <span>
                {user?.email ||
                  "No email available"}
              </span>
            </div>
          </div>
        </section>

        <section className="logout-section">
          <div>
            <div className="logout-title">
              <LogOut size={18} />
              <strong>
                Sign out of PaperPal
              </strong>
            </div>

            <p>
              This will clear your current
              session on this device.
            </p>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </section>
      </main>
    </Layout>
  );
}

export default Settings;
