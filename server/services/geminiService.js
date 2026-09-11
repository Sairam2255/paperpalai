// server/services/geminiService.js

const { GoogleGenAI } = require("@google/genai");
const {
  getCurrentApiKey,
} = require("../utils/aiContext");

/* =========================================================
   CONFIG
========================================================= */

const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

const QUIZ_MODEL =
  process.env.GEMINI_QUIZ_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

const MAX_RETRIES = Math.max(
  0,
  Number(
    process.env.GEMINI_MAX_RETRIES || 2
  )
);

const DEFAULT_MAX_OUTPUT_TOKENS =
  Math.max(
    400,
    Number(
      process.env.GEMINI_MAX_OUTPUT_TOKENS ||
        1600
    )
  );

/* =========================================================
   BASIC HELPERS
========================================================= */

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

const getErrorCode = (error) =>
  Number(
    error?.status ||
      error?.code ||
      error?.response?.status ||
      error?.error?.code ||
      0
  );

const getErrorMessage = (error) =>
  String(
    error?.message ||
      error?.response?.data?.message ||
      error?.error?.message ||
      error ||
      ""
  );

const isQuotaError = (error) => {
  const message =
    getErrorMessage(error).toLowerCase();

  return (
    message.includes(
      "quota_exceeded"
    ) ||
    message.includes(
      "quota exceeded"
    ) ||
    message.includes(
      "resource exhausted"
    ) ||
    message.includes(
      "daily limit"
    ) ||
    message.includes(
      "usage limit"
    ) ||
    message.includes(
      "rate limit exceeded"
    )
  );
};

const isAuthenticationError = (
  error
) => {
  const code =
    getErrorCode(error);

  const message =
    getErrorMessage(error).toLowerCase();

  return (
    code === 401 ||
    code === 403 ||
    message.includes(
      "invalid api key"
    ) ||
    message.includes(
      "api key not valid"
    ) ||
    message.includes(
      "authentication"
    ) ||
    message.includes(
      "unauthorized"
    ) ||
    message.includes(
      "forbidden"
    )
  );
};

const isRetryableError = (
  error
) => {
  const code =
    getErrorCode(error);

  return (
    code === 429 ||
    code === 500 ||
    code === 502 ||
    code === 503 ||
    code === 504
  );
};

/* =========================================================
   ERROR MESSAGES
========================================================= */

const createFriendlyError = (
  error
) => {
  const code =
    getErrorCode(error);

  if (isQuotaError(error)) {
    const friendly =
      new Error(
        "Gemini quota is exhausted for this API key. Add a personal Gemini API key in PaperPal Settings or use a Gemini project with available quota."
      );

    friendly.code =
      "GEMINI_QUOTA_EXCEEDED";

    friendly.status = 429;

    return friendly;
  }

  if (
    isAuthenticationError(error)
  ) {
    const friendly =
      new Error(
        "The active Gemini API key is invalid or unauthorized. Please add a valid Gemini API key in Settings."
      );

    friendly.code =
      "GEMINI_INVALID_KEY";

    friendly.status = code || 401;

    return friendly;
  }

  if (code === 404) {
    const friendly =
      new Error(
        "The configured Gemini model is unavailable. Check GEMINI_MODEL on the server."
      );

    friendly.code =
      "GEMINI_MODEL_NOT_FOUND";

    friendly.status = 404;

    return friendly;
  }

  if (isRetryableError(error)) {
    const friendly =
      new Error(
        "Gemini is temporarily busy. Please try again in a moment."
      );

    friendly.code =
      "GEMINI_TEMPORARY_ERROR";

    friendly.status = code || 503;

    return friendly;
  }

  const friendly =
    new Error(
      getErrorMessage(error) ||
        "PaperPal AI could not generate a response."
    );

  friendly.status =
    code || 500;

  return friendly;
};

/* =========================================================
   GEMINI CLIENT
========================================================= */

const createGeminiClient = (
  apiKey
) => {
  if (!apiKey) {
    const error =
      new Error(
        "No Gemini API key is configured."
      );

    error.code =
      "GEMINI_NO_KEY";

    error.status = 500;

    throw error;
  }

  return new GoogleGenAI({
    apiKey,
  });
};

/* =========================================================
   RESPONSE TEXT
========================================================= */

