const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.6-flash";


/* =====================================================
   COMMON AI FUNCTION
===================================================== */

const generateAIContent = async (prompt) => {
  try {
    const response =
      await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

    if (!response || !response.text) {
      throw new Error(
        "AI returned an empty response."
      );
    }

    return response.text;
  } catch (error) {
    console.error(
      "Gemini Error:",
      error.message
    );

    const code =
      error?.status ||
      error?.code ||
      error?.error?.code;

    if (Number(code) === 429) {
      throw new Error(
        "AI usage limit reached. Please wait and try again later."
      );
    }

    if (
      Number(code) === 401 ||
      Number(code) === 403
    ) {
      throw new Error(
        "AI authentication failed. Please check your Gemini API key."
      );
    }

    if (Number(code) === 404) {
      throw new Error(
        "AI model unavailable. Please try again later."
      );
    }

    throw new Error(
      error?.message ||
        "AI service is temporarily unavailable."
    );
  }
};


/* =====================================================
   DOCUMENT SUMMARY
===================================================== */

const generateSummary = async (text) => {
  return generateAIContent(`
You are PaperPal AI.

Summarize the following document clearly.

Use simple language.
Keep important dates, amounts, names and facts.
Do not invent information.

DOCUMENT:

${text}
`);
};


/* =====================================================
   DOCUMENT QUESTION
===================================================== */

const askQuestion = async (
  text,
  question
) => {
  return generateAIContent(`
You are PaperPal AI.

Answer the user's question using the document.

Do not invent information.
If the answer is not present in the document, say so clearly.

DOCUMENT:

${text}

QUESTION:

${question}
`);
};


/* =====================================================
   LEARN TOPIC
===================================================== */

const learnTopic = async (
  topic,
  level = "Beginner",
  language = "English"
) => {
  return generateAIContent(`
You are PaperPal AI Learning Assistant.

Topic:
${topic}

Learning level:
${level}

Response language:
${language}

Teach the topic clearly.

Use these sections:

WHAT IS IT?
KEY CONCEPTS
SIMPLE EXAMPLE
HOW IT WORKS
WHY IS IT IMPORTANT?
QUICK SUMMARY
EXAM / INTERVIEW POINTS

Keep it simple and easy to understand.
`);
};


/* =====================================================
   TRANSLATE
===================================================== */

const translateText = async (
  text,
  language
) => {
  return generateAIContent(`
Translate the following text into ${language}.

Preserve:
- Meaning
- Names
- Dates
- Numbers
- Amounts
- Important technical terms

Return only the translation.

TEXT:

${text}
`);
};


/* =====================================================
   DIRECT PROMPT
===================================================== */

const generateFromPrompt = async (
  prompt,
  language = "English"
) => {
  return generateAIContent(`
You are PaperPal AI.

Answer the following user request.

Response language:
${language}

USER REQUEST:

${prompt}

Give a clear and useful answer.
`);
};


/* =====================================================
   QUIZ GENERATOR
===================================================== */

