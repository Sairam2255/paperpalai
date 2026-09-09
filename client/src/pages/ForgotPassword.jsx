import {
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import API from "../services/api";

import "./AuthRecovery.css";

function ForgotPassword() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setLoading(true);
      setError("");
      setMessage("");

      try {
        const response =
          await API.post(
            "/auth/forgot-password",
            {
              email,
            }
          );

        setMessage(
          response.data?.message ||
            "If an account exists for this email, a reset link has been sent."
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to process your request."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="recovery-page">

      <div className="recovery-glow recovery-glow-one" />
      <div className="recovery-glow recovery-glow-two" />

      <section className="recovery-card">

        <div className="recovery-brand">
          <div className="recovery-logo">
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

        {!message ? (
          <>
            <div className="recovery-icon">
              <Mail size={25} />
            </div>

            <span className="recovery-kicker">
              ACCOUNT RECOVERY
            </span>

            <h1>
              Forgot your password?
            </h1>

            <p>
              Enter the email address linked to
              your PaperPal account and we’ll send
              you a secure password reset link.
            </p>

            <form
              className="recovery-form"
              onSubmit={handleSubmit}
            >
              <label>
                Email address
              </label>

              <div className="recovery-input">
                <Mail size={17} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="recovery-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="recovery-primary"
              >
                {loading
                  ? "Sending reset link..."
                  : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="recovery-success-screen">

            <div className="success-check">
              <CheckCircle2 size={30} />
            </div>

            <span className="recovery-kicker">
              CHECK YOUR INBOX
            </span>

            <h1>
              Reset link sent
            </h1>

            <p>
              {message}
            </p>

            <div className="success-email">
              <Mail size={16} />
              {email}
            </div>
          </div>
        )}

        <Link
          to="/login"
          className="recovery-back"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

      </section>
    </main>
  );
}

export default ForgotPassword;