const extractResponseText = (
  response
) => {
  if (!response) {
    return "";
  }

  if (
    typeof response.text ===
    "string"
  ) {
    return response.text.trim();
  }

  if (
    typeof response.text ===
    "function"
  ) {
    try {
      return String(
        response.text() || ""
      ).trim();
    } catch {
      return "";
    }
  }

  if (
    Array.isArray(
      response.candidates
    )
  ) {
    return response.candidates
      .flatMap(
        (candidate) =>
          candidate?.content
            ?.parts || []
      )
      .map(
        (part) =>
          part?.text || ""
      )
      .join("")
      .trim();
  }

  return "";
};

/* =========================================================
   SINGLE KEY REQUEST
========================================================= */

const requestWithRetry =
  async (
    apiKey,
    prompt,
    model,
    options = {}
  ) => {
    const ai =
      createGeminiClient(
        apiKey
      );

    let lastError = null;

    for (
      let attempt = 0;
      attempt <= MAX_RETRIES;
      attempt += 1
    ) {
      try {
        const config = {
          maxOutputTokens:
            Number(
              options.maxOutputTokens ||
                DEFAULT_MAX_OUTPUT_TOKENS
            ),
        };

        if (
          options.responseMimeType
        ) {
          config.responseMimeType =
            options.responseMimeType;
        }

        const response =
          await ai.models.generateContent(
            {
              model,
              contents: prompt,
              config,
            }
          );

        const text =
          extractResponseText(
            response
          );

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        return text;
      } catch (error) {
        lastError = error;

        console.error(
          "Gemini request error:",
          {
            model,
            attempt:
              attempt + 1,
            maxAttempts:
              MAX_RETRIES + 1,
            code:
              getErrorCode(
                error
              ),
            message:
              getErrorMessage(
                error
              ),
          }
        );

        /*
         * Never retry genuine quota
         * or authentication failures.
         */
        if (
          isQuotaError(error) ||
          isAuthenticationError(
            error
          )
        ) {
          throw error;
        }

        const retryable =
          isRetryableError(
            error
          );

        if (
          !retryable ||
          attempt >=
            MAX_RETRIES
        ) {
          throw error;
        }

        const delay =
          800 *
            Math.pow(
              2,
              attempt
            ) +
          Math.floor(
            Math.random() * 500
          );

        await sleep(delay);
      }
    }

    throw (
      lastError ||
      new Error(
        "Gemini request failed."
      )
    );
  };

/* =========================================================
   MAIN AI FUNCTION
========================================================= */

const generateAIContent =
  async (
    prompt,
    model = MODEL,
    options = {}
  ) => {
    const personalKey =
      String(
        getCurrentApiKey() || ""
      ).trim();

    const serverKey =
      String(
        process.env
          .GEMINI_API_KEY || ""
      ).trim();

    /*
     * Personal key first.
     * Server key second.
     *
     * Duplicate keys are removed.
     */
    const keys = [
      personalKey,
      serverKey,
    ].filter(
      (
        key,
        index,
        array
      ) =>
        key &&
        array.indexOf(
          key
        ) === index
    );

    if (!keys.length) {
      const error =
        new Error(
          "No Gemini API key is configured. Add your personal Gemini API key in Settings."
        );

      error.code =
        "GEMINI_NO_KEY";

      error.status = 500;

      throw error;
    }

    let lastError = null;

    for (
      let index = 0;
      index < keys.length;
      index += 1
    ) {
      const activeKey =
        keys[index];

      try {
        return await requestWithRetry(
          activeKey,
          prompt,
          model,
          options
        );
      } catch (error) {
        lastError = error;

        /*
         * If personal key has a quota/auth
         * problem, try server key.
         *
         * If server key is the only key,
         * return the useful error.
         */
        const canTryNext =
          index <
          keys.length - 1;

        if (
          canTryNext &&
          (
            isQuotaError(
              error
            ) ||
            isAuthenticationError(
              error
            )
          )
        ) {
          console.warn(
            "Active Gemini key failed. Trying the fallback key."
          );

          continue;
        }

        throw createFriendlyError(
          error
        );
      }
    }

    throw createFriendlyError(
      lastError
    );
  };

/* =========================================================
   JSON CLEANER
========================================================= */