const generateQuiz = async (
  topic,
  level = "Beginner",
  language = "English",
  count = 5
) => {
  let safeCount = Number(count);

  if (!Number.isFinite(safeCount)) {
    safeCount = 5;
  }

  safeCount = Math.floor(safeCount);

  if (safeCount < 1) {
    safeCount = 1;
  }

  if (safeCount > 50) {
    safeCount = 50;
  }

  const raw =
    await generateAIContent(`
You are PaperPal AI Exam Preparation Assistant.

Create exactly ${safeCount} multiple-choice questions.

Topic:
${topic}

Difficulty:
${level}

Language:
${language}

Each question must contain:
- question
- exactly 4 options
- correctAnswer
- explanation

correctAnswer must be:
0 for the first option
1 for the second option
2 for the third option
3 for the fourth option

Return ONLY JSON.

Do not return markdown.
Do not return code fences.
Do not write any text before the JSON.
Do not write any text after the JSON.

Use exactly this structure:

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
      "explanation": "Explanation"
    }
  ]
}
`);

  try {
    let cleaned = String(raw).trim();

    if (
      cleaned.startsWith("```json")
    ) {
      cleaned =
        cleaned.substring(7);
    } else if (
      cleaned.startsWith("```")
    ) {
      cleaned =
        cleaned.substring(3);
    }

    if (
      cleaned.endsWith("```")
    ) {
      cleaned =
        cleaned.substring(
          0,
          cleaned.length - 3
        );
    }

    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1
    ) {
      throw new Error(
        "No valid JSON found."
      );
    }

    cleaned =
      cleaned.substring(
        firstBrace,
        lastBrace + 1
      );

    const parsed =
      JSON.parse(cleaned);

    if (
      !parsed ||
      !Array.isArray(
        parsed.questions
      )
    ) {
      throw new Error(
        "Invalid quiz structure."
      );
    }

    const questions =
      parsed.questions
        .slice(0, safeCount)
        .map(
          (item, index) => {
            if (
              !item.question ||
              !Array.isArray(
                item.options
              ) ||
              item.options.length !== 4
            ) {
              throw new Error(
                `Invalid question ${
                  index + 1
                }.`
              );
            }

            const correctAnswer =
              Number(
                item.correctAnswer
              );

            if (
              !Number.isInteger(
                correctAnswer
              ) ||
              correctAnswer < 0 ||
              correctAnswer > 3
            ) {
              throw new Error(
                `Invalid answer for question ${
                  index + 1
                }.`
              );
            }

            return {
              question:
                String(
                  item.question
                ).trim(),

              options:
                item.options.map(
                  (option) =>
                    String(
                      option
                    ).trim()
                ),

              correctAnswer,

              explanation:
                item.explanation
                  ? String(
                      item.explanation
                    ).trim()
                  : "",
            };
          }
        );

    if (!questions.length) {
      throw new Error(
        "No quiz questions generated."
      );
    }

    return {
      questions,
    };
  } catch (error) {
    console.error(
      "Quiz Parsing Error:",
      error.message
    );

    throw new Error(
      "AI generated an invalid quiz format. Please try again."
    );
  }
};


/* =====================================================
   CAREER ANALYSIS
===================================================== */

const generateCareerAnalysis =
  async (
    careerGoal,
    targetRole,
    resumeText
  ) => {
    const raw =
      await generateAIContent(`
You are PaperPal AI Career Assistant.

Analyze the candidate's resume and career goal.

CAREER GOAL:
${careerGoal}

TARGET ROLE:
${targetRole}

RESUME:

${resumeText}

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

Structure:

{
  "currentSkills": [],
  "skillsToImprove": [],
  "recommendedSkills": [],
  "careerReadiness": 65,
  "roadmap": [
    {
      "step": 1,
      "title": "Build the Foundation",
      "description": "What to do",
      "status": "Current"
    },
    {
      "step": 2,
      "title": "Develop Job-Ready Skills",
      "description": "What to learn",
      "status": "Next"
    },
    {
      "step": 3,
      "title": "Build Projects",
      "description": "Projects to build",
      "status": "Upcoming"
    },
    {
      "step": 4,
      "title": "Prepare for Interviews",
      "description": "Preparation steps",
      "status": "Upcoming"
    }
  ],
  "analysis": "Short candidate analysis"
}

Rules:
- Use the actual resume.
- Don't invent skills.
- Make recommendations relevant to the target role.
- careerReadiness must be 0-100.
- Return exactly 4 roadmap steps.
`);

    try {
      let cleaned =
        String(raw).trim();

      if (
        cleaned.startsWith(
          "```json"
        )
      ) {
        cleaned =
          cleaned.substring(7);
      } else if (
        cleaned.startsWith("```")
      ) {
        cleaned =
          cleaned.substring(3);
      }

      if (
        cleaned.endsWith("```")
      ) {
        cleaned =
          cleaned.substring(
            0,
            cleaned.length - 3
          );
      }

      const firstBrace =
        cleaned.indexOf("{");

      const lastBrace =
        cleaned.lastIndexOf("}");

      if (
        firstBrace === -1 ||
        lastBrace === -1
      ) {
        throw new Error(
          "No career JSON found."
        );
      }

      cleaned =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );

      const parsed =
        JSON.parse(cleaned);

      let readiness =
        Number(
          parsed.careerReadiness
        );

      if (
        !Number.isFinite(
          readiness
        )
      ) {
        readiness = 0;
      }

      readiness = Math.round(
        Math.min(
          Math.max(
            readiness,
            0
          ),
          100
        )
      );

      return {
        currentSkills:
          Array.isArray(
            parsed.currentSkills
          )
            ? parsed.currentSkills
                .slice(0, 12)
                .map(String)
            : [],

        skillsToImprove:
          Array.isArray(
            parsed.skillsToImprove
          )
            ? parsed.skillsToImprove
                .slice(0, 12)
                .map(String)
            : [],

        recommendedSkills:
          Array.isArray(
            parsed.recommendedSkills
          )
            ? parsed.recommendedSkills
                .slice(0, 12)
                .map(String)
            : [],

        careerReadiness:
          readiness,

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
                        item.step
                      ) ||
                      index + 1,

                    title:
                      String(
                        item.title ||
                          ""
                      ),

                    description:
                      String(
                        item.description ||
                          ""
                      ),

                    status:
                      String(
                        item.status ||
                          "Upcoming"
                      ),
                  })
                )
            : [],

        analysis:
          String(
            parsed.analysis ||
              ""
          ).trim(),
      };
    } catch (error) {
      console.error(
        "Career JSON Error:",
        error.message
      );

      throw new Error(
        "AI generated an invalid career analysis."
      );
    }
  };


