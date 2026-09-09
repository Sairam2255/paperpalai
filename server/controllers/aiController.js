const {
  learnTopic,
  translateText,
  generateFromPrompt,
  generateQuiz,
} = require("../services/geminiService");

const Quiz = require("../models/Quiz");

/* =========================================================
   LEARN TOPIC
========================================================= */

const learnAnything = async (req, res) => {
  try {
    const {
      topic,
      level,
      language,
    } = req.body;

    if (
      !topic ||
      typeof topic !== "string" ||
      !topic.trim()
    ) {
      return res.status(400).json({
        message: "Topic is required.",
      });
    }

    const response = await learnTopic(
      topic.trim(),
      level || "Beginner",
      language || "English"
    );

    return res.status(200).json({
      response,
    });
  } catch (error) {
    console.error(
      "Learn AI Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate learning content.",
    });
  }
};

/* =========================================================
   TRANSLATE
========================================================= */

const translateResponse = async (req, res) => {
  try {
    const {
      text,
      language,
    } = req.body;

    if (
      !text ||
      typeof text !== "string"
    ) {
      return res.status(400).json({
        message: "Text is required.",
      });
    }

    if (
      !language ||
      typeof language !== "string"
    ) {
      return res.status(400).json({
        message: "Language is required.",
      });
    }

    const translatedText =
      await translateText(
        text,
        language
      );

    return res.status(200).json({
      translatedText,
    });
  } catch (error) {
    console.error(
      "Translation Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Translation failed.",
    });
  }
};

/* =========================================================
   DIRECT AI PROMPT
========================================================= */

const askAI = async (req, res) => {
  try {
    const {
      prompt,
      language,
    } = req.body;

    if (
      !prompt ||
      typeof prompt !== "string" ||
      !prompt.trim()
    ) {
      return res.status(400).json({
        message: "Prompt is required.",
      });
    }

    const response =
      await generateFromPrompt(
        prompt.trim(),
        language || "English"
      );

    return res.status(200).json({
      response,
    });
  } catch (error) {
    console.error(
      "Ask AI Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate AI response.",
    });
  }
};

/* =========================================================
   CREATE QUIZ
========================================================= */

const createQuiz = async (req, res) => {
  try {
    const {
      topic,
      level,
      language,
      count,
    } = req.body;

    if (
      !topic ||
      typeof topic !== "string" ||
      !topic.trim()
    ) {
      return res.status(400).json({
        message: "Topic is required.",
      });
    }

    let safeCount = Number(count);

    if (!Number.isFinite(safeCount)) {
      safeCount = 5;
    }

    safeCount = Math.floor(
      safeCount
    );

    if (safeCount < 1) {
      safeCount = 1;
    }

    if (safeCount > 50) {
      safeCount = 50;
    }

    const quizData =
      await generateQuiz(
        topic.trim(),
        level || "Beginner",
        language || "English",
        safeCount
      );

    if (
      !quizData ||
      !Array.isArray(
        quizData.questions
      ) ||
      quizData.questions.length === 0
    ) {
      return res.status(500).json({
        message:
          "AI failed to generate quiz questions.",
      });
    }

    const questions =
      quizData.questions
        .slice(0, 50)
        .map((question) => ({
          question:
            String(
              question.question || ""
            ).trim(),

          options:
            Array.isArray(
              question.options
            )
              ? question.options
                  .slice(0, 4)
                  .map((option) =>
                    String(option).trim()
                  )
              : [],

          correctAnswer:
            Number(
              question.correctAnswer
            ),

          explanation:
            String(
              question.explanation || ""
            ).trim(),
        }));

    const invalidQuestion =
      questions.some(
        (question) => {
          return (
            !question.question ||
            question.options.length !== 4 ||
            !Number.isInteger(
              question.correctAnswer
            ) ||
            question.correctAnswer < 0 ||
            question.correctAnswer > 3
          );
        }
      );

    if (invalidQuestion) {
      return res.status(500).json({
        message:
          "AI returned an invalid quiz structure.",
      });
    }

    const quiz =
      await Quiz.create({
        user: req.user._id,

        topic: topic.trim(),

        level:
          level || "Beginner",

        language:
          language || "English",

        questions,

        answers: [],

        totalQuestions:
          questions.length,

        score: null,

        percentage: null,

        submitted: false,

        submittedAt: null,
      });

    /* Hide correct answers until submission */

    const safeQuestions =
      quiz.questions.map(
        (question) => ({
          _id: question._id,
          question:
            question.question,
          options:
            question.options,
        })
      );

    return res.status(201).json({
      message:
        "Quiz generated successfully.",

      quiz: {
        _id: quiz._id,
        topic: quiz.topic,
        level: quiz.level,
        language: quiz.language,
        totalQuestions:
          quiz.totalQuestions,
        questions:
          safeQuestions,
      },
    });
  } catch (error) {
    console.error(
      "Create Quiz Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate quiz.",
    });
  }
};