const parseAIJson = (
  raw
) => {
  let cleaned =
    String(
      raw || ""
    ).trim();

  cleaned =
    cleaned
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();

  try {
    return JSON.parse(
      cleaned
    );
  } catch {}

  const firstObject =
    cleaned.indexOf("{");

  const lastObject =
    cleaned.lastIndexOf("}");

  if (
    firstObject !== -1 &&
    lastObject >
      firstObject
  ) {
    try {
      return JSON.parse(
        cleaned.slice(
          firstObject,
          lastObject + 1
        )
      );
    } catch {}
  }

  const firstArray =
    cleaned.indexOf("[");

  const lastArray =
    cleaned.lastIndexOf("]");

  if (
    firstArray !== -1 &&
    lastArray > firstArray
  ) {
    try {
      return JSON.parse(
        cleaned.slice(
          firstArray,
          lastArray + 1
        )
      );
    } catch {}
  }

  throw new Error(
    "AI returned invalid JSON."
  );
};

/* =========================================================
   ARRAY / NUMBER HELPERS
========================================================= */

const toStringArray = (
  value,
  limit = 30
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        item !== null &&
        item !== undefined
    )
    .slice(0, limit)
    .map((item) =>
      String(item).trim()
    )
    .filter(Boolean);
};

const clamp = (
  value,
  min,
  max
) => {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return min;
  }

  return Math.max(
    min,
    Math.min(
      max,
      Math.round(number)
    )
  );
};

/* =========================================================
   DOCUMENT SUMMARY
========================================================= */

const generateSummary =
  async (
    text
  ) => {
    return generateAIContent(`
You are PaperPal AI.

Summarize the following document
clearly and accurately.

Rules:
- use simple language
- preserve important facts
- preserve dates and amounts
- do not invent information
- organize the response clearly

DOCUMENT:

${String(
  text || ""
).slice(0, 30000)}
`);
  };

/* =========================================================
   DOCUMENT QUESTION
========================================================= */

const askQuestion =
  async (
    text,
    question
  ) => {
    return generateAIContent(`
You are PaperPal AI.

Answer the user's question using
only the supplied document.

If the answer is not contained
in the document, say so clearly.

DOCUMENT:

${String(
  text || ""
).slice(0, 30000)}

QUESTION:

${question}
`);
  };

/* =========================================================
   LEARN TOPIC
========================================================= */

const learnTopic =
  async (
    topic,
    level = "Beginner",
    language = "English"
  ) => {
    return generateAIContent(`
You are PaperPal AI Learning Assistant.

Teach the following topic to a
${level} learner.

Respond in ${language}.

Include:
1. What it is
2. Key concepts
3. Simple example
4. How it works
5. Why it matters
6. Quick summary
7. Exam/interview points

TOPIC:
${topic}
`);
  };

/* =========================================================
   TRANSLATE
========================================================= */

const translateText =
  async (
    text,
    language
  ) => {
    return generateAIContent(
      `
Translate the following text into
${language}.

Preserve:
- meaning
- names
- dates
- numbers
- amounts
- technical terms

Return ONLY the translation.

TEXT:
${String(
  text || ""
).slice(0, 20000)}
`,
      QUIZ_MODEL,
      {
        maxOutputTokens: 1200,
      }
    );
  };

/* =========================================================
   GENERIC PROMPT
========================================================= */

const generateFromPrompt =
  async (
    prompt,
    language = "English"
  ) => {
    return generateAIContent(`
You are PaperPal AI.

Respond in ${language}.

USER REQUEST:

${prompt}
`);
  };

/* =========================================================
   QUIZ
========================================================= */

const normalizeCorrectAnswer =
  (
    value,
    options
  ) => {
    if (
      typeof value ===
      "number"
    ) {
      return value;
    }

    const text =
      String(
        value ?? ""
      ).trim();

    if (
      /^[0-3]$/.test(text)
    ) {
      return Number(text);
    }

    if (
      /^[A-D]$/i.test(text)
    ) {
      return (
        text
          .toUpperCase()
          .charCodeAt(0) - 65
      );
    }

    const match =
      options.findIndex(
        (option) =>
          option.toLowerCase() ===
          text.toLowerCase()
      );

    return match;
  };

