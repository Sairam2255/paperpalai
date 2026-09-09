import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import "./AuthLogin.css";

const GOOGLE_SCRIPT_ID =
  "google-gsi-script";

function loadGoogleIdentityScript() {
  return new Promise(
    (resolve, reject) => {
      if (
        window.google?.accounts?.id
      ) {
        resolve();
        return;
      }

      const existing =
        document.getElementById(
          GOOGLE_SCRIPT_ID
        );

      if (existing) {
        existing.addEventListener(
          "load",
          resolve
        );

        existing.addEventListener(
          "error",
          reject
        );

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.id =
        GOOGLE_SCRIPT_ID;

      script.src =
        "https://accounts.google.com/gsi/client";

      script.async = true;
      script.defer = true;

      script.onload = resolve;
      script.onerror = reject;

      document.head.appendChild(
        script
      );
    }
  );
}

function Login() {
  const navigate =
    useNavigate();

  const googleButtonRef =
    useRef(null);

  const welcomeTimerRef =
    useRef(null);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showWelcome, setShowWelcome] =
    useState(false);

  const [welcomeName, setWelcomeName] =
    useState("Learner");

  useEffect(() => {
    let mounted = true;

    const clientId =
      import.meta.env
        .VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      return () => {
        mounted = false;
      };
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (
          !mounted ||
          !googleButtonRef.current ||
          !window.google?.accounts?.id
        ) {
          return;
        }

        googleButtonRef.current.innerHTML =
          "";

        window.google.accounts.id.initialize(
          {
            client_id: clientId,
            callback:
              handleGoogleCredential,
            ux_mode: "popup",
            color_scheme: "light",
          }
        );

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 340,
            logo_alignment: "left",
          }
        );
      })
      .catch((scriptError) => {
        console.error(
          "Google Identity script error:",
          scriptError
        );
      });

    return () => {
      mounted = false;

      if (
        welcomeTimerRef.current
      ) {
        clearTimeout(
          welcomeTimerRef.current
        );
      }
    };
  }, []);

  const finishLogin = (
    user
  ) => {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setWelcomeName(
      user?.name?.trim() ||
        "Learner"
    );

    setShowWelcome(true);

    welcomeTimerRef.current =
      setTimeout(() => {
        navigate("/home", {
          replace: true,
        });
      }, 1900);
  };

  const handleLogin =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        password.length < 8
      ) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      setLoading(true);

      try {
        const response =
          await API.post(
            "/auth/login",
            {
              email,
              password,
            }
          );

        localStorage.setItem(
          "token",
          response.data.token
        );

        finishLogin(
          response.data.user
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Login failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  async function handleGoogleCredential(
    googleResponse
  ) {
    const credential =
      googleResponse?.credential;

    if (!credential) {
      setError(
        "Google did not return a valid credential."
      );
      return;
    }

    setError("");
    setGoogleLoading(true);

    try {
      const response =
        await API.post(
          "/auth/google",
          {
            credential,
          }
        );

      localStorage.setItem(
        "token",
        response.data.token
      );

      finishLogin(
        response.data.user
      );
    } catch (err) {
      console.error(
        "Google Login Error:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  if (showWelcome) {
    return (
      <main className="login-page welcome-mode">
        <div className="welcome-stars" />

        <div className="welcome-core">
          <div className="welcome-orb">
            <Sparkles size={31} />
          </div>

          <span className="welcome-kicker">
            PAPERPAL AI
          </span>

          <h1>
            Hello, {welcomeName}! 👋
          </h1>

          <p>
            Your workspace is ready.
            Let’s continue learning.
          </p>

          <div className="welcome-line">
            <span />
            <span />
            <span />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">

      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <section className="login-card">

        <div className="login-brand">
          <div className="login-logo">
            P
          </div>

          <div>
            <strong>
              PaperPal AI
            </strong>

            <span>
              AI Learning Assistant
            </span>
          </div>
        </div>

        <div className="login-kicker">
          <Sparkles size={13} />
          YOUR INTELLIGENT WORKSPACE
        </div>

        <h1>
          Welcome back.
        </h1>

        <p className="login-description">
          Sign in to continue your
          learning, documents, and
          conversations.
        </p>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <label>
            Email
          </label>

          <div className="login-input">
            <Mail size={17} />

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="password-heading">
            <label>
              Password
            </label>

            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="login-input">
            <LockKeyhole
              size={17}
            />

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              minLength={8}
              required
            />
          </div>

          <div className="login-rule">
            <ShieldCheck size={14} />
            Password must contain at least 8 characters
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={
              loading ||
              googleLoading
            }
          >
            {loading
              ? "Signing in..."
              : "Sign In"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>

        </form>

        <div className="login-divider">
          <span />
          OR
          <span />
        </div>

        <div
          ref={googleButtonRef}
          className="google-button-container"
        />

        {googleLoading && (
          <p className="google-status">
            Signing you in with Google...
          </p>
        )}

        {!import.meta.env
          .VITE_GOOGLE_CLIENT_ID && (
          <p className="google-setup">
            Add VITE_GOOGLE_CLIENT_ID to
            client/.env to enable Google login.
          </p>
        )}

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>

      </section>
    </main>
  );
}

export default Login;