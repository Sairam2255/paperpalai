import {
  useState,
} from "react";

import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

import "./AuthRecovery.css";

function ResetPassword() {
  const {
    token,
  } = useParams();

  const navigate =
    useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      try {
        setLoading(true);

        await API.post(
          "/auth/reset-password",
          {
            token,
            password,
          }
        );

        setSuccess(true);

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1800);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "This reset link is invalid or expired."
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

        {success ? (
          <div className="recovery-success-screen">

            <div className="success-check">
              <ShieldCheck size={31} />
            </div>

            <span className="recovery-kicker">
              PASSWORD UPDATED
            </span>

            <h1>
              You’re all set
            </h1>

            <p>
              Your PaperPal password has been
              updated successfully.
              Redirecting you to login...
            </p>

          </div>
        ) : (
          <>
            <div className="recovery-icon">
              <LockKeyhole size={25} />
            </div>

            <span className="recovery-kicker">
              SECURE RESET
            </span>

            <h1>
              Create a new password
            </h1>

            <p>
              Choose a new password with at least
              8 characters.
            </p>

            <form
              className="recovery-form"
              onSubmit={handleSubmit}
            >
              <label>
                New password
              </label>

              <div className="recovery-input">
                <LockKeyhole size={17} />

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <label>
                Confirm password
              </label>

              <div className="recovery-input">
                <LockKeyhole size={17} />

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repeat your password"
                  minLength={8}
                  required
                />
              </div>

              <div className="password-rule">
                <ShieldCheck size={15} />
                Minimum 8 characters
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
                  ? "Updating password..."
                  : "Reset Password"}
              </button>
            </form>
          </>
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

export default ResetPassword;