const generateQuiz =
  async (
    topic,
    level = "Beginner",
    language = "English",
    count = 5
  ) => {
    const safeCount =
      Math.max(
        1,
        Math.min(
          15,
          Number(count) || 5
        )
      );

    const raw =
      await generateAIContent(
        `
Create exactly ${safeCount}
multiple-choice questions about:

TOPIC:
${topic}

LEVEL:
${level}

LANGUAGE:
${language}

Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- exactly 4 options
- correctAnswer MUST be 0, 1, 2 or 3
- exactly one correct answer
- explanation required
- no markdown
- no code fences
- no text outside JSON
`,
        QUIZ_MODEL,
        {
          responseMimeType:
            "application/json",

          maxOutputTokens:
            Math.max(
              1200,
              safeCount * 260
            ),
        }
      );

    let parsed;

    try {
      parsed =
        parseAIJson(raw);
    } catch {
      throw new Error(
        "Gemini returned an invalid quiz response. Please try again."
      );
    }

    if (
      !Array.isArray(
        parsed?.questions
      )
    ) {
      throw new Error(
        "Gemini returned an invalid quiz structure."
      );
    }

    const questions =
      parsed.questions
        .slice(0, safeCount)
        .map(
          (
            item,
            index
          ) => {
            const options =
              Array.isArray(
                item?.options
              )
                ? item.options.map(
                    (option) =>
                      String(
                        option ??
                          ""
                      ).trim()
                  )
                : [];

            if (
              !item?.question ||
              options.length !== 4
            ) {
              throw new Error(
                `Invalid quiz question ${
                  index + 1
                }.`
              );
            }

            const correctAnswer =
              normalizeCorrectAnswer(
                item.correctAnswer,
                options
              );

            if (
              !Number.isInteger(
                correctAnswer
              ) ||
              correctAnswer <
                0 ||
              correctAnswer >
                3
            ) {
              throw new Error(
                `Invalid answer key for quiz question ${
                  index + 1
                }.`
              );
            }

            return {
              question:
                String(
                  item.question
                ).trim(),

              options,

              correctAnswer,

              explanation:
                String(
                  item.explanation ||
                    ""
                ).trim(),
            };
          }
        );

    if (!questions.length) {
      throw new Error(
        "No quiz questions were generated."
      );
    }

    return {
      questions,
    };
  };

/* =========================================================
   CAREER ANALYSIS
========================================================= */

const generateCareerAnalysis =
  async (
    careerGoal,
    targetRole,
    resumeText
  ) => {
    const raw =
      await generateAIContent(
        `
You are PaperPal AI Career Assistant.

Analyze the candidate for the
requested career.

CAREER GOAL:
${careerGoal}

TARGET ROLE:
${targetRole}

RESUME:
${String(
  resumeText || ""
).slice(0, 30000)}

Return ONLY valid JSON.

{
  "currentSkills": [],
  "skillsToImprove": [],
  "recommendedSkills": [],
  "careerReadiness": 0,
  "roadmap": [
    {
      "step": 1,
      "title": "",
      "description": "",
      "status": "Current"
    },
    {
      "step": 2,
      "title": "",
      "description": "",
      "status": "Next"
    },
    {
      "step": 3,
      "title": "",
      "description": "",
      "status": "Upcoming"
    },
    {
      "step": 4,
      "title": "",
      "description": "",
      "status": "Upcoming"
    }
  ],
  "analysis": ""
}

Rules:
- do not invent skills
- use the actual resume
- make recommendations relevant to the target role
- readiness must be 0-100
- exactly 4 roadmap steps
`,
        MODEL,
        {
          responseMimeType:
            "application/json",
          maxOutputTokens: 1800,
        }
      );

    const parsed =
      parseAIJson(raw);

    return {
      currentSkills:
        toStringArray(
          parsed.currentSkills,
          12
        ),

      skillsToImprove:
        toStringArray(
          parsed.skillsToImprove,
          12
        ),

      recommendedSkills:
        toStringArray(
          parsed.recommendedSkills,
          12
        ),

      careerReadiness:
        clamp(
          parsed.careerReadiness,
          0,
          100
        ),

      roadmap:
        Array.isArray(
          parsed.roadmap
        )
          ? parsed.roadmap
              .slice(0, 4)
              .map(
                (
                  item,
                  index
                ) => ({
                  step:
                    Number(
                      item?.step
                    ) ||
                    index + 1,

                  title:
                    String(
                      item?.title ||
                        ""
                    ).trim(),

                  description:
                    String(
                      item?.description ||
                        ""
                    ).trim(),

                  status:
                    String(
                      item?.status ||
                        "Upcoming"
                    ).trim(),
                })
              )
          : [],

      analysis:
        String(
          parsed.analysis ||
            ""
        ).trim(),
    };
  };

/* =========================================================
   INTERVIEW QUESTIONS
========================================================= */