/* =========================================================
   SUBMIT QUIZ
========================================================= */

const submitQuiz = async (req, res) => {
  try {
    const {
      id,
    } = req.params;

    const {
      answers,
    } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message:
          "Answers must be an array.",
      });
    }

    const quiz =
      await Quiz.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!quiz) {
      return res.status(404).json({
        message:
          "Quiz not found.",
      });
    }

    if (quiz.submitted) {
      return res.status(400).json({
        message:
          "This quiz has already been submitted.",
      });
    }

    let score = 0;

    const processedAnswers =
      quiz.questions.map(
        (question) => {
          const submittedAnswer =
            answers.find(
              (item) =>
                String(
                  item.questionId
                ) ===
                String(
                  question._id
                )
            );

          let selectedAnswer =
            null;

          if (
            submittedAnswer &&
            submittedAnswer.selectedAnswer !==
              null &&
            submittedAnswer.selectedAnswer !==
              undefined
          ) {
            const value =
              Number(
                submittedAnswer.selectedAnswer
              );

            if (
              Number.isInteger(
                value
              ) &&
              value >= 0 &&
              value <= 3
            ) {
              selectedAnswer =
                value;
            }
          }

          const isCorrect =
            selectedAnswer !== null &&
            selectedAnswer ===
              question.correctAnswer;

          if (isCorrect) {
            score++;
          }

          return {
            questionId:
              question._id,

            selectedAnswer,

            isCorrect,
          };
        }
      );

    const totalQuestions =
      quiz.questions.length;

    const percentage =
      totalQuestions > 0
        ? Math.round(
            (score /
              totalQuestions) *
              100
          )
        : 0;

    quiz.answers =
      processedAnswers;

    quiz.score =
      score;

    quiz.percentage =
      percentage;

    quiz.submitted =
      true;

    quiz.submittedAt =
      new Date();

    await quiz.save();

    return res.status(200).json({
      message:
        "Quiz submitted successfully.",

      quiz,
    });
  } catch (error) {
    console.error(
      "Submit Quiz Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to submit quiz.",
    });
  }
};

/* =========================================================
   GET SINGLE QUIZ
========================================================= */

const getQuiz = async (req, res) => {
  try {
    const {
      id,
    } = req.params;

    const quiz =
      await Quiz.findOne({
        _id: id,
        user: req.user._id,
      });

    if (!quiz) {
      return res.status(404).json({
        message:
          "Quiz not found.",
      });
    }

    return res.status(200).json({
      quiz,
    });
  } catch (error) {
    console.error(
      "Get Quiz Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to load quiz.",
    });
  }
};

/* =========================================================
   QUIZ HISTORY
========================================================= */

const getQuizHistory = async (
  req,
  res
) => {
  try {
    const quizzes =
      await Quiz.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "topic level language totalQuestions score percentage submitted submittedAt createdAt"
        );

    return res.status(200).json({
      quizzes,
    });
  } catch (error) {
    console.error(
      "Quiz History Error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to load quiz history.",
    });
  }
};

/* =========================================================
   PREPARATION ANALYTICS
========================================================= */

