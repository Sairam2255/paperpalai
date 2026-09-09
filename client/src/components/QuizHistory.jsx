import { useEffect, useState } from "react";

import {
  History,
  Eye,
  Trophy,
  Loader,
  X,
  CheckCircle,
  XCircle,
  Share2,
} from "lucide-react";

import API from "../services/api";

function QuizHistory() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedQuiz, setSelectedQuiz] =
    useState(null);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [sharing, setSharing] =
    useState(false);

  /* =====================================================
     LOAD HISTORY
  ===================================================== */

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get("/ai/quizzes");

      setQuizzes(
        response.data.quizzes || []
      );
    } catch (error) {
      console.error(
        "Quiz History Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load quiz history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  /* =====================================================
     VIEW QUIZ
  ===================================================== */

  const handleViewQuiz = async (
    quizId
  ) => {
    try {
      setAnalysisLoading(true);
      setError("");

      const response =
        await API.get(
          `/ai/quiz/${quizId}`
        );

      setSelectedQuiz(
        response.data.quiz
      );
    } catch (error) {
      console.error(
        "View Quiz Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load quiz analysis."
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose = () => {
    setSelectedQuiz(null);
  };

  /* =====================================================
     SHARE
  ===================================================== */

  const handleShare = async () => {
    if (!selectedQuiz) return;

    try {
      setSharing(true);

      const shareText = `🎓 PaperPal AI Quiz Result

Topic: ${selectedQuiz.topic}
Level: ${selectedQuiz.level}

Score: ${selectedQuiz.score}/${selectedQuiz.totalQuestions}
Percentage: ${selectedQuiz.percentage}%

Learn. Practice. Improve. Prepare. 🚀`;

      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "PaperPal AI Quiz Result",
          text: shareText,
        });
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          shareText
        );

        alert(
          "Quiz result copied to clipboard!"
        );
      } else {
        alert(shareText);
      }
    } catch (error) {
      console.error(
        "Share Error:",
        error
      );
    } finally {
      setSharing(false);
    }
  };

  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="quiz-history-card">

        <div className="quiz-history-loading">

          <Loader
            size={20}
            className="spin"
          />

          Loading your quiz history...

        </div>

      </div>
    );
  }

  return (
    <div className="quiz-history-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="quiz-history-header">

        <div className="quiz-history-title-row">

          <div className="quiz-history-icon">
            <History size={21} />
          </div>

          <div>

            <h2 className="quiz-history-title">
              Quiz History
            </h2>

            <p className="quiz-history-subtitle">
              Review your previous quizzes
              and results.
            </p>

          </div>

        </div>

        <div className="quiz-history-count">
          {quizzes.length}{" "}
          {quizzes.length === 1
            ? "Quiz"
            : "Quizzes"}
        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="quiz-history-error">
          {error}
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!error &&
        quizzes.length === 0 && (
          <div className="quiz-history-empty">

            <History
              size={38}
              strokeWidth={1.5}
            />

            <h3>
              No quizzes yet
            </h3>

            <p>
              Complete your first quiz and
              your result will appear here.
            </p>

          </div>
        )}

      {/* =================================================
          HISTORY LIST
      ================================================= */}

      {quizzes.length > 0 && (
        <div className="quiz-history-list">

          {quizzes.map((quiz) => (

            <div
              key={quiz._id}
              className="quiz-history-item"
            >

              <div className="quiz-history-main">

                <div className="quiz-history-topic">
                  {quiz.topic}
                </div>

                <div className="quiz-history-meta">

                  <span>
                    {quiz.level}
                  </span>

                  <span>•</span>

                  <span>
                    {quiz.totalQuestions} Questions
                  </span>

                  <span>•</span>

                  <span>
                    {formatDate(
                      quiz.submittedAt ||
                        quiz.createdAt
                    )}
                  </span>

                </div>

              </div>

              <div className="quiz-history-score">

                {quiz.submitted ? (
                  <>
                    <div className="quiz-history-percentage">
                      {quiz.percentage}%
                    </div>

                    <div className="quiz-history-score-small">
                      {quiz.score}/
                      {quiz.totalQuestions}
                    </div>
                  </>
                ) : (
                  <div className="quiz-history-pending">
                    Not submitted
                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={() =>
                  handleViewQuiz(
                    quiz._id
                  )
                }
                className="learn-btn learn-btn-outline quiz-history-view"
                disabled={
                  analysisLoading
                }
              >
                {analysisLoading ? (
                  <Loader
                    size={15}
                    className="spin"
                  />
                ) : (
                  <Eye size={16} />
                )}

                View
              </button>

            </div>
          ))}

        </div>
      )}

      {/* =================================================
          SAVED QUIZ MODAL
      ================================================= */}

      {selectedQuiz && (

        <div className="quiz-analysis-overlay">

          <div className="quiz-analysis-modal">

            {/* HEADER */}

            <div className="quiz-analysis-modal-header">

              <div>

                <div className="quiz-mode">

                  <History size={17} />

                  Saved Quiz

                </div>

                <h2 className="quiz-analysis-modal-title">
                  {selectedQuiz.topic}
                </h2>

                <p className="quiz-analysis-modal-meta">
                  {selectedQuiz.level} •{" "}
                  {selectedQuiz.language} •{" "}
                  {selectedQuiz.totalQuestions} Questions
                </p>

              </div>

              <button
                type="button"
                onClick={handleClose}
                className="quiz-history-close"
              >
                <X size={21} />
              </button>

            </div>

            {/* SCORE */}

            <div className="quiz-history-result">

              <div className="quiz-history-result-icon">
                <Trophy size={28} />
              </div>

              <div>

                <div className="quiz-history-result-score">
                  {selectedQuiz.percentage}%
                </div>

                <div className="quiz-history-result-detail">
                  {selectedQuiz.score} /{" "}
                  {selectedQuiz.totalQuestions}
                </div>

              </div>

              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="learn-btn learn-btn-outline"
              >

                <Share2 size={16} />

                {sharing
                  ? "Sharing..."
                  : "Share Result"}

              </button>

            </div>

            {/* QUESTIONS */}

            <div className="quiz-history-analysis">

              {selectedQuiz.questions.map(
                (
                  question,
                  index
                ) => {

                  const answer =
                    selectedQuiz.answers?.find(
                      (item) =>
                        String(
                          item.questionId
                        ) ===
                        String(
                          question._id
                        )
                    );

                  const selected =
                    answer?.selectedAnswer;

                  const correct =
                    question.correctAnswer;

                  const isCorrect =
                    answer?.isCorrect;

                  return (
                    <div
                      key={question._id}
                      className={`analysis-question ${
                        isCorrect
                          ? "correct"
                          : "incorrect"
                      }`}
                    >

                      <div className="analysis-question-head">

                        {isCorrect ? (
                          <CheckCircle
                            size={20}
                            className="analysis-status correct-icon"
                          />
                        ) : (
                          <XCircle
                            size={20}
                            className="analysis-status incorrect-icon"
                          />
                        )}

                        <div>

                          <p className="analysis-question-text">
                            {index + 1}.{" "}
                            {question.question}
                          </p>

                          <div
                            className={`analysis-status-text ${
                              isCorrect
                                ? "correct-text"
                                : "incorrect-text"
                            }`}
                          >
                            {isCorrect
                              ? "Correct"
                              : "Incorrect"}
                          </div>

                        </div>

                      </div>

                      <div className="analysis-options">

                        {question.options.map(
                          (
                            option,
                            optionIndex
                          ) => {

                            const isSelected =
                              selected ===
                              optionIndex;

                            const isCorrectOption =
                              correct ===
                              optionIndex;

                            let className =
                              "analysis-option";

                            if (
                              isCorrectOption
                            ) {
                              className +=
                                " correct-option";
                            } else if (
                              isSelected
                            ) {
                              className +=
                                " selected-wrong";
                            }

                            return (
                              <div
                                key={
                                  optionIndex
                                }
                                className={
                                  className
                                }
                              >

                                <strong>
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex
                                  )}
                                  .
                                </strong>{" "}

                                {option}

                                {isCorrectOption && (
                                  <span className="analysis-badge">
                                    ✓ Correct Answer
                                  </span>
                                )}

                                {isSelected &&
                                  !isCorrectOption && (
                                    <span className="analysis-badge">
                                      Your Answer
                                    </span>
                                  )}

                              </div>
                            );
                          }
                        )}

                      </div>

                      {question.explanation && (

                        <div className="analysis-explanation">

                          <div className="analysis-explanation-title">
                            Explanation
                          </div>

                          <div className="analysis-explanation-text">
                            {
                              question.explanation
                            }
                          </div>

                        </div>

                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default QuizHistory;