const generateInterviewQuestions =
  async (
    type,
    targetRole,
    skills = []
  ) => {
    const raw =
      await generateAIContent(`
You are PaperPal AI Interview Coach.

Generate exactly 5 interview questions.

INTERVIEW TYPE:
${type}

TARGET ROLE:
${targetRole}

CANDIDATE SKILLS:
${
  Array.isArray(skills)
    ? skills.join(
        ", "
      )
    : ""
}

Return ONLY valid JSON:

[
  {
    "question": "",
    "expectedAnswer": ""
  }
]
`);

    const parsed =
      parseAIJson(raw);

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error(
        "AI returned invalid interview questions."
      );
    }

    return parsed
      .slice(0, 5)
      .map(
        (item) => ({
          question:
            String(
              item?.question ||
                ""
            ).trim(),

          expectedAnswer:
            String(
              item?.expectedAnswer ||
                ""
            ).trim(),
        })
      );
  };

/* =========================================================
   INTERVIEW ANSWER EVALUATION
========================================================= */

const evaluateInterviewAnswer =
  async (
    type,
    targetRole,
    question,
    expectedAnswer,
    userAnswer
  ) => {
    const raw =
      await generateAIContent(`
You are an expert interview evaluator.

INTERVIEW TYPE:
${type}

TARGET ROLE:
${targetRole}

QUESTION:
${question}

EXPECTED ANSWER GUIDANCE:
${expectedAnswer}

USER ANSWER:
${userAnswer}

Evaluate:
- correctness
- relevance
- clarity
- completeness
- communication
- technical understanding

Return ONLY valid JSON:

{
  "score": 0,
  "feedback": "",
  "betterAnswer": ""
}
`);

    const parsed =
      parseAIJson(raw);

    return {
      score:
        clamp(
          parsed.score,
          0,
          10
        ),

      feedback:
        String(
          parsed.feedback ||
            ""
        ).trim(),

      betterAnswer:
        String(
          parsed.betterAnswer ||
            ""
        ).trim(),
    };
  };

/* =========================================================
   COMPLETED INTERVIEW
========================================================= */

const analyzeCompletedInterview =
  async (
    data
  ) => {
    const role =
      data?.role ||
      data?.targetRole ||
      "";

    const answers =
      data?.answers ||
      data?.interview ||
      [];

    return generateAIContent(`
You are PaperPal AI Interview Coach.

Analyze the completed interview.

TARGET ROLE:
${role}

ANSWERS:
${JSON.stringify(
  answers,
  null,
  2
)}

Provide:
- overall performance
- technical strengths
- technical gaps
- communication strengths
- communication weaknesses
- strongest answer
- weakest answer
- study recommendations
- practical improvement plan
`);
  };

/* =========================================================
   RESUME JSON PARSER
========================================================= */

const normalizeResume =
  (parsed) => {
    const personal =
      parsed?.personalDetails ||
      {};

    return {
      personalDetails: {
        fullName:
          String(
            personal.fullName ||
              personal.name ||
              ""
          ).trim(),

        email:
          String(
            personal.email ||
              ""
          ).trim(),

        phone:
          String(
            personal.phone ||
              ""
          ).trim(),

        location:
          String(
            personal.location ||
              ""
          ).trim(),

        linkedin:
          String(
            personal.linkedin ||
              ""
          ).trim(),

        github:
          String(
            personal.github ||
              ""
          ).trim(),

        portfolio:
          String(
            personal.portfolio ||
              ""
          ).trim(),
      },

      summary:
        String(
          parsed.summary ||
            ""
        ).trim(),

      skills:
        toStringArray(
          parsed.skills,
          30
        ),

      education:
        Array.isArray(
          parsed.education
        )
          ? parsed.education.slice(
              0,
              10
            )
          : [],

      experience:
        Array.isArray(
          parsed.experience
        )
          ? parsed.experience.slice(
              0,
              10
            )
          : [],

      projects:
        Array.isArray(
          parsed.projects
        )
          ? parsed.projects.slice(
              0,
              10
            )
          : [],

      certifications:
        toStringArray(
          parsed.certifications,
          20
        ),

      achievements:
        toStringArray(
          parsed.achievements,
          20
        ),

      atsScore:
        clamp(
          parsed.atsScore,
          0,
          100
        ),

      matchedKeywords:
        toStringArray(
          parsed.matchedKeywords,
          30
        ),

      missingKeywords:
        toStringArray(
          parsed.missingKeywords,
          30
        ),
    };
  };

/* =========================================================
   BUILD RESUME
========================================================= */

