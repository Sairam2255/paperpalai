const Interview = require("../models/Interview");

const {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  analyzeCompletedInterview,
} = require("../services/geminiService");


/* =====================================================
   START INTERVIEW
===================================================== */

const startInterview = async (
  req,
  res
) => {
  try {
    const {
      type,
      targetRole,
      skills = [],
    } = req.body;

    if (!type) {
      return res.status(400).json({
        message:
          "Interview type is required.",
      });
    }

    if (
      !["technical", "hr", "mock"].includes(
        type
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid interview type.",
      });
    }

    if (!targetRole?.trim()) {
      return res.status(400).json({
        message:
          "Target role is required.",
      });
    }

    console.log(
      `Starting ${type} interview for ${targetRole}`
    );

    const generated =
      await generateInterviewQuestions(
        type,
        targetRole,
        skills
      );

    if (
      !generated?.questions?.length
    ) {
      return res.status(500).json({
        message:
          "Failed to generate interview questions.",
      });
    }

    const interview =
      await Interview.create({
        user: req.user._id,

        type,

        targetRole,

        questions:
          generated.questions,

        currentQuestion: 0,

        totalQuestions:
          generated.questions.length,

        completed: false,
      });

    return res.status(201).json({
      message:
        "Interview started successfully.",

      interview,
    });
  } catch (error) {
    console.error(
      "Start Interview Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to start interview.",
    });
  }
};


/* =====================================================
   SUBMIT INTERVIEW ANSWER
===================================================== */

const submitInterviewAnswer =
  async (
    req,
    res
  ) => {
    try {
      const {
        questionId,
        answer,
      } = req.body;

      if (!questionId) {
        return res.status(400).json({
          message:
            "Question ID is required.",
        });
      }

      if (!answer?.trim()) {
        return res.status(400).json({
          message:
            "Please provide an answer.",
        });
      }

      const interview =
        await Interview.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!interview) {
        return res.status(404).json({
          message:
            "Interview not found.",
        });
      }

      if (interview.completed) {
        return res.status(400).json({
          message:
            "Interview has already been completed.",
        });
      }

      const question =
        interview.questions.id(
          questionId
        );

      if (!question) {
        return res.status(404).json({
          message:
            "Interview question not found.",
        });
      }

      /* ===============================================
         AI EVALUATION
      =============================================== */

      const result =
        await evaluateInterviewAnswer(
          interview.type,
          interview.targetRole,
          question.question,
          question.expectedAnswer,
          answer.trim()
        );

      question.userAnswer =
        answer.trim();

      question.feedback =
        result.feedback || "";

      question.betterAnswer =
        result.betterAnswer || "";

      question.score =
        Math.max(
          0,
          Math.min(
            10,
            Number(result.score) || 0
          )
        );

      question.answered = true;

      const questionIndex =
        interview.questions.findIndex(
          (item) =>
            item._id.toString() ===
            questionId.toString()
        );

      const nextIndex =
        questionIndex + 1;

      /* ===============================================
         INTERVIEW COMPLETE
      =============================================== */

      if (
        nextIndex >=
        interview.questions.length
      ) {
        const totalScore =
          interview.questions.reduce(
            (sum, item) =>
              sum +
              (Number(item.score) || 0),
            0
          );

        const maxScore =
          interview.questions.length *
          10;

        const calculatedPercentage =
          maxScore > 0
            ? Math.round(
                (totalScore /
                  maxScore) *
                  100
              )
            : 0;

        interview.totalScore =
          totalScore;

        interview.percentage =
          calculatedPercentage;

        interview.currentQuestion =
          interview.questions.length;

        interview.completed = true;

        interview.completedAt =
          new Date();

        /* =============================================
           FINAL AI ANALYSIS
        ============================================= */

        const finalAnalysis =
          await analyzeCompletedInterview(
            interview.type,
            interview.targetRole,
            interview.questions
          );

        interview.overallFeedback =
          finalAnalysis.overallFeedback ||
          "";

        interview.interviewTips =
          finalAnalysis.interviewTips ||
          [];

        interview.strengths =
          finalAnalysis.strengths ||
          [];

        interview.areasOfImprovement =
          finalAnalysis.areasOfImprovement ||
          [];

        interview.recommendation =
          finalAnalysis.recommendation ||
          "";

        const aiPercentage =
          Number(
            finalAnalysis.percentage
          );

        if (
          Number.isFinite(
            aiPercentage
          ) &&
          aiPercentage >= 0 &&
          aiPercentage <= 100
        ) {
          interview.percentage =
            Math.round(
              aiPercentage
            );
        }

        await interview.save();

        return res.status(200).json({
          message:
            "Interview completed successfully.",

          completed: true,

          evaluation: {
            score: question.score,
            feedback:
              question.feedback,
            betterAnswer:
              question.betterAnswer,
          },

          interview,
        });
      }

      /* ===============================================
         MOVE TO NEXT QUESTION
      =============================================== */

      interview.currentQuestion =
        nextIndex;

      await interview.save();

      return res.status(200).json({
        message:
          "Answer evaluated successfully.",

        completed: false,

        evaluation: {
          score: question.score,
          feedback:
            question.feedback,
          betterAnswer:
            question.betterAnswer,
        },

        interview,

        nextQuestion:
          interview.questions[
            nextIndex
          ],
      });
    } catch (error) {
      console.error(
        "Submit Interview Answer Error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to evaluate interview answer.",
      });
    }
  };


/* =====================================================
   GET SINGLE INTERVIEW
===================================================== */

const getInterview =
  async (
    req,
    res
  ) => {
    try {
      const interview =
        await Interview.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!interview) {
        return res.status(404).json({
          message:
            "Interview not found.",
        });
      }

      return res.status(200).json({
        interview,
      });
    } catch (error) {
      console.error(
        "Get Interview Error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load interview.",
      });
    }
  };


/* =====================================================
   INTERVIEW HISTORY
===================================================== */

const getInterviewHistory =
  async (
    req,
    res
  ) => {
    try {
      const interviews =
        await Interview.find({
          user: req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .limit(20);

      return res.status(200).json({
        interviews,
      });
    } catch (error) {
      console.error(
        "Interview History Error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load interview history.",
      });
    }
  };


module.exports = {
  startInterview,
  submitInterviewAnswer,
  getInterview,
  getInterviewHistory,
};