/* =====================================================
   INTERVIEW QUESTION GENERATOR
===================================================== */

const generateInterviewQuestions =
  async (
    type,
    targetRole,
    skills = []
  ) => {
    const interviewType =
      type === "technical"
        ? "Technical Interview"
        : type === "hr"
        ? "HR Interview"
        : "Mock Interview";

    const skillText =
      Array.isArray(skills) &&
      skills.length
        ? skills.join(", ")
        : "No specific skills supplied";

    const raw =
      await generateAIContent(`
You are PaperPal AI Interview Coach.

Generate exactly 5 interview questions.

Interview type:
${interviewType}

Target role:
${targetRole}

Candidate skills:
${skillText}

Requirements:

For TECHNICAL:
- Ask role-specific technical questions.
- Mix fundamentals and practical situations.
- Focus on candidate skills where relevant.

For HR:
- Ask realistic HR and behavioral questions.
- Include communication, teamwork, strengths, weaknesses and situations.

For MOCK:
- Mix technical, behavioral and role-specific questions.

Make the difficulty gradually increase.

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not include any extra text.

Use:

{
  "questions": [
    {
      "question": "Question",
      "expectedAnswer": "What a strong answer should generally contain"
    }
  ]
}
`);

    try {
      let cleaned =
        String(raw).trim();

      if (
        cleaned.startsWith(
          "```json"
        )
      ) {
        cleaned =
          cleaned.substring(7);
      } else if (
        cleaned.startsWith("```")
      ) {
        cleaned =
          cleaned.substring(3);
      }

      if (
        cleaned.endsWith("```")
      ) {
        cleaned =
          cleaned.substring(
            0,
            cleaned.length - 3
          );
      }

      const firstBrace =
        cleaned.indexOf("{");

      const lastBrace =
        cleaned.lastIndexOf("}");

      if (
        firstBrace === -1 ||
        lastBrace === -1
      ) {
        throw new Error(
          "No interview JSON found."
        );
      }

      cleaned =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );

      const parsed =
        JSON.parse(cleaned);

      if (
        !parsed ||
        !Array.isArray(
          parsed.questions
        )
      ) {
        throw new Error(
          "Invalid interview structure."
        );
      }

      const questions =
        parsed.questions
          .slice(0, 5)
          .map(
            (item) => ({
              question:
                String(
                  item.question ||
                    ""
                ).trim(),

              expectedAnswer:
                String(
                  item.expectedAnswer ||
                    ""
                ).trim(),
            })
          )
          .filter(
            (item) =>
              item.question
          );

      if (
        questions.length !== 5
      ) {
        throw new Error(
          "AI did not generate exactly 5 interview questions."
        );
      }

      return {
        questions,
      };
    } catch (error) {
      console.error(
        "Interview Question Parsing Error:",
        error.message
      );

      throw new Error(
        "AI generated an invalid interview question set."
      );
    }
  };


/* =====================================================
   EVALUATE INTERVIEW ANSWER
===================================================== */

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
You are PaperPal AI Interview Evaluator.

Evaluate this interview answer fairly.

Interview type:
${type}

Target role:
${targetRole}

QUESTION:
${question}

EXPECTED ANSWER GUIDANCE:
${expectedAnswer}

USER ANSWER:
${userAnswer}

Evaluate based on:

- correctness
- relevance
- clarity
- completeness
- communication
- confidence
- technical understanding when applicable

Give a score from 0 to 10.

Do not punish the candidate for small grammar mistakes.

Return ONLY valid JSON.

Structure:

{
  "score": 8,
  "feedback": "Specific constructive feedback",
  "betterAnswer": "A stronger example answer"
}

Rules:
- Be fair.
- Do not be unnecessarily harsh.
- Give practical feedback.
- Do not invent requirements unrelated to the role.
`);

    try {
      let cleaned =
        String(raw).trim();

      if (
        cleaned.startsWith(
          "```json"
        )
      ) {
        cleaned =
          cleaned.substring(7);
      } else if (
        cleaned.startsWith("```")
      ) {
        cleaned =
          cleaned.substring(3);
      }

      if (
        cleaned.endsWith("```")
      ) {
        cleaned =
          cleaned.substring(
            0,
            cleaned.length - 3
          );
      }

      const firstBrace =
        cleaned.indexOf("{");

      const lastBrace =
        cleaned.lastIndexOf("}");

      if (
        firstBrace === -1 ||
        lastBrace === -1
      ) {
        throw new Error(
          "No evaluation JSON found."
        );
      }

      cleaned =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );

      const parsed =
        JSON.parse(cleaned);

      let score =
        Number(
          parsed.score
        );

      if (
        !Number.isFinite(score)
      ) {
        score = 0;
      }

      score = Math.round(
        Math.min(
          Math.max(
            score,
            0
          ),
          10
        )
      );

      return {
        score,

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
    } catch (error) {
      console.error(
        "Interview Evaluation Parsing Error:",
        error.message
      );

      throw new Error(
        "AI generated an invalid answer evaluation."
      );
    }
  };


/* =====================================================
   FINAL INTERVIEW ANALYSIS
===================================================== */

const analyzeCompletedInterview =
  async (
    type,
    targetRole,
    questions
  ) => {
    const transcript =
      questions
        .map(
          (
            q,
            index
          ) => `
Question ${index + 1}:
${q.question}

Candidate Answer:
${
  q.userAnswer ||
  "No answer provided"
}

Question Score:
${q.score ?? 0}/10

Question Feedback:
${q.feedback || ""}

Better Answer:
${q.betterAnswer || ""}
`
        )
        .join(
          "\n----------------------\n"
        );

    const raw =
      await generateAIContent(`
You are a senior interview coach.

Analyze this completed interview.

Interview type:
${type}

Target role:
${targetRole}

Transcript:
${transcript}

Provide an honest but encouraging assessment.

Focus on:
- overall answer quality
- communication
- technical knowledge when applicable
- confidence
- relevance
- completeness
- readiness for the target role

Return ONLY valid JSON.

Use exactly:

{
  "overallFeedback": "Overall assessment of the candidate",
  "percentage": 0,
  "interviewTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ],
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "areasOfImprovement": [
    "Area 1",
    "Area 2",
    "Area 3",
    "Area 4"
  ],
  "recommendation": "Final recommendation for the candidate"
}

Rules:
- percentage must be between 0 and 100.
- Keep tips practical.
- Do not invent qualifications.
- Mention specific areas the candidate should practice.
`);

    try {
      let cleaned =
        String(raw).trim();

      if (
        cleaned.startsWith(
          "```json"
        )
      ) {
        cleaned =
          cleaned.substring(7);
      } else if (
        cleaned.startsWith("```")
      ) {
        cleaned =
          cleaned.substring(3);
      }

      if (
        cleaned.endsWith("```")
      ) {
        cleaned =
          cleaned.substring(
            0,
            cleaned.length - 3
          );
      }

      const firstBrace =
        cleaned.indexOf("{");

      const lastBrace =
        cleaned.lastIndexOf("}");

      if (
        firstBrace === -1 ||
        lastBrace === -1
      ) {
        throw new Error(
          "No final analysis JSON found."
        );
      }

      cleaned =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );

      const parsed =
        JSON.parse(cleaned);

      let percentage =
        Number(
          parsed.percentage
        );

      if (
        !Number.isFinite(
          percentage
        )
      ) {
        percentage = 0;
      }

      percentage = Math.round(
        Math.min(
          Math.max(
            percentage,
            0
          ),
          100
        )
      );

      return {
        overallFeedback:
          String(
            parsed.overallFeedback ||
              ""
          ).trim(),

        percentage,

        interviewTips:
          Array.isArray(
            parsed.interviewTips
          )
            ? parsed.interviewTips
                .slice(0, 5)
                .map(String)
            : [],

        strengths:
          Array.isArray(
            parsed.strengths
          )
            ? parsed.strengths
                .slice(0, 5)
                .map(String)
            : [],

        areasOfImprovement:
          Array.isArray(
            parsed.areasOfImprovement
          )
            ? parsed.areasOfImprovement
                .slice(0, 6)
                .map(String)
            : [],

        recommendation:
          String(
            parsed.recommendation ||
              ""
          ).trim(),
      };
    } catch (error) {
      console.error(
        "Final Interview Analysis JSON Error:",
        error.message
      );

      throw new Error(
        "AI could not analyze the completed interview."
      );
    }
  };