const generateResume =
  async (
    profile = {},
    jobDescription = ""
  ) => {
    const raw =
      await generateAIContent(
        `
You are PaperPal AI Resume Builder.

Create a professional ATS-friendly
resume using ONLY the candidate
information supplied.

TARGET ROLE:
${profile?.targetRole || ""}

JOB DESCRIPTION:
${String(
  jobDescription || ""
).slice(0, 30000)}

CANDIDATE INFORMATION:
${JSON.stringify(
  profile,
  null,
  2
)}

Return ONLY valid JSON:

{
  "personalDetails": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "achievements": [],
  "atsScore": 0,
  "matchedKeywords": [],
  "missingKeywords": []
}

Do not invent qualifications,
experience, projects, education or
certifications.
`,
        MODEL,
        {
          responseMimeType:
            "application/json",
          maxOutputTokens: 2600,
        }
      );

    return normalizeResume(
      parseAIJson(raw)
    );
  };

/* =========================================================
   ENHANCE RESUME
========================================================= */

const enhanceResume =
  async (
    resumeText,
    jobDescription = "",
    targetRole = ""
  ) => {
    const raw =
      await generateAIContent(
        `
You are PaperPal AI Resume Enhancer.

Improve the existing resume for the
target role.

TARGET ROLE:
${targetRole}

JOB DESCRIPTION:
${String(
  jobDescription || ""
).slice(0, 30000)}

EXISTING RESUME:
${String(
  resumeText || ""
).slice(0, 30000)}

Return ONLY valid JSON:

{
  "personalDetails": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "achievements": [],
  "atsScore": 0,
  "matchedKeywords": [],
  "missingKeywords": []
}

Rules:
- preserve factual information
- do not invent experience
- improve ATS wording
- improve clarity
- prioritize relevant skills
`,
        MODEL,
        {
          responseMimeType:
            "application/json",
          maxOutputTokens: 2600,
        }
      );

    return normalizeResume(
      parseAIJson(raw)
    );
  };

/* =========================================================
   ATS ANALYSIS
========================================================= */

const analyzeResumeJobMatch =
  async (
    resumeText,
    jobDescription,
    targetRole = ""
  ) => {
    const raw =
      await generateAIContent(
        `
You are PaperPal ATS Resume Analyst.

TARGET ROLE:
${targetRole}

RESUME:
${String(
  resumeText || ""
).slice(0, 30000)}

JOB DESCRIPTION:
${String(
  jobDescription || ""
).slice(0, 30000)}

Return ONLY valid JSON:

{
  "atsScore": 0,
  "jobMatchPercentage": 0,
  "experienceFitPercentage": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "matchedKeywords": [],
  "missingKeywords": [],
  "improvementSuggestions": []
}

Rules:
- scores must be 0-100
- use only supplied information
- do not invent candidate experience
- suggestions must be practical
`,
        MODEL,
        {
          responseMimeType:
            "application/json",
          maxOutputTokens: 1800,
        }
      );

    const parsed =
      parseAIJson(raw);

    return {
      atsScore:
        clamp(
          parsed.atsScore,
          0,
          100
        ),

      jobMatchPercentage:
        clamp(
          parsed.jobMatchPercentage,
          0,
          100
        ),

      experienceFitPercentage:
        clamp(
          parsed.experienceFitPercentage,
          0,
          100
        ),

      matchedSkills:
        toStringArray(
          parsed.matchedSkills,
          30
        ),

      missingSkills:
        toStringArray(
          parsed.missingSkills,
          30
        ),

      matchedKeywords:
        toStringArray(
          parsed.matchedKeywords,
          30
        ),

      missingKeywords:
        toStringArray(
          parsed.missingKeywords,
          30
        ),

      improvementSuggestions:
        toStringArray(
          parsed.improvementSuggestions,
          20
        ),
    };
  };

/* =========================================================
   PARSE RESUME JSON
========================================================= */

const parseResumeJson =
  async (
    resumeText
  ) => {
    const raw =
      await generateAIContent(
        `
Extract structured resume information.

RESUME:
${String(
  resumeText || ""
).slice(0, 30000)}

Return ONLY valid JSON:

{
  "personalDetails": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "achievements": []
}

Do not invent anything.
`,
        MODEL,
        {
          responseMimeType:
            "application/json",
          maxOutputTokens: 2200,
        }
      );

    return normalizeResume(
      parseAIJson(raw)
    );
  };

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  generateSummary,
  askQuestion,
  learnTopic,
  translateText,
  generateFromPrompt,
  generateQuiz,
  generateCareerAnalysis,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  analyzeCompletedInterview,
  generateResume,
  enhanceResume,
  analyzeResumeJobMatch,
  parseResumeJson,
};