const getPreparationAnalytics =
  async (req, res) => {
    try {
      const quizzes =
        await Quiz.find({
          user: req.user._id,
          submitted: true,
        })
          .sort({
            submittedAt: -1,
          })
          .lean();

      /* -----------------------------------------------
         EMPTY
      ------------------------------------------------ */

      if (quizzes.length === 0) {
        return res.status(200).json({
          analytics: {
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            recentPerformance: [],
            topicPerformance: [],
            strongAreas: [],
            averageAreas: [],
            weakAreas: [],
          },
        });
      }

      /* -----------------------------------------------
         BASIC STATS
      ------------------------------------------------ */

      const totalQuizzes =
        quizzes.length;

      const totalQuestions =
        quizzes.reduce(
          (sum, quiz) =>
            sum +
            Number(
              quiz.totalQuestions || 0
            ),
          0
        );

      const totalCorrect =
        quizzes.reduce(
          (sum, quiz) =>
            sum +
            Number(
              quiz.score || 0
            ),
          0
        );

      const averageScore =
        Math.round(
          quizzes.reduce(
            (sum, quiz) =>
              sum +
              Number(
                quiz.percentage || 0
              ),
            0
          ) / totalQuizzes
        );

      const bestScore =
        Math.max(
          ...quizzes.map(
            (quiz) =>
              Number(
                quiz.percentage || 0
              )
          )
        );

      /* -----------------------------------------------
         RECENT PERFORMANCE
      ------------------------------------------------ */

      const recentPerformance =
        quizzes
          .slice(0, 10)
          .reverse()
          .map((quiz) => ({
            id: quiz._id,
            topic: quiz.topic,
            score: quiz.score,
            totalQuestions:
              quiz.totalQuestions,
            percentage:
              Number(
                quiz.percentage || 0
              ),
            date:
              quiz.submittedAt ||
              quiz.createdAt,
          }));

      /* -----------------------------------------------
         TOPIC PERFORMANCE
      ------------------------------------------------ */

      const topicMap = {};

      quizzes.forEach(
        (quiz) => {
          const topic =
            quiz.topic?.trim() ||
            "Unknown";

          if (!topicMap[topic]) {
            topicMap[topic] = {
              topic,
              attempts: 0,
              totalPercentage: 0,
              totalCorrect: 0,
              totalQuestions: 0,
            };
          }

          topicMap[topic].attempts += 1;

          topicMap[
            topic
          ].totalPercentage += Number(
            quiz.percentage || 0
          );

          topicMap[
            topic
          ].totalCorrect += Number(
            quiz.score || 0
          );

          topicMap[
            topic
          ].totalQuestions += Number(
            quiz.totalQuestions || 0
          );
        }
      );

      const topicPerformance =
        Object.values(
          topicMap
        )
          .map((item) => ({
            topic: item.topic,

            attempts:
              item.attempts,

            percentage:
              Math.round(
                item.totalPercentage /
                  item.attempts
              ),

            correct:
              item.totalCorrect,

            questions:
              item.totalQuestions,
          }))
          .sort(
            (a, b) =>
              b.percentage -
              a.percentage
          );

      /* -----------------------------------------------
         PERFORMANCE CATEGORIES

         Strong: 75 - 100
         Average: 60 - 74
         Weak: below 60
      ------------------------------------------------ */

      const strongAreas =
        topicPerformance
          .filter(
            (item) =>
              item.percentage >= 75
          )
          .slice(0, 5)
          .map((item) => ({
            topic: item.topic,
            percentage:
              item.percentage,
          }));

      const averageAreas =
        topicPerformance
          .filter(
            (item) =>
              item.percentage >= 60 &&
              item.percentage < 75
          )
          .slice(0, 5)
          .map((item) => ({
            topic: item.topic,
            percentage:
              item.percentage,
          }));

      const weakAreas =
        topicPerformance
          .filter(
            (item) =>
              item.percentage < 60
          )
          .sort(
            (a, b) =>
              a.percentage -
              b.percentage
          )
          .slice(0, 5)
          .map((item) => ({
            topic: item.topic,
            percentage:
              item.percentage,
          }));

      return res.status(200).json({
        analytics: {
          totalQuizzes,
          averageScore,
          bestScore,
          totalQuestions,
          totalCorrect,
          recentPerformance,
          topicPerformance,
          strongAreas,
          averageAreas,
          weakAreas,
        },
      });
    } catch (error) {
      console.error(
        "Preparation Analytics Error:",
        error.message
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to calculate preparation analytics.",
      });
    }
  };

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  learnAnything,
  translateResponse,
  askAI,
  createQuiz,
  submitQuiz,
  getQuiz,
  getQuizHistory,
  getPreparationAnalytics,
};