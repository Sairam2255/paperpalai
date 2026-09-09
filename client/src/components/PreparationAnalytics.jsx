import {
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  Trophy,
  Target,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader,
  BookOpen,
} from "lucide-react";

import API from "../services/api";

function PreparationAnalytics() {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAnalytics =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await API.get(
            "/ai/analytics"
          );

        setAnalytics(
          response.data.analytics
        );
      } catch (error) {
        console.error(
          "Preparation Analytics Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load preparation analytics."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAnalytics();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="analytics-card">

        <div className="analytics-loading">

          <Loader
            size={20}
            className="spin"
          />

          Loading preparation analytics...

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="analytics-card">

        <div className="analytics-error">
          {error}
        </div>

      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="analytics-header">

        <div className="analytics-header-left">

          <div className="analytics-icon">
            <BarChart3 size={22} />
          </div>

          <div>

            <h2 className="analytics-title">
              Preparation Analytics
            </h2>

            <p className="analytics-subtitle">
              Track your learning and
              quiz performance over time.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {analytics.totalQuizzes === 0 ? (

        <div className="analytics-empty">

          <BookOpen
            size={42}
            strokeWidth={1.5}
          />

          <h3>
            No preparation data yet
          </h3>

          <p>
            Complete a quiz to start
            tracking your progress.
          </p>

        </div>

      ) : (

        <>

          {/* =============================================
              SUMMARY STATS
          ============================================= */}

          <div className="analytics-stat-grid">

            <div className="analytics-stat">

              <div className="analytics-stat-icon purple">
                <Target size={19} />
              </div>

              <div>

                <div className="analytics-stat-value">
                  {
                    analytics.totalQuizzes
                  }
                </div>

                <div className="analytics-stat-label">
                  Quizzes Completed
                </div>

              </div>

            </div>

            <div className="analytics-stat">

              <div className="analytics-stat-icon blue">
                <BarChart3 size={19} />
              </div>

              <div>

                <div className="analytics-stat-value">
                  {
                    analytics.averageScore
                  }%
                </div>

                <div className="analytics-stat-label">
                  Average Score
                </div>

              </div>

            </div>

            <div className="analytics-stat">

              <div className="analytics-stat-icon gold">
                <Trophy size={19} />
              </div>

              <div>

                <div className="analytics-stat-value">
                  {
                    analytics.bestScore
                  }%
                </div>

                <div className="analytics-stat-label">
                  Best Score
                </div>

              </div>

            </div>

            <div className="analytics-stat">

              <div className="analytics-stat-icon green">
                <CheckCircle size={19} />
              </div>

              <div>

                <div className="analytics-stat-value">
                  {
                    analytics.totalCorrect
                  }
                  /
                  {
                    analytics.totalQuestions
                  }
                </div>

                <div className="analytics-stat-label">
                  Correct Answers
                </div>

              </div>

            </div>

          </div>

          {/* =============================================
              RECENT PERFORMANCE
          ============================================= */}

          {analytics.recentPerformance
            ?.length > 0 && (

            <div className="analytics-section">

              <div className="analytics-section-title">

                <TrendingUp
                  size={17}
                />

                Recent Performance

              </div>

              <div className="analytics-performance-list">

                {analytics.recentPerformance.map(
                  (item) => (

                    <div
                      key={
                        String(
                          item.id
                        )
                      }
                      className="analytics-performance-item"
                    >

                      <div className="analytics-performance-topic">
                        {item.topic}
                      </div>

                      <div className="analytics-progress">

                        <div className="analytics-progress-track">

                          <div
                            className="analytics-progress-bar"
                            style={{
                              width: `${item.percentage}%`,
                            }}
                          />

                        </div>

                        <span>
                          {
                            item.percentage
                          }%
                        </span>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {/* =============================================
              TOPIC PERFORMANCE
          ============================================= */}

          {analytics.topicPerformance
            ?.length > 0 && (

            <div className="analytics-section">

              <div className="analytics-section-title">

                <BookOpen
                  size={17}
                />

                Topic Performance

              </div>

              <div className="analytics-topic-list">

                {analytics.topicPerformance.map(
                  (item) => (

                    <div
                      key={item.topic}
                      className="analytics-topic-item"
                    >

                      <div>

                        <div className="analytics-topic-name">
                          {item.topic}
                        </div>

                        <div className="analytics-topic-meta">
                          {
                            item.attempts
                          }{" "}
                          {item.attempts ===
                          1
                            ? "attempt"
                            : "attempts"}
                        </div>

                      </div>

                      <div
                        className={`analytics-topic-score ${
                          item.percentage >=
                          75
                            ? "strong"
                            : item.percentage >=
                              60
                            ? "average"
                            : "weak"
                        }`}
                      >
                        {
                          item.percentage
                        }%
                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {/* =============================================
              THREE CATEGORIES
          ============================================= */}

          <div className="analytics-category-grid">

            {/* STRONG */}

            <div className="analytics-category-card strong-category">

              <div className="analytics-category-header">

                <div className="analytics-category-icon">
                  <TrendingUp
                    size={18}
                  />
                </div>

                <div>

                  <div className="analytics-category-title">
                    Strong Areas
                  </div>

                  <div className="analytics-category-rule">
                    75% and above
                  </div>

                </div>

              </div>

              {analytics.strongAreas
                ?.length > 0 ? (

                <div className="analytics-category-list">

                  {analytics.strongAreas.map(
                    (item) => (

                      <div
                        key={item.topic}
                        className="analytics-category-item"
                      >

                        <span>
                          {item.topic}
                        </span>

                        <strong>
                          {
                            item.percentage
                          }%
                        </strong>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="analytics-category-empty">
                  No strong areas yet.
                </div>

              )}

            </div>

            {/* AVERAGE */}

            <div className="analytics-category-card average-category">

              <div className="analytics-category-header">

                <div className="analytics-category-icon">
                  <Minus size={18} />
                </div>

                <div>

                  <div className="analytics-category-title">
                    Average Areas
                  </div>

                  <div className="analytics-category-rule">
                    60% – 74%
                  </div>

                </div>

              </div>

              {analytics.averageAreas
                ?.length > 0 ? (

                <div className="analytics-category-list">

                  {analytics.averageAreas.map(
                    (item) => (

                      <div
                        key={item.topic}
                        className="analytics-category-item"
                      >

                        <span>
                          {item.topic}
                        </span>

                        <strong>
                          {
                            item.percentage
                          }%
                        </strong>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="analytics-category-empty">
                  No average areas yet.
                </div>

              )}

            </div>

            {/* WEAK */}

            <div className="analytics-category-card weak-category">

              <div className="analytics-category-header">

                <div className="analytics-category-icon">
                  <TrendingDown
                    size={18}
                  />
                </div>

                <div>

                  <div className="analytics-category-title">
                    Needs Improvement
                  </div>

                  <div className="analytics-category-rule">
                    Below 60%
                  </div>

                </div>

              </div>

              {analytics.weakAreas
                ?.length > 0 ? (

                <div className="analytics-category-list">

                  {analytics.weakAreas.map(
                    (item) => (

                      <div
                        key={item.topic}
                        className="analytics-category-item"
                      >

                        <span>
                          {item.topic}
                        </span>

                        <strong>
                          {
                            item.percentage
                          }%
                        </strong>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="analytics-category-empty">
                  Great! No weak areas yet.
                </div>

              )}

            </div>

          </div>

          {/* =============================================
              LEGEND
          ============================================= */}

          <div className="analytics-legend">

            <span>
              <i className="legend-dot strong-dot" />
              Strong ≥ 75%
            </span>

            <span>
              <i className="legend-dot average-dot" />
              Average 60–74%
            </span>

            <span>
              <i className="legend-dot weak-dot" />
              Needs Improvement &lt; 60%
            </span>

          </div>

        </>
      )}

    </div>
  );
}

export default PreparationAnalytics;