/* =====================================================
   RESUME BUILDER
===================================================== */

const generateResume = async (
  profile,
  jobDescription
) => {
  const raw =
    await generateAIContent(`
You are PaperPal AI Resume Specialist.

Create a professional ATS-friendly resume using ONLY the candidate information supplied below.

CANDIDATE PROFILE:
${JSON.stringify(
  profile,
  null,
  2
)}

TARGET JOB DESCRIPTION:
${jobDescription}

Requirements:

- Tailor the resume to the target job.
- Identify relevant keywords from the job description.
- Prioritize skills and projects actually present in the candidate profile.
- Improve wording and bullet points.
- Do NOT invent employers, degrees, dates, skills, certifications, achievements or experience.
- Do NOT claim a skill unless the candidate supplied it.
- If the candidate is a fresher, emphasize education, projects, skills and certifications.
- Keep the resume concise and ATS-friendly.
- Create a professional summary relevant to the target role.
- Preserve the candidate's factual information.
- Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "Target Role Resume",
  "atsScore": 85,
  "matchedKeywords": [],
  "missingKeywords": [],
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
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "bullets": []
    }
  ],
  "projects": [
    {
      "name": "",
      "technologies": "",
      "bullets": []
    }
  ],
  "certifications": [],
  "achievements": []
}

atsScore must be between 0 and 100.
`);

  return parseResumeJson(
    raw
  );
};


/* =====================================================
   RESUME ENHANCER
===================================================== */

const enhanceResume = async (
  existingResumeText,
  jobDescription,
  targetRole = ""
) => {
  const raw =
    await generateAIContent(`
You are PaperPal AI Resume Enhancement Specialist.

Improve the existing resume for the target job.

TARGET ROLE:
${targetRole}

EXISTING RESUME:
${existingResumeText}

JOB DESCRIPTION:
${jobDescription}

Rules:

- Preserve all factual information from the existing resume.
- Do NOT invent employers.
- Do NOT invent dates.
- Do NOT invent education.
- Do NOT invent certifications.
- Do NOT invent skills.
- Do NOT invent achievements.
- Improve grammar and wording.
- Rewrite weak bullet points into stronger professional bullets only when supported by the source.
- Tailor the professional summary to the target role.
- Match genuine resume skills to relevant job keywords.
- Put missing job keywords in missingKeywords instead of falsely claiming them.
- Keep the resume ATS-friendly and concise.
- Preserve useful projects and experience.
- Return ONLY valid JSON.

Use exactly:

{
  "title": "Enhanced Resume",
  "atsScore": 85,
  "matchedKeywords": [],
  "missingKeywords": [],
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
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "bullets": []
    }
  ],
  "projects": [
    {
      "name": "",
      "technologies": "",
      "bullets": []
    }
  ],
  "certifications": [],
  "achievements": []
}
`);

  return parseResumeJson(
    raw
  );
};


/* =====================================================
   RESUME JSON PARSER
===================================================== */

const parseResumeJson = (
  raw
) => {
  try {
    let cleaned =
      String(raw).trim();

    if (
      cleaned.startsWith(
        "```json"
      )
    ) {
      cleaned =
        cleaned.substring(7);
    } else if (
      cleaned.startsWith(
        "```"
      )
    ) {
      cleaned =
        cleaned.substring(3);
    }

    if (
      cleaned.endsWith("```")
    ) {
      cleaned =
        cleaned.substring(
          0,
          cleaned.length - 3
        );
    }

    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1
    ) {
      throw new Error(
        "No resume JSON found."
      );
    }

    cleaned =
      cleaned.substring(
        firstBrace,
        lastBrace + 1
      );

    const parsed =
      JSON.parse(cleaned);

    let atsScore =
      Number(
        parsed.atsScore
      );

    if (
      !Number.isFinite(
        atsScore
      )
    ) {
      atsScore = 0;
    }

    atsScore = Math.round(
      Math.min(
        Math.max(
          atsScore,
          0
        ),
        100
      )
    );

    return {
      title:
        String(
          parsed.title ||
            "PaperPal Resume"
        ).trim(),

      atsScore,

      matchedKeywords:
        Array.isArray(
          parsed.matchedKeywords
        )
          ? parsed.matchedKeywords
              .slice(0, 20)
              .map(String)
          : [],

      missingKeywords:
        Array.isArray(
          parsed.missingKeywords
        )
          ? parsed.missingKeywords
              .slice(0, 20)
              .map(String)
          : [],

      personalDetails: {
        fullName:
          String(
            parsed.personalDetails
              ?.fullName ||
              ""
          ).trim(),

        email:
          String(
            parsed.personalDetails
              ?.email ||
              ""
          ).trim(),

        phone:
          String(
            parsed.personalDetails
              ?.phone ||
              ""
          ).trim(),

        location:
          String(
            parsed.personalDetails
              ?.location ||
              ""
          ).trim(),

        linkedin:
          String(
            parsed.personalDetails
              ?.linkedin ||
              ""
          ).trim(),

        github:
          String(
            parsed.personalDetails
              ?.github ||
              ""
          ).trim(),

        portfolio:
          String(
            parsed.personalDetails
              ?.portfolio ||
              ""
          ).trim(),
      },

      summary:
        String(
          parsed.summary ||
            ""
        ).trim(),

      skills:
        Array.isArray(
          parsed.skills
        )
          ? parsed.skills
              .slice(0, 25)
              .map(String)
              .map((item) =>
                item.trim()
              )
          : [],

      education:
        Array.isArray(
          parsed.education
        )
          ? parsed.education
              .slice(0, 10)
              .map((item) => {
                if (
                  typeof item ===
                  "string"
                ) {
                  return item;
                }

                return {
                  degree:
                    String(
                      item.degree ||
                        ""
                    ).trim(),

                  institution:
                    String(
                      item.institution ||
                        item.college ||
                        ""
                    ).trim(),

                  duration:
                    String(
                      item.duration ||
                        ""
                    ).trim(),

                  score:
                    String(
                      item.score ||
                        item.cgpa ||
                        ""
                    ).trim(),
                };
              })
          : [],

      experience:
        Array.isArray(
          parsed.experience
        )
          ? parsed.experience
              .slice(0, 10)
              .map(
                (item) => ({
                  role:
                    String(
                      item.role ||
                        ""
                    ).trim(),

                  company:
                    String(
                      item.company ||
                        ""
                    ).trim(),

                  duration:
                    String(
                      item.duration ||
                        ""
                    ).trim(),

                  bullets:
                    Array.isArray(
                      item.bullets
                    )
                      ? item.bullets
                          .slice(0, 8)
                          .map(
                            String
                          )
                      : [],
                })
              )
          : [],

      projects:
        Array.isArray(
          parsed.projects
        )
          ? parsed.projects
              .slice(0, 10)
              .map(
                (item) => ({
                  name:
                    String(
                      item.name ||
                        ""
                    ).trim(),

                  technologies:
                    String(
                      item.technologies ||
                        ""
                    ).trim(),

                  bullets:
                    Array.isArray(
                      item.bullets
                    )
                      ? item.bullets
                          .slice(0, 8)
                          .map(
                            String
                          )
                      : [],
                })
              )
          : [],

      certifications:
        Array.isArray(
          parsed.certifications
        )
          ? parsed.certifications
              .slice(0, 15)
              .map(String)
          : [],

      achievements:
        Array.isArray(
          parsed.achievements
        )
          ? parsed.achievements
              .slice(0, 15)
              .map(String)
          : [],
    };
  } catch (error) {
    console.error(
      "Resume JSON Parsing Error:",
      error.message
    );

    throw new Error(
      "AI generated an invalid resume format."
    );
  }
};


/* =====================================================
   EXPORTS
===================================================== */

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
};