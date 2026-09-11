import {
  useState,
} from "react";

import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Target,
  BriefcaseBusiness,
  Brain,
  X,
} from "lucide-react";

import API from "../services/api";

import "./ATSAnalysis.css";

function ATSAnalysis() {
  const [file, setFile] =
    useState(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const [targetRole, setTargetRole] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const handleFileChange =
    (event) => {
      const selected =
        event.target.files?.[0];

      if (!selected) {
        return;
      }

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (
        !validTypes.includes(
          selected.type
        )
      ) {
        setError(
          "Please upload a PDF or DOCX resume."
        );
        return;
      }

      if (
        selected.size >
        10 * 1024 * 1024
      ) {
        setError(
          "Resume must be smaller than 10 MB."
        );
        return;
      }

      setFile(selected);
      setError("");
      setResult(null);
    };

  const analyzeResume =
    async () => {
      setError("");

      if (!file) {
        setError(
          "Please upload your resume."
        );
        return;
      }

      if (
        !jobDescription.trim()
      ) {
        setError(
          "Please paste the job description."
        );
        return;
      }

      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "resume",
          file
        );

        formData.append(
          "jobDescription",
          jobDescription
        );

        formData.append(
          "targetRole",
          targetRole
        );

        const response =
          await API.post(
            "/resume/analyze",
            formData
          );

        setResult(
          response.data.analysis
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to analyze resume."
        );
      } finally {
        setLoading(false);
      }
    };

  const scoreClass =
    (score) => {
      if (score >= 80) {
        return "excellent";
      }

      if (score >= 60) {
        return "good";
      }

      if (score >= 40) {
        return "average";
      }

      return "weak";
    };

  return (
    <section className="ats-analysis-section">
      <div className="ats-analysis-header">
        <div>
          <span className="ats-kicker">
            PAPERPAL AI
          </span>

          <h2>
            Resume & Job Match
          </h2>

          <p>
            See how well your resume
            aligns with a target job
            before you apply.
          </p>
        </div>

        <div className="ats-header-icon">
          <Sparkles size={24} />
        </div>
      </div>

      <div className="ats-grid">
        <div className="ats-input-card">
          <label>
            <FileText size={16} />
            Upload Resume
          </label>

          <label className="ats-upload-box">
            <input
              type="file"
              accept=".pdf,.docx"
              hidden
              onChange={
                handleFileChange
              }
            />

            <Upload size={24} />

            <strong>
              {file
                ? file.name
                : "Choose PDF or DOCX"}
            </strong>

            <span>
              Maximum size: 10 MB
            </span>
          </label>

          {file && (
            <div className="ats-selected-file">
              <FileText size={16} />

              <span>
                {file.name}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFile(null)
                }
              >
                <X size={15} />
              </button>
            </div>
          )}

          <label>
            <Target size={16} />
            Target Role
          </label>

          <input
            className="ats-input"
            placeholder="e.g. Salesforce Developer"
            value={targetRole}
            onChange={(e) =>
              setTargetRole(
                e.target.value
              )
            }
          />

          <label>
            <BriefcaseBusiness
              size={16}
            />
            Job Description
          </label>

          <textarea
            className="ats-textarea"
            placeholder="Paste the complete job description here..."
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(
                e.target.value
              )
            }
          />

          {error && (
            <div className="ats-error">
              <AlertTriangle
                size={16}
              />
              {error}
            </div>
          )}

          <button
            type="button"
            className="ats-analyze-button"
            onClick={
              analyzeResume
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="ats-spin"
                />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Analyze Match
              </>
            )}
          </button>
        </div>

        <div className="ats-result-card">
          {!result ? (
            <div className="ats-empty">
              <Brain size={38} />

              <h3>
                Your analysis will appear here
              </h3>

              <p>
                Upload your resume and
                paste a job description
                to get your ATS and match
                insights.
              </p>
            </div>
          ) : (
            <>
              <div className="ats-score-grid">
                <ScoreCard
                  title="ATS Score"
                  value={
                    result.atsScore
                  }
                  icon={
                    <Sparkles
                      size={18}
                    />
                  }
                />

                <ScoreCard
                  title="Job Match"
                  value={
                    result.jobMatchPercentage
                  }
                  icon={
                    <Target
                      size={18}
                    />
                  }
                />

                <ScoreCard
                  title="Experience Fit"
                  value={
                    result.experienceFitPercentage
                  }
                  icon={
                    <BriefcaseBusiness
                      size={18}
                    />
                  }
                />
              </div>

              <KeywordSection
                title="Matched Skills"
                items={
                  result.matchedSkills
                }
                type="matched"
              />

              <KeywordSection
                title="Missing Skills"
                items={
                  result.missingSkills
                }
                type="missing"
              />

              <KeywordSection
                title="Matched Keywords"
                items={
                  result.matchedKeywords
                }
                type="matched"
              />

              <KeywordSection
                title="Missing Keywords"
                items={
                  result.missingKeywords
                }
                type="missing"
              />

              <div className="ats-suggestions">
                <div className="ats-subheading">
                  <CheckCircle2
                    size={18}
                  />
                  Improvement Suggestions
                </div>

                {result
                  .improvementSuggestions
                  ?.length ? (
                  result.improvementSuggestions.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="ats-suggestion"
                        key={
                          index
                        }
                      >
                        {item}
                      </div>
                    )
                  )
                ) : (
                  <div className="ats-suggestion">
                    Your resume looks
                    reasonably aligned.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ScoreCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      className={`ats-score-card ${scoreClassStatic(
        value
      )}`}
    >
      <div className="ats-score-icon">
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong>
        {value}%
      </strong>
    </div>
  );
}

function scoreClassStatic(
  score
) {
  if (score >= 80) {
    return "excellent";
  }

  if (score >= 60) {
    return "good";
  }

  if (score >= 40) {
    return "average";
  }

  return "weak";
}

function KeywordSection({
  title,
  items,
  type,
}) {
  return (
    <div className="ats-keyword-section">
      <div className="ats-subheading">
        {type === "matched" ? (
          <CheckCircle2
            size={17}
          />
        ) : (
          <AlertTriangle
            size={17}
          />
        )}

        {title}
      </div>

      <div className="ats-chip-list">
        {items?.length ? (
          items.map(
            (
              item,
              index
            ) => (
              <span
                key={index}
                className={`ats-chip ${type}`}
              >
                {item}
              </span>
            )
          )
        ) : (
          <span className="ats-no-items">
            None identified
          </span>
        )}
      </div>
    </div>
  );
}

export default ATSAnalysis;