import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Target,
  FileText,
  Upload,
  Brain,
  Route,
  MessageSquareText,
  ChevronRight,
  CheckCircle,
  Circle,
  Sparkles,
  Award,
  Loader,
  TrendingUp,
  AlertCircle,
  Search,
  ExternalLink,
  X,
  Code2,
  UserRound,
  Video,
  Star,
  Mic,
  Square,
  Volume2,
  Trophy,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  User,
  GraduationCap,
  Plus,
  Trash2,
  Download,
  Pencil,
  FilePlus2,
  WandSparkles,
  Loader2,
} from "lucide-react";

import Layout from "../components/Layout";
import API from "../services/api";

import "./Career.css";


function Career() {
  /* =====================================================
     CAREER
  ===================================================== */

  const [careerGoal, setCareerGoal] =
    useState("");

  const [selectedPath, setSelectedPath] =
    useState(
      "Software Development"
    );

  const [resume, setResume] =
    useState(null);

  const [careerData, setCareerData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =====================================================
     INTERVIEW
  ===================================================== */

  const [activeInterview, setActiveInterview] =
    useState(null);

  const [interviewLoading, setInterviewLoading] =
    useState(false);

  const [interviewSession, setInterviewSession] =
    useState(null);

  const [currentAnswer, setCurrentAnswer] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [evaluation, setEvaluation] =
    useState(null);

  const [showEvaluation, setShowEvaluation] =
    useState(false);

  const [interviewError, setInterviewError] =
    useState("");

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const recognitionRef =
    useRef(null);

  /* =====================================================
     RESUME BUILDER
  ===================================================== */

  const [resumeMode, setResumeMode] =
    useState(null);

  const [showResumeBuilder, setShowResumeBuilder] =
    useState(false);

  const [resumeLoading, setResumeLoading] =
    useState(false);

  const [resumeData, setResumeData] =
    useState(null);

  const [resumeError, setResumeError] =
    useState("");

  const [resumeJobDescription, setResumeJobDescription] =
    useState("");

  const [resumeForm, setResumeForm] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
      summary: "",
      education: [
        {
          degree: "",
          institution: "",
          field: "",
          startYear: "",
          endYear: "",
          grade: "",
        },
      ],
      experience: [],
      skills: "",
      tools: "",
      softSkills: "",
      certifications: "",
      achievements: "",
      projects: [
        {
          name: "",
          technologies: "",
          description: "",
          role: "",
          result: "",
        },
      ],
    });

  const [resumeEnhanceFile, setResumeEnhanceFile] =
    useState(null);

  /* =====================================================
     ATS / RESUME MATCH ANALYSIS
  ===================================================== */

  const [atsResumeFile, setAtsResumeFile] =
    useState(null);

  const [atsJobDescription, setAtsJobDescription] =
    useState("");

  const [atsTargetRole, setAtsTargetRole] =
    useState("");

  const [atsLoading, setAtsLoading] =
    useState(false);

  const [atsResult, setAtsResult] =
    useState(null);

  const [atsError, setAtsError] =
    useState("");

  const atsFileInputRef =
    useRef(null);

  const resumePrintRef =
    useRef(null);


  /* =====================================================
     CAREER PATHS
  ===================================================== */

  const careerPaths = [
    "Software Development",
    "Data Analytics",
    "Salesforce",
    "Cloud Computing",
    "AI / Machine Learning",
    "Testing / QA",
  ];


  /* =====================================================
     JOBS
  ===================================================== */

  const jobs = [
    {
      id: 1,
      title:
        "Associate Technical Support Engineer",
      company: "Salesforce",
      location: "Hyderabad",
      experience:
        "Freshers / Entry Level",
      match: "Strong Match",
      matchClass: "strong",
      reason:
        "Good fit for Salesforce exposure, technical learning and problem solving.",
      url:
        "https://salesforce.wd12.myworkdayjobs.com/",
      source:
        "Salesforce Careers",
    },

    {
      id: 2,
      title:
        "Junior SQL / ETL Developer",
      company: "Datavail",
      location:
        "Hyderabad / Bangalore / Mumbai",
      experience:
        "0–1+ Years",
      match: "Strong Match",
      matchClass: "strong",
      reason:
        "Matches SQL, MySQL and DBMS foundations.",
      url:
        "https://www.unstop.com/",
      source: "Unstop",
    },

    {
      id: 3,
      title:
        "Associate – Salesforce & AI",
      company:
        "ReWise Analytics & Technologies",
      location: "Pune",
      experience: "Freshers",
      match: "Strong Match",
      matchClass: "strong",
      reason:
        "Good overlap with Salesforce interest and AI project experience.",
      url:
        "https://www.glassdoor.co.in/Job/",
      source: "Glassdoor",
    },

    {
      id: 4,
      title:
        "Data Analyst – SQL / Python",
      company:
        "Entry-Level Data Roles",
      location: "Hyderabad",
      experience:
        "Fresher / Entry Level",
      match: "Good Match",
      matchClass: "good",
      reason:
        "Matches your Python basics, SQL and DBMS foundation.",
      url:
        "https://www.linkedin.com/jobs/",
      source: "LinkedIn",
    },
  ];


  /* =====================================================
     LOAD CAREER PROFILE
  ===================================================== */

  const loadCareerProfile =
    async () => {
      try {
        setLoadingProfile(true);

        const response =
          await API.get(
            "/career/latest"
          );

        if (
          response.data.career
        ) {
          const career =
            response.data.career;

          setCareerData(
            career
          );

          setCareerGoal(
            career.careerGoal ||
              ""
          );

          const validPath =
            careerPaths.includes(
              career.targetRole
            );

          setSelectedPath(
            validPath
              ? career.targetRole
              : "Software Development"
          );
        }
      } catch (error) {
        console.error(
          "Career Profile Error:",
          error
        );
      } finally {
        setLoadingProfile(
          false
        );
      }
    };


  useEffect(() => {
    loadCareerProfile();
  }, []);


  /* =====================================================
     SPEECH SUPPORT
  ===================================================== */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setSpeechSupported(
      Boolean(SpeechRecognition)
    );

    return () => {
      if (
        recognitionRef.current
      ) {
        recognitionRef.current.stop();
      }

      window.speechSynthesis.cancel();
    };
  }, []);


  /* =====================================================
     RESUME
  ===================================================== */

  const handleResumeUpload =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (
        !validTypes.includes(
          file.type
        )
      ) {
        setError(
          "Please upload a PDF or DOCX resume."
        );
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "Resume must be smaller than 10 MB."
        );
        return;
      }

      setResume(file);
      setError("");
    };


  /* =====================================================
     BUILD PLAN
  ===================================================== */

  const handleBuildPlan =
    async () => {
      if (
        !careerGoal.trim()
      ) {
        setError(
          "Please enter your career goal."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const formData =
          new FormData();

        formData.append(
          "careerGoal",
          careerGoal
        );

        formData.append(
          "targetRole",
          selectedPath
        );

        if (resume) {
          formData.append(
            "resume",
            resume
          );
        }

        const response =
          await API.post(
            "/career/analyze",
            formData
          );

        setCareerData(
          response.data.career
        );

        setResume(null);
      } catch (error) {
        console.error(
          "Career Analysis Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to generate your career plan."
        );
      } finally {
        setLoading(false);
      }
    };



  /* =====================================================
     RESUME BUILDER HELPERS
  ===================================================== */

  const updateResumeField = (field, value) => {
    setResumeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEducation = (index, field, value) => {
    setResumeForm((prev) => {
      const education = [...prev.education];
      education[index] = {
        ...education[index],
        [field]: value,
      };
      return {
        ...prev,
        education,
      };
    });
  };

  const addEducation = () => {
    setResumeForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          field: "",
          startYear: "",
          endYear: "",
          grade: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setResumeForm((prev) => ({
      ...prev,
      education:
        prev.education.length > 1
          ? prev.education.filter(
              (_, itemIndex) =>
                itemIndex !== index
            )
          : prev.education,
    }));
  };

  const updateExperience = (index, field, value) => {
    setResumeForm((prev) => {
      const experience = [...prev.experience];
      experience[index] = {
        ...experience[index],
        [field]: value,
      };
      return {
        ...prev,
        experience,
      };
    });
  };

  const addExperience = () => {
    setResumeForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          role: "",
          duration: "",
          responsibilities: "",
          achievements: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setResumeForm((prev) => ({
      ...prev,
      experience:
        prev.experience.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  };

  const updateProject = (index, field, value) => {
    setResumeForm((prev) => {
      const projects = [...prev.projects];
      projects[index] = {
        ...projects[index],
        [field]: value,
      };
      return {
        ...prev,
        projects,
      };
    });
  };

  const addProject = () => {
    setResumeForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "",
          technologies: "",
          description: "",
          role: "",
          result: "",
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setResumeForm((prev) => ({
      ...prev,
      projects:
        prev.projects.length > 1
          ? prev.projects.filter(
              (_, itemIndex) =>
                itemIndex !== index
            )
          : prev.projects,
    }));
  };

  const openResumeBuilder = (mode) => {
    setResumeMode(mode);
    setResumeError("");
    setResumeData(null);
    setResumeJobDescription("");
    setResumeEnhanceFile(null);
    setShowResumeBuilder(true);
  };

  const closeResumeBuilder = () => {
    setShowResumeBuilder(false);
    setResumeMode(null);
    setResumeError("");
    setResumeData(null);
    setResumeEnhanceFile(null);
  };

  const handleResumeEnhanceFile = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setResumeError(
        "Please upload a PDF or DOCX resume."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError(
        "Resume must be smaller than 10 MB."
      );
      return;
    }

    setResumeEnhanceFile(file);
    setResumeError("");
  };

  const handleAtsResumeFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setAtsError(
        "Please upload a PDF or DOCX resume."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAtsError(
        "Resume must be smaller than 10 MB."
      );
      event.target.value = "";
      return;
    }

    setAtsResumeFile(file);
    setAtsResult(null);
    setAtsError("");
  };

  const analyzeResumeMatch = async () => {
    if (!atsResumeFile) {
      setAtsError("Please upload your resume.");
      return;
    }

    if (!atsJobDescription.trim()) {
      setAtsError(
        "Please paste the job description."
      );
      return;
    }

    try {
      setAtsLoading(true);
      setAtsError("");
      setAtsResult(null);

      const formData = new FormData();
      formData.append("resume", atsResumeFile);
      formData.append(
        "jobDescription",
        atsJobDescription
      );
      formData.append(
        "targetRole",
        atsTargetRole || careerGoal || selectedPath
      );

      const response = await API.post(
        "/resume/analyze",
        formData
      );

      setAtsResult(response.data?.analysis || null);
    } catch (error) {
      console.error(
        "ATS Resume Analysis Error:",
        error
      );

      setAtsError(
        error.response?.data?.message ||
          "Failed to analyze resume."
      );
    } finally {
      setAtsLoading(false);
    }
  };

  const buildResume = async () => {
    setResumeLoading(true);
    setResumeError("");

    try {
      if (
        !resumeForm.fullName.trim() ||
        !resumeForm.email.trim()
      ) {
        throw new Error(
          "Please enter your name and email."
        );
      }

      if (
        !resumeForm.education.some(
          (item) =>
            item.degree.trim() &&
            item.institution.trim()
        )
      ) {
        throw new Error(
          "Please add at least one education entry."
        );
      }

      if (!resumeJobDescription.trim()) {
        throw new Error(
          "Please paste the job description."
        );
      }

      const response =
        await API.post(
          "/resume/build",
          {
            personalDetails: {
              fullName:
                resumeForm.fullName,
              email:
                resumeForm.email,
              phone:
                resumeForm.phone,
              location:
                resumeForm.location,
              linkedin:
                resumeForm.linkedin,
              github:
                resumeForm.github,
              portfolio:
                resumeForm.portfolio,
            },
            summary:
              resumeForm.summary,
            education:
              resumeForm.education,
            experience:
              resumeForm.experience,
            skills:
              resumeForm.skills,
            tools:
              resumeForm.tools,
            softSkills:
              resumeForm.softSkills,
            certifications:
              resumeForm.certifications,
            achievements:
              resumeForm.achievements,
            projects:
              resumeForm.projects,
            jobDescription:
              resumeJobDescription,
            targetRole:
              careerGoal ||
              selectedPath,
          }
        );

      setResumeData(
        response.data.resume
      );
    } catch (error) {
      console.error(
        "Resume Build Error:",
        error
      );

      setResumeError(
        error.response?.data?.message ||
          error.message ||
          "Failed to build your resume."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  const enhanceResume = async () => {
    if (!resumeEnhanceFile) {
      setResumeError(
        "Please upload your existing resume."
      );
      return;
    }

    if (!resumeJobDescription.trim()) {
      setResumeError(
        "Please paste the job description."
      );
      return;
    }

    try {
      setResumeLoading(true);
      setResumeError("");

      const formData = new FormData();

      formData.append(
        "resume",
        resumeEnhanceFile
      );

      formData.append(
        "jobDescription",
        resumeJobDescription
      );

      formData.append(
        "targetRole",
        careerGoal ||
          selectedPath
      );

      const response =
        await API.post(
          "/resume/enhance",
          formData
        );

      setResumeData(
        response.data.resume
      );
    } catch (error) {
      console.error(
        "Resume Enhance Error:",
        error
      );

      setResumeError(
        error.response?.data?.message ||
          "Failed to enhance your resume."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  const printResume = () => {
    window.print();
  };

  /* =====================================================
     SPEAK QUESTION
  ===================================================== */

  const speakQuestion =
    (question) => {
      if (!question) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          question
        );

      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(
        utterance
      );
    };


  /* =====================================================
     START LISTENING
  ===================================================== */

  const startListening =
    () => {
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setInterviewError(
          "Speech recognition is not supported in this browser. Please use Google Chrome."
        );

        return;
      }

      if (
        recognitionRef.current
      ) {
        recognitionRef.current.stop();
      }

      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      setCurrentAnswer("");
      setInterviewError("");

      const recognition =
        new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult =
        (event) => {
          let transcript = "";

          for (
            let i = 0;
            i < event.results.length;
            i++
          ) {
            transcript +=
              event.results[i][0]
                .transcript + " ";
          }

          setCurrentAnswer(
            transcript.trim()
          );
        };

      recognition.onerror =
        (event) => {
          console.error(
            "Speech recognition error:",
            event.error
          );

          setIsListening(false);

          if (
            event.error ===
            "not-allowed"
          ) {
            setInterviewError(
              "Microphone permission was denied. Please allow microphone access in Chrome."
            );
          } else if (
            event.error ===
            "no-speech"
          ) {
            setInterviewError(
              "No speech detected. Please try speaking again."
            );
          }
        };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current =
        recognition;

      try {
        recognition.start();
      } catch (error) {
        console.error(
          "Recognition start error:",
          error
        );
      }
    };


  /* =====================================================
     STOP LISTENING
  ===================================================== */

  const stopListening =
    () => {
      if (
        recognitionRef.current
      ) {
        recognitionRef.current.stop();
      }

      setIsListening(false);
    };


  /* =====================================================
     START INTERVIEW
  ===================================================== */

  const startInterview =
    async (type) => {
      try {
        setInterviewLoading(
          true
        );

        setError("");
        setInterviewError("");

        setInterviewSession(null);
        setEvaluation(null);
        setShowEvaluation(false);
        setCurrentAnswer("");
        setIsListening(false);

        window.speechSynthesis.cancel();

        const skills = [
          ...(careerData?.currentSkills ||
            []),
          ...(careerData?.recommendedSkills ||
            []),
        ].slice(0, 10);

        const response =
          await API.post(
            "/interview/start",
            {
              type,

              targetRole:
                careerData?.targetRole ||
                careerGoal ||
                selectedPath,

              skills,
            }
          );

        const session =
          response.data.interview;

        setInterviewSession(
          session
        );

        setActiveInterview(
          type
        );

        // Wait for the modal to render.
        setTimeout(() => {
          const firstQuestion =
            session.questions?.[0]
              ?.question;

          speakQuestion(
            firstQuestion
          );
        }, 600);
      } catch (error) {
        console.error(
          "Start Interview Error:",
          error
        );

        setInterviewError(
          error.response?.data
            ?.message ||
            "Failed to start interview."
        );

        setActiveInterview(
          null
        );
      } finally {
        setInterviewLoading(
          false
        );
      }
    };


  /* =====================================================
     SUBMIT ANSWER
  ===================================================== */

  const submitInterviewAnswer =
    async () => {
      if (
        !interviewSession
      ) {
        return;
      }

      const currentQuestion =
        interviewSession.questions[
          interviewSession.currentQuestion
        ];

      if (!currentQuestion) {
        return;
      }

      if (
        !currentAnswer.trim()
      ) {
        setInterviewError(
          "Please speak your answer before submitting."
        );
        return;
      }

      try {
        setInterviewLoading(
          true
        );

        setInterviewError("");

        if (
          recognitionRef.current
        ) {
          recognitionRef.current.stop();
        }

        setIsListening(false);

        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        const response =
          await API.post(
            `/interview/${interviewSession._id}/answer`,
            {
              questionId:
                currentQuestion._id,

              answer:
                currentAnswer.trim(),
            }
          );

        const responseInterview =
          response.data.interview;

        if (
          response.data.completed
        ) {
          setInterviewSession(
            responseInterview
          );

          setEvaluation(
            response.data.evaluation ||
              null
          );

          setShowEvaluation(
            false
          );

          return;
        }

        setEvaluation(
          response.data.evaluation ||
            null
        );

        setInterviewSession(
          responseInterview
        );

        setShowEvaluation(
          true
        );
      } catch (error) {
        console.error(
          "Interview Evaluation Error:",
          error
        );

        setInterviewError(
          error.response?.data
            ?.message ||
            "Failed to evaluate your answer."
        );
      } finally {
        setInterviewLoading(
          false
        );
      }
    };


  /* =====================================================
     NEXT QUESTION
  ===================================================== */

  const nextInterviewQuestion =
    () => {
      if (
        !interviewSession
      ) {
        return;
      }

      const nextQuestion =
        interviewSession.questions[
          interviewSession.currentQuestion
        ];

      setShowEvaluation(
        false
      );

      setEvaluation(null);

      setCurrentAnswer("");

      setInterviewError("");

      if (
        nextQuestion
      ) {
        setTimeout(() => {
          speakQuestion(
            nextQuestion.question
          );
        }, 300);
      }
    };


  /* =====================================================
     CLOSE INTERVIEW
  ===================================================== */

  const closeInterview =
    () => {
      if (
        recognitionRef.current
      ) {
        recognitionRef.current.stop();
      }

      window.speechSynthesis.cancel();

      setIsListening(false);
      setIsSpeaking(false);

      setActiveInterview(
        null
      );

      setInterviewSession(
        null
      );

      setCurrentAnswer("");

      setEvaluation(null);

      setShowEvaluation(false);

      setInterviewError("");
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loadingProfile) {
    return (
      <Layout>
        <div className="career-page">
          <div className="career-loading-page">
            <Loader
              size={26}
              className="career-spin"
            />

            Loading your career profile...
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>

      <div className="career-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="career-header">

          <div className="career-title-row">

            <div className="career-title-icon">
              <BriefcaseBusiness
                size={27}
              />
            </div>

            <div>

              <h1 className="career-title">
                Career
              </h1>

              <p className="career-subtitle">
                Build the skills, resume
                and confidence you need
                for your next opportunity.
              </p>

            </div>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="career-error">

            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>

          </div>
        )}


        {/* =================================================
            CAREER GOAL
        ================================================= */}

        <div className="career-card career-goal-card">

          <div className="career-card-heading">

            <div className="career-card-icon">
              <Target size={20} />
            </div>

            <div>

              <h2>
                What's your career goal?
              </h2>

              <p>
                Tell PaperPal what you're
                preparing for. Resume is optional.
              </p>

            </div>

          </div>

          <div className="career-goal-input-row">

            <input
              type="text"
              value={careerGoal}
              onChange={(e) =>
                setCareerGoal(
                  e.target.value
                )
              }
              placeholder="Example: Salesforce Developer, Software Engineer, Data Analyst..."
              className="career-input"
            />

            <button
              type="button"
              onClick={
                handleBuildPlan
              }
              disabled={loading}
              className="career-btn career-btn-primary"
            >

              {loading ? (
                <>
                  <Loader
                    size={17}
                    className="career-spin"
                  />

                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles
                    size={17}
                  />

                  {careerData
                    ? "Update My Plan"
                    : "Build My Plan"}
                </>
              )}

            </button>

          </div>

        </div>


        {/* =================================================
            RESUME + TARGET
        ================================================= */}

        <div className="career-main-grid">

          <div className="career-card resume-builder-card">

            <div className="career-section-header">

              <div className="career-card-icon blue-icon">
                <FileText size={20} />
              </div>

              <div>
                <h2>
                  Resume Builder
                </h2>

                <p>
                  Build a new resume or enhance
                  your existing resume for a job.
                </p>
              </div>

            </div>

            <div className="resume-builder-options">

              <button
                type="button"
                className="resume-mode-card"
                onClick={() =>
                  openResumeBuilder("build")
                }
              >
                <div className="resume-mode-icon">
                  <FilePlus2 size={23} />
                </div>

                <div className="resume-mode-content">
                  <strong>
                    Build New Resume
                  </strong>

                  <span>
                    Start from scratch using your
                    education, skills, projects
                    and other details.
                  </span>
                </div>

                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="resume-mode-card"
                onClick={() =>
                  openResumeBuilder("enhance")
                }
              >
                <div className="resume-mode-icon enhance">
                  <WandSparkles size={23} />
                </div>

                <div className="resume-mode-content">
                  <strong>
                    Enhance Resume
                  </strong>

                  <span>
                    Upload your existing resume and
                    tailor it to a specific job.
                  </span>
                </div>

                <ChevronRight size={18} />
              </button>

            </div>

            {careerData?.resumeFileName && (
              <div className="existing-resume-strip">

                <FileText size={16} />

                <span>
                  Existing profile resume:
                  {" "}
                  <strong>
                    {careerData.resumeFileName}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    openResumeBuilder("enhance")
                  }
                >
                  Enhance
                </button>

              </div>
            )}

          </div>

          <div className="career-card">

            <div className="career-section-header">

              <div className="career-card-icon purple-icon">
                <BriefcaseBusiness
                  size={20}
                />
              </div>

              <div>

                <h2>
                  Target Career Path
                </h2>

                <p>
                  Select the role you're
                  interested in.
                </p>

              </div>

            </div>

            <div className="career-path-grid">

              {careerPaths.map(
                (path) => (

                  <button
                    type="button"
                    key={path}
                    onClick={() =>
                      setSelectedPath(
                        path
                      )
                    }
                    className={`career-path-button ${
                      selectedPath ===
                      path
                        ? "active"
                        : ""
                    }`}
                  >

                    <span>
                      {path}
                    </span>

                    {selectedPath ===
                      path && (
                      <CheckCircle
                        size={16}
                      />
                    )}

                  </button>
                )
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            RESUME & JOB MATCH / ATS ANALYSIS
        ================================================= */}

        <section className="career-card career-section-card ats-analysis-card">
          <div className="career-section-header">
            <div className="career-card-icon orange-icon">
              <Target size={20} />
            </div>

            <div>
              <h2>Resume & Job Match</h2>
              <p>
                Compare your resume with a job description and get an estimated ATS match.
              </p>
            </div>
          </div>

          <div className="ats-analysis-form">
            <input
              ref={atsFileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleAtsResumeFile}
              hidden
            />

            <button
              type="button"
              className="ats-upload-box"
              onClick={() =>
                atsFileInputRef.current?.click()
              }
              disabled={atsLoading}
            >
              <Upload size={23} />
              <strong>
                {atsResumeFile
                  ? atsResumeFile.name
                  : "Upload your resume"}
              </strong>
              <span>
                PDF or DOCX · Maximum 10 MB
              </span>
            </button>

            <div className="ats-field-group">
              <label htmlFor="ats-target-role">
                Target role
              </label>

              <input
                id="ats-target-role"
                type="text"
                value={atsTargetRole}
                onChange={(event) =>
                  setAtsTargetRole(event.target.value)
                }
                placeholder={
                  careerGoal ||
                  selectedPath ||
                  "Example: Salesforce Developer"
                }
                className="career-input"
                disabled={atsLoading}
              />
            </div>

            <div className="ats-field-group ats-job-description-group">
              <label htmlFor="ats-job-description">
                Job description
              </label>

              <textarea
                id="ats-job-description"
                value={atsJobDescription}
                onChange={(event) =>
                  setAtsJobDescription(event.target.value)
                }
                placeholder="Paste the complete job description and requirements here..."
                className="ats-job-description"
                disabled={atsLoading}
              />
            </div>

            {atsError && (
              <div className="ats-error">
                <AlertTriangle size={15} />
                <span>{atsError}</span>
              </div>
            )}

            <button
              type="button"
              className="career-btn career-btn-primary ats-analyze-button"
              onClick={analyzeResumeMatch}
              disabled={atsLoading}
            >
              {atsLoading ? (
                <>
                  <Loader2
                    size={17}
                    className="career-spin"
                  />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Analyze Resume Match
                </>
              )}
            </button>
          </div>

          {atsResult && (
            <div className="ats-result-panel">
              <div className="ats-score-grid">
                <AtsScoreCard
                  title="Estimated ATS Score"
                  value={atsResult.atsScore}
                />
                <AtsScoreCard
                  title="Resume / Job Match"
                  value={atsResult.jobMatchPercentage}
                />
                <AtsScoreCard
                  title="Experience Fit"
                  value={atsResult.experienceFitPercentage}
                />
              </div>

              <AtsKeywordSection
                title="Matched Skills"
                items={atsResult.matchedSkills}
                type="matched"
              />

              <AtsKeywordSection
                title="Missing Skills"
                items={atsResult.missingSkills}
                type="missing"
              />

              <AtsKeywordSection
                title="Matched Keywords"
                items={atsResult.matchedKeywords}
                type="matched"
              />

              <AtsKeywordSection
                title="Missing Keywords"
                items={atsResult.missingKeywords}
                type="missing"
              />

              <div className="ats-suggestions-box">
                <div className="ats-subheading">
                  <Lightbulb size={17} />
                  Improvement Suggestions
                </div>

                {Array.isArray(
                  atsResult.improvementSuggestions
                ) &&
                atsResult.improvementSuggestions.length > 0 ? (
                  <ul>
                    {atsResult.improvementSuggestions.map(
                      (suggestion, index) => (
                        <li key={`${suggestion}-${index}`}>
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    No additional improvement suggestions were returned.
                  </p>
                )}
              </div>

              <div className="ats-disclaimer">
                <AlertCircle size={14} />
                <span>
                  These scores are estimates based on the supplied resume and job description. They are not the proprietary score of any specific company's ATS.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            AI RESULTS
        ================================================= */}

        {careerData && (
          <>
            <div className="career-card career-readiness-card">

              <div className="career-section-header">

                <div className="career-card-icon green-icon">
                  <TrendingUp
                    size={20}
                  />
                </div>

                <div>

                  <h2>
                    Career Readiness
                  </h2>

                  <p>
                    Based on your resume
                    and target role.
                  </p>

                </div>

              </div>

              <div className="readiness-content">

                <div className="readiness-score">

                  <span>
                    {
                      careerData.careerReadiness
                    }%
                  </span>

                  <small>
                    Current readiness
                  </small>

                </div>

                <div className="readiness-bar">

                  <div
                    className="readiness-bar-fill"
                    style={{
                      width: `${careerData.careerReadiness}%`,
                    }}
                  />

                </div>

                {careerData.aiAnalysis && (
                  <p className="readiness-note">
                    {
                      careerData.aiAnalysis
                    }
                  </p>
                )}

              </div>

            </div>


            <div className="career-card career-section-card">

              <div className="career-section-header">

                <div className="career-card-icon orange-icon">
                  <Brain size={20} />
                </div>

                <div>

                  <h2>
                    Skill Assessment
                  </h2>

                  <p>
                    Understand where you
                    stand and what you
                    should focus on.
                  </p>

                </div>

              </div>

              <div className="career-skills-grid">

                <div className="career-skill-box">

                  <div className="career-skill-heading current">
                    <CheckCircle size={17} />
                    Current Skills
                  </div>

                  <div className="career-skill-list">

                    {careerData.currentSkills?.map(
                      (skill) => (
                        <span
                          key={skill}
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>


                <div className="career-skill-box">

                  <div className="career-skill-heading missing">
                    <Circle size={17} />
                    Skills to Improve
                  </div>

                  <div className="career-skill-list">

                    {careerData.skillsToImprove?.map(
                      (skill) => (
                        <span
                          key={skill}
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>


                <div className="career-skill-box">

                  <div className="career-skill-heading recommended">
                    <Sparkles size={17} />
                    Recommended
                  </div>

                  <div className="career-skill-list">

                    {careerData.recommendedSkills?.map(
                      (skill) => (
                        <span
                          key={skill}
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>

              </div>

            </div>


            <div className="career-card career-section-card">

              <div className="career-section-header">

                <div className="career-card-icon green-icon">
                  <Route size={20} />
                </div>

                <div>

                  <h2>
                    Career Roadmap
                  </h2>

                  <p>
                    Your personalized path
                    towards{" "}
                    {
                      careerData.targetRole
                    }.
                  </p>

                </div>

              </div>

              <div className="career-roadmap">

                {careerData.roadmap?.map(
                  (
                    step,
                    index
                  ) => (

                    <div
                      className="career-roadmap-step"
                      key={
                        `${step.step}-${index}`
                      }
                    >

                      <div className="roadmap-number">
                        {
                          step.step
                        }
                      </div>

                      <div className="roadmap-content">

                        <div className="roadmap-title-row">

                          <h3>
                            {
                              step.title
                            }
                          </h3>

                          <span
                            className={`roadmap-status ${String(
                              step.status
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {
                              step.status
                            }
                          </span>

                        </div>

                        <p>
                          {
                            step.description
                          }
                        </p>

                      </div>

                      {index <
                        careerData
                          .roadmap
                          .length -
                          1 && (
                        <div className="roadmap-line" />
                      )}

                    </div>
                  )
                )}

              </div>

            </div>
          </>
        )}


        {/* =================================================
            INTERVIEW PREPARATION
        ================================================= */}

        <div className="career-card career-section-card">

          <div className="career-section-header">

            <div className="career-card-icon pink-icon">
              <MessageSquareText
                size={20}
              />
            </div>

            <div>

              <h2>
                Interview Preparation
              </h2>

              <p>
                Practice before the real
                interview.
              </p>

            </div>

          </div>

          <div className="interview-grid">

            <button
              type="button"
              onClick={() =>
                setActiveInterview(
                  "technical"
                )
              }
              className="interview-card"
              disabled={
                interviewLoading
              }
            >

              <div className="interview-icon">
                <Brain size={22} />
              </div>

              <div>

                <h3>
                  Technical Interview
                </h3>

                <p>
                  Practice technical
                  questions for your
                  target role.
                </p>

              </div>

              <ChevronRight size={19} />

            </button>


            <button
              type="button"
              onClick={() =>
                setActiveInterview(
                  "hr"
                )
              }
              className="interview-card"
              disabled={
                interviewLoading
              }
            >

              <div className="interview-icon">
                <Award size={22} />
              </div>

              <div>

                <h3>
                  HR Interview
                </h3>

                <p>
                  Prepare common HR and
                  behavioral questions.
                </p>

              </div>

              <ChevronRight size={19} />

            </button>


            <button
              type="button"
              onClick={() =>
                setActiveInterview(
                  "mock"
                )
              }
              className="interview-card"
              disabled={
                interviewLoading
              }
            >

              <div className="interview-icon">
                <Video size={22} />
              </div>

              <div>

                <h3>
                  Mock Interview
                </h3>

                <p>
                  Simulate a real
                  interview with PaperPal AI.
                </p>

              </div>

              <ChevronRight size={19} />

            </button>

          </div>

        </div>


        {/* =================================================
            JOBS
        ================================================= */}

        <div className="career-card career-section-card jobs-card">

          <div className="career-section-header">

            <div className="career-card-icon green-icon">
              <Search size={20} />
            </div>

            <div>

              <h2>
                Jobs You Can Apply For
              </h2>

              <p>
                Openings aligned with your
                current career direction.
              </p>

            </div>

          </div>

          <div className="jobs-list">

            {jobs.map(
              (job) => (

                <div
                  key={job.id}
                  className="job-card"
                >

                  <div className="job-card-main">

                    <div className="job-company-icon">
                      <BriefcaseBusiness
                        size={19}
                      />
                    </div>

                    <div className="job-info">

                      <h3>
                        {job.title}
                      </h3>

                      <div className="job-company">
                        {job.company}
                      </div>

                      <div className="job-meta">

                        <span>
                          {job.location}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {job.experience}
                        </span>

                      </div>

                      <p className="job-reason">
                        {job.reason}
                      </p>

                    </div>

                  </div>

                  <div className="job-card-side">

                    <span
                      className={`job-match ${job.matchClass}`}
                    >
                      {job.match}
                    </span>

                    <span className="job-source">
                      {job.source}
                    </span>

                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="job-apply-button"
                    >

                      <ExternalLink
                        size={15}
                      />

                      View Job

                    </a>

                  </div>

                </div>
              )
            )}

          </div>

        </div>



        {/* =================================================
            RESUME BUILDER MODAL
        ================================================= */}

        {showResumeBuilder && (
          <div
            className="career-modal-overlay resume-modal-overlay"
            onClick={closeResumeBuilder}
          >
            <div
              className="career-modal resume-builder-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="career-modal-header">

                <div>

                  <div className="career-modal-kicker">
                    <Sparkles size={15} />
                    PaperPal AI Resume Studio
                  </div>

                  <h2>
                    {resumeMode === "build"
                      ? "Build New Resume"
                      : "Enhance Existing Resume"}
                  </h2>

                  <p>
                    {resumeMode === "build"
                      ? "Create an ATS-friendly resume using your details and the job description."
                      : "Improve your existing resume and tailor it to the job you want."}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeResumeBuilder}
                  className="career-modal-close"
                >
                  <X size={20} />
                </button>

              </div>

              {!resumeData && (
                <div className="resume-studio-body">

                  {resumeMode === "build" ? (
                    <>

                      <div className="resume-form-section">

                        <div className="resume-form-heading">
                          <User size={18} />
                          <h3>
                            Basic Information
                          </h3>
                        </div>

                        <div className="resume-form-grid">

                          <input
                            className="resume-field"
                            placeholder="Full Name *"
                            value={
                              resumeForm.fullName
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "fullName",
                                e.target.value
                              )
                            }
                          />

                          <input
                            className="resume-field"
                            placeholder="Email *"
                            type="email"
                            value={
                              resumeForm.email
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "email",
                                e.target.value
                              )
                            }
                          />

                          <input
                            className="resume-field"
                            placeholder="Phone Number"
                            value={
                              resumeForm.phone
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "phone",
                                e.target.value
                              )
                            }
                          />

                          <input
                            className="resume-field"
                            placeholder="Location"
                            value={
                              resumeForm.location
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "location",
                                e.target.value
                              )
                            }
                          />

                          <input
                            className="resume-field"
                            placeholder="LinkedIn URL"
                            value={
                              resumeForm.linkedin
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "linkedin",
                                e.target.value
                              )
                            }
                          />

                          <input
                            className="resume-field"
                            placeholder="GitHub URL"
                            value={
                              resumeForm.github
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "github",
                                e.target.value
                              )
                            }
                          />

                          <input
                            className="resume-field resume-field-full"
                            placeholder="Portfolio URL (optional)"
                            value={
                              resumeForm.portfolio
                            }
                            onChange={(e) =>
                              updateResumeField(
                                "portfolio",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="resume-form-section">

                        <div className="resume-form-heading">
                          <GraduationCap size={18} />
                          <h3>
                            Education
                          </h3>

                          <button
                            type="button"
                            className="resume-small-add"
                            onClick={
                              addEducation
                            }
                          >
                            <Plus size={14} />
                            Add
                          </button>

                        </div>

                        {resumeForm.education.map(
                          (item, index) => (
                            <div
                              className="resume-repeat-card"
                              key={index}
                            >

                              <div className="resume-repeat-header">
                                <span>
                                  Education {index + 1}
                                </span>

                                {resumeForm.education.length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeEducation(
                                        index
                                      )
                                    }
                                    className="resume-icon-delete"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}

                              </div>

                              <div className="resume-form-grid">

                                <input
                                  className="resume-field"
                                  placeholder="Degree / Qualification *"
                                  value={
                                    item.degree
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "degree",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="College / University *"
                                  value={
                                    item.institution
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "institution",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="Branch / Specialization"
                                  value={
                                    item.field
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "field",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="Start Year"
                                  value={
                                    item.startYear
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "startYear",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="End Year"
                                  value={
                                    item.endYear
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "endYear",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="CGPA / Percentage"
                                  value={
                                    item.grade
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "grade",
                                      e.target.value
                                    )
                                  }
                                />

                              </div>

                            </div>
                          )
                        )}

                      </div>

                      <div className="resume-form-section">

                        <div className="resume-form-heading">
                          <BriefcaseBusiness size={18} />
                          <h3>
                            Experience
                          </h3>

                          <button
                            type="button"
                            className="resume-small-add"
                            onClick={
                              addExperience
                            }
                          >
                            <Plus size={14} />
                            Add
                          </button>

                        </div>

                        {resumeForm.experience.length ===
                        0 ? (
                          <div className="resume-empty-note">
                            No experience added. Leave
                            this empty if you are a fresher.
                          </div>
                        ) : (
                          resumeForm.experience.map(
                            (item, index) => (
                              <div
                                className="resume-repeat-card"
                                key={index}
                              >

                                <div className="resume-repeat-header">
                                  <span>
                                    Experience {index + 1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeExperience(
                                        index
                                      )
                                    }
                                    className="resume-icon-delete"
                                  >
                                    <Trash2 size={15} />
                                  </button>

                                </div>

                                <div className="resume-form-grid">

                                  <input
                                    className="resume-field"
                                    placeholder="Company"
                                    value={
                                      item.company
                                    }
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "company",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <input
                                    className="resume-field"
                                    placeholder="Job Title"
                                    value={
                                      item.role
                                    }
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "role",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <input
                                    className="resume-field resume-field-full"
                                    placeholder="Duration"
                                    value={
                                      item.duration
                                    }
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <textarea
                                    className="resume-field resume-textarea resume-field-full"
                                    placeholder="Responsibilities"
                                    value={
                                      item.responsibilities
                                    }
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "responsibilities",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <textarea
                                    className="resume-field resume-textarea resume-field-full"
                                    placeholder="Achievements"
                                    value={
                                      item.achievements
                                    }
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "achievements",
                                        e.target.value
                                      )
                                    }
                                  />

                                </div>

                              </div>
                            )
                          )
                        )}

                      </div>

                      <div className="resume-form-section">

                        <div className="resume-form-heading">
                          <Sparkles size={18} />
                          <h3>
                            Skills & Projects
                          </h3>
                        </div>

                        <textarea
                          className="resume-field resume-textarea"
                          placeholder="Technical Skills (e.g. Salesforce, Python, SQL, MySQL, DBMS)"
                          value={
                            resumeForm.skills
                          }
                          onChange={(e) =>
                            updateResumeField(
                              "skills",
                              e.target.value
                            )
                          }
                        />

                        <textarea
                          className="resume-field resume-textarea"
                          placeholder="Tools / Platforms"
                          value={
                            resumeForm.tools
                          }
                          onChange={(e) =>
                            updateResumeField(
                              "tools",
                              e.target.value
                            )
                          }
                        />

                        <textarea
                          className="resume-field resume-textarea"
                          placeholder="Soft Skills"
                          value={
                            resumeForm.softSkills
                          }
                          onChange={(e) =>
                            updateResumeField(
                              "softSkills",
                              e.target.value
                            )
                          }
                        />

                        <textarea
                          className="resume-field resume-textarea"
                          placeholder="Certifications"
                          value={
                            resumeForm.certifications
                          }
                          onChange={(e) =>
                            updateResumeField(
                              "certifications",
                              e.target.value
                            )
                          }
                        />

                        <textarea
                          className="resume-field resume-textarea"
                          placeholder="Achievements"
                          value={
                            resumeForm.achievements
                          }
                          onChange={(e) =>
                            updateResumeField(
                              "achievements",
                              e.target.value
                            )
                          }
                        />

                        {resumeForm.projects.map(
                          (item, index) => (
                            <div
                              className="resume-repeat-card"
                              key={index}
                            >

                              <div className="resume-repeat-header">
                                <span>
                                  Project {index + 1}
                                </span>

                                {resumeForm.projects.length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeProject(
                                        index
                                      )
                                    }
                                    className="resume-icon-delete"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}

                              </div>

                              <div className="resume-form-grid">

                                <input
                                  className="resume-field"
                                  placeholder="Project Name"
                                  value={
                                    item.name
                                  }
                                  onChange={(e) =>
                                    updateProject(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="Technologies Used"
                                  value={
                                    item.technologies
                                  }
                                  onChange={(e) =>
                                    updateProject(
                                      index,
                                      "technologies",
                                      e.target.value
                                    )
                                  }
                                />

                                <textarea
                                  className="resume-field resume-textarea resume-field-full"
                                  placeholder="What did you build?"
                                  value={
                                    item.description
                                  }
                                  onChange={(e) =>
                                    updateProject(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="Your Role"
                                  value={
                                    item.role
                                  }
                                  onChange={(e) =>
                                    updateProject(
                                      index,
                                      "role",
                                      e.target.value
                                    )
                                  }
                                />

                                <input
                                  className="resume-field"
                                  placeholder="Result / Achievement"
                                  value={
                                    item.result
                                  }
                                  onChange={(e) =>
                                    updateProject(
                                      index,
                                      "result",
                                      e.target.value
                                    )
                                  }
                                />

                              </div>

                            </div>
                          )
                        )}

                        <button
                          type="button"
                          className="resume-add-project-button"
                          onClick={addProject}
                        >
                          <Plus size={15} />
                          Add another project
                        </button>

                      </div>

                    </>
                  ) : (
                    <div className="resume-enhance-form">

                      <div className="resume-upload-large">

                        <input
                          id="resume-enhance-input"
                          type="file"
                          accept=".pdf,.docx"
                          onChange={
                            handleResumeEnhanceFile
                          }
                          hidden
                        />

                        <label
                          htmlFor="resume-enhance-input"
                          className="resume-enhance-dropzone"
                        >
                          <Upload size={30} />

                          <strong>
                            {resumeEnhanceFile
                              ? resumeEnhanceFile.name
                              : "Upload your existing resume"}
                          </strong>

                          <span>
                            PDF or DOCX • Maximum 10 MB
                          </span>

                          <div className="career-upload-button">
                            Choose Resume
                          </div>
                        </label>

                      </div>

                    </div>
                  )}

                  {/* JOB DESCRIPTION */}

                  <div className="resume-form-section resume-job-section">

                    <div className="resume-form-heading">
                      <Target size={18} />

                      <h3>
                        Target Job
                      </h3>

                    </div>

                    <input
                      className="resume-field"
                      placeholder="Target job title (optional)"
                      value={
                        careerGoal
                      }
                      readOnly
                    />

                    <textarea
                      className="resume-field resume-job-description"
                      placeholder="Paste the complete job description and requirements here..."
                      value={
                        resumeJobDescription
                      }
                      onChange={(e) =>
                        setResumeJobDescription(
                          e.target.value
                        )
                      }
                    />

                    <p className="resume-job-help">
                      PaperPal will identify important
                      keywords, skills and requirements
                      and tailor the resume without
                      inventing qualifications.
                    </p>

                  </div>

                  {resumeError && (
                    <div className="interview-inline-error">
                      <AlertCircle size={16} />
                      {resumeError}
                    </div>
                  )}

                  <div className="resume-studio-actions">

                    <button
                      type="button"
                      className="career-btn career-modal-secondary"
                      onClick={
                        closeResumeBuilder
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="career-btn career-btn-primary"
                      onClick={
                        resumeMode === "build"
                          ? buildResume
                          : enhanceResume
                      }
                      disabled={
                        resumeLoading
                      }
                    >

                      {resumeLoading ? (
                        <>
                          <Loader
                            size={17}
                            className="career-spin"
                          />
                          {resumeMode === "build"
                            ? "Building Resume..."
                            : "Enhancing Resume..."}
                        </>
                      ) : (
                        <>
                          <WandSparkles size={17} />
                          {resumeMode === "build"
                            ? "Build My Resume"
                            : "Enhance My Resume"}
                        </>
                      )}

                    </button>

                  </div>

                </div>
              )}

              {resumeData && (
                <div
                  className="resume-result"
                  ref={resumePrintRef}
                >

                  <div className="resume-result-toolbar">

                    <div>
                      <span className="resume-ready-badge">
                        ✓ RESUME READY
                      </span>

                      <h3>
                        {resumeData.title ||
                          "Tailored Resume"}
                      </h3>
                    </div>

                    <div className="resume-result-actions">

                      <button
                        type="button"
                        className="career-btn career-modal-secondary"
                        onClick={() =>
                          setResumeData(null)
                        }
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="career-btn career-btn-primary"
                        onClick={printResume}
                      >
                        <Download size={16} />
                        Print / Save PDF
                      </button>

                    </div>

                  </div>

                  <div className="resume-ats-card">

                    <div>
                      <span>
                        ATS Match
                      </span>

                      <strong>
                        {resumeData.atsScore ?? 0}%
                      </strong>
                    </div>

                    <div className="resume-ats-bar">
                      <div
                        style={{
                          width: `${resumeData.atsScore ?? 0}%`,
                        }}
                      />
                    </div>

                    {resumeData.matchedKeywords?.length >
                      0 && (
                      <div className="resume-keyword-row">

                        <strong>
                          Matched:
                        </strong>

                        {resumeData.matchedKeywords.map(
                          (keyword) => (
                            <span key={keyword}>
                              ✓ {keyword}
                            </span>
                          )
                        )}

                      </div>
                    )}

                    {resumeData.missingKeywords?.length >
                      0 && (
                      <div className="resume-keyword-row missing-keywords">

                        <strong>
                          Skills to consider:
                        </strong>

                        {resumeData.missingKeywords.map(
                          (keyword) => (
                            <span key={keyword}>
                              {keyword}
                            </span>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  <div className="resume-paper">

                    <div className="resume-paper-header">

                      <h1>
                        {
                          resumeData.personalDetails
                            ?.fullName
                        }
                      </h1>

                      <div className="resume-contact-line">

                        {resumeData.personalDetails?.location && (
                          <span>
                            {
                              resumeData.personalDetails.location
                            }
                          </span>
                        )}

                        {resumeData.personalDetails?.email && (
                          <span>
                            {
                              resumeData.personalDetails.email
                            }
                          </span>
                        )}

                        {resumeData.personalDetails?.phone && (
                          <span>
                            {
                              resumeData.personalDetails.phone
                            }
                          </span>
                        )}

                      </div>

                      <div className="resume-links-line">

                        {resumeData.personalDetails?.linkedin && (
                          <span>
                            LinkedIn
                          </span>
                        )}

                        {resumeData.personalDetails?.github && (
                          <span>
                            GitHub
                          </span>
                        )}

                        {resumeData.personalDetails?.portfolio && (
                          <span>
                            Portfolio
                          </span>
                        )}

                      </div>

                    </div>


                    {resumeData.summary && (
                      <section>
                        <h4>
                          PROFESSIONAL SUMMARY
                        </h4>

                        <p>
                          {resumeData.summary}
                        </p>
                      </section>
                    )}


                    {resumeData.skills?.length > 0 && (
                      <section>
                        <h4>
                          SKILLS
                        </h4>

                        <p>
                          {resumeData.skills.join(
                            " • "
                          )}
                        </p>
                      </section>
                    )}


                    {resumeData.education?.length > 0 && (
                      <section>
                        <h4>
                          EDUCATION
                        </h4>

                        {resumeData.education.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="resume-paper-entry"
                            >
                              <strong>
                                {
                                  item.degree
                                }
                                {item.field
                                  ? ` — ${item.field}`
                                  : ""}
                              </strong>

                              <span>
                                {
                                  item.institution
                                }
                                {item.endYear
                                  ? ` | ${item.endYear}`
                                  : ""}
                              </span>

                              {item.grade && (
                                <span>
                                  {item.grade}
                                </span>
                              )}
                            </div>
                          )
                        )}

                      </section>
                    )}


                    {resumeData.experience?.length > 0 && (
                      <section>
                        <h4>
                          EXPERIENCE
                        </h4>

                        {resumeData.experience.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="resume-paper-entry"
                            >
                              <strong>
                                {
                                  item.role
                                }
                                {item.company
                                  ? ` — ${item.company}`
                                  : ""}
                              </strong>

                              {item.duration && (
                                <span>
                                  {
                                    item.duration
                                  }
                                </span>
                              )}

                              {item.bullets?.length > 0 && (
                                <ul>
                                  {item.bullets.map(
                                    (
                                      bullet,
                                      bulletIndex
                                    ) => (
                                      <li
                                        key={
                                          bulletIndex
                                        }
                                      >
                                        {bullet}
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>
                          )
                        )}

                      </section>
                    )}


                    {resumeData.projects?.length > 0 && (
                      <section>
                        <h4>
                          PROJECTS
                        </h4>

                        {resumeData.projects.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="resume-paper-entry"
                            >
                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              {item.technologies && (
                                <span>
                                  {
                                    item.technologies
                                  }
                                </span>
                              )}

                              {item.bullets?.length > 0 && (
                                <ul>
                                  {item.bullets.map(
                                    (
                                      bullet,
                                      bulletIndex
                                    ) => (
                                      <li
                                        key={
                                          bulletIndex
                                        }
                                      >
                                        {bullet}
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>
                          )
                        )}

                      </section>
                    )}


                    {resumeData.certifications?.length > 0 && (
                      <section>
                        <h4>
                          CERTIFICATIONS
                        </h4>

                        <ul>
                          {resumeData.certifications.map(
                            (
                              item,
                              index
                            ) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </section>
                    )}


                    {resumeData.achievements?.length > 0 && (
                      <section>
                        <h4>
                          ACHIEVEMENTS
                        </h4>

                        <ul>
                          {resumeData.achievements.map(
                            (
                              item,
                              index
                            ) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </section>
                    )}

                  </div>

                  <div className="resume-result-bottom-actions">

                    <button
                      type="button"
                      onClick={closeResumeBuilder}
                      className="career-btn career-btn-primary"
                    >
                      Done
                    </button>

                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* =================================================
            INTERVIEW MODAL
        ================================================= */}

        {activeInterview && (

          <div
            className="career-modal-overlay"
            onClick={
              closeInterview
            }
          >

            <div
              className="career-modal interview-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="career-modal-header">

                <div>

                  <div className="career-modal-kicker">

                    <Sparkles
                      size={15}
                    />

                    PaperPal AI Interviewer

                  </div>

                  <h2>
                    {activeInterview ===
                    "technical"
                      ? "Technical Interview"
                      : activeInterview ===
                        "hr"
                      ? "HR Interview"
                      : "Mock Interview"}
                  </h2>

                  <p>

                    Target role:{" "}

                    <strong>
                      {
                        careerData?.targetRole ||
                        careerGoal ||
                        selectedPath
                      }
                    </strong>

                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeInterview
                  }
                  className="career-modal-close"
                >
                  <X size={20} />
                </button>

              </div>


              {/* START SCREEN */}

              {!interviewSession && (

                <div className="interview-start-card">

                  <div className="interview-start-icon">

                    {activeInterview ===
                    "technical" ? (
                      <Code2 />
                    ) : activeInterview ===
                      "hr" ? (
                      <UserRound />
                    ) : (
                      <MessageSquareText />
                    )}

                  </div>

                  <h3>
                    Ready to begin?
                  </h3>

                  <p>
                    PaperPal AI will ask
                    five questions, read
                    them aloud and listen
                    to your spoken answers.
                  </p>

                  <div className="interview-start-features">

                    <div>
                      <Volume2 size={16} />
                      Voice questions
                    </div>

                    <div>
                      <Mic size={16} />
                      Voice answers
                    </div>

                    <div>
                      <Brain size={16} />
                      AI evaluation
                    </div>

                  </div>

                  {!speechSupported && (

                    <div className="speech-warning">

                      <AlertTriangle
                        size={17}
                      />

                      Speech recognition is
                      not available in this
                      browser. Use Google Chrome.

                    </div>

                  )}

                  {interviewError && (

                    <div className="interview-inline-error">

                      <AlertCircle
                        size={16}
                      />

                      {interviewError}

                    </div>

                  )}

                  <button
                    type="button"
                    onClick={() =>
                      startInterview(
                        activeInterview
                      )
                    }
                    disabled={
                      interviewLoading
                    }
                    className="career-btn career-btn-primary interview-start-button"
                  >

                    {interviewLoading ? (
                      <>
                        <Loader
                          size={18}
                          className="career-spin"
                        />

                        Preparing Interview...
                      </>
                    ) : (
                      <>
                        <Sparkles
                          size={18}
                        />

                        Start Interview
                      </>
                    )}

                  </button>

                </div>
              )}


              {/* LIVE INTERVIEW */}

              {interviewSession &&
                !interviewSession.completed && (

                  <div className="interview-live">

                    {/* PROGRESS */}

                    <div className="interview-progress-header">

                      <span>

                        Question{" "}

                        {
                          interviewSession.currentQuestion +
                          1
                        }{" "}

                        of{" "}

                        {
                          interviewSession.totalQuestions
                        }

                      </span>

                      <span className="interview-mode-label">

                        {activeInterview ===
                        "technical"
                          ? "TECHNICAL"
                          : activeInterview ===
                            "hr"
                          ? "HR"
                          : "MOCK"}

                      </span>

                    </div>


                    <div className="interview-progress-track">

                      <div
                        className="interview-progress-fill"
                        style={{
                          width: `${
                            ((interviewSession.currentQuestion) /
                              interviewSession.totalQuestions) *
                            100
                          }%`,
                        }}
                      />

                    </div>


                    {/* AI */}
                    
                    <div className="ai-interviewer-panel">

                      <div
                        className={`ai-avatar-large ${
                          isSpeaking
                            ? "speaking"
                            : ""
                        }`}
                      >

                        <div className="ai-avatar-face">
                          🤖
                        </div>

                        {isSpeaking && (
                          <span className="voice-pulse pulse-one" />
                        )}

                        {isSpeaking && (
                          <span className="voice-pulse pulse-two" />
                        )}

                      </div>

                      <div className="ai-interviewer-info">

                        <div className="ai-name-row">

                          <span className="ai-name">
                            PaperPal AI
                          </span>

                          <span className="ai-live-indicator">
                            ● LIVE
                          </span>

                        </div>

                        <div className="ai-speaking-status">

                          {isSpeaking ? (
                            <>
                              <Volume2 size={15} />
                              AI is asking the question...
                            </>
                          ) : isListening ? (
                            <>
                              <Mic size={15} />
                              Listening to your answer...
                            </>
                          ) : (
                            <>
                              <MessageSquareText size={15} />
                              Ready for your answer
                            </>
                          )}

                        </div>

                      </div>

                    </div>


                    {/* QUESTION */}

                    <div className="interview-question-card">

                      <div className="interview-question-label">
                        AI INTERVIEW QUESTION
                      </div>

                      <h3>
                        {
                          interviewSession
                            .questions[
                            interviewSession.currentQuestion
                          ]
                            ?.question
                        }
                      </h3>

                      <button
                        type="button"
                        className="repeat-question-button"
                        onClick={() =>
                          speakQuestion(
                            interviewSession
                              .questions[
                              interviewSession.currentQuestion
                            ]
                              ?.question
                          )
                        }
                      >
                        <Volume2 size={15} />
                        Read question again
                      </button>

                    </div>


                    {/* LISTENING */}

                    <div
                      className={`microphone-panel ${
                        isListening
                          ? "active"
                          : ""
                      }`}
                    >

                      <div className="mic-visual">

                        <div
                          className={`mic-circle ${
                            isListening
                              ? "recording"
                              : ""
                          }`}
                        >

                          {isListening ? (
                            <Mic
                              size={29}
                            />
                          ) : (
                            <Mic
                              size={29}
                            />
                          )}

                        </div>

                        {isListening && (
                          <div className="sound-bars">

                            <span />
                            <span />
                            <span />
                            <span />
                            <span />

                          </div>
                        )}

                      </div>

                      <div className="mic-status-text">

                        <strong>

                          {isListening
                            ? "Listening..."
                            : "Your turn to answer"}

                        </strong>

                        <span>

                          {isListening
                            ? "Speak naturally. Your answer is being transcribed."
                            : "Press the microphone and start speaking."}

                        </span>

                      </div>

                    </div>


                    {/* ANSWER */}

                    <div className="interview-answer-section">

                      <div className="interview-answer-title-row">

                        <label className="interview-answer-label">
                          Your Answer
                        </label>

                        <span className="speech-transcript-label">
                          {currentAnswer
                            ? "Speech transcript"
                            : "Waiting for speech..."}
                        </span>

                      </div>

                      <div
                        className={`interview-answer ${
                          isListening
                            ? "listening"
                            : ""
                        }`}
                      >
                        {currentAnswer ? (
                          currentAnswer
                        ) : (
                          <span className="answer-placeholder">
                            Your spoken answer will
                            appear here...
                          </span>
                        )}
                      </div>

                    </div>


                    {/* CONTROLS */}

                    <div className="voice-interview-controls">

                      {!isListening ? (

                        <button
                          type="button"
                          className="mic-action-button"
                          onClick={
                            startListening
                          }
                          disabled={
                            interviewLoading
                          }
                        >

                          <Mic size={19} />

                          Start Speaking

                        </button>

                      ) : (

                        <button
                          type="button"
                          className="mic-action-button stop"
                          onClick={
                            stopListening
                          }
                        >

                          <Square
                            size={17}
                            fill="currentColor"
                          />

                          Stop Listening

                        </button>
                      )}


                      <button
                        type="button"
                        onClick={
                          submitInterviewAnswer
                        }
                        disabled={
                          interviewLoading ||
                          !currentAnswer.trim()
                        }
                        className="submit-voice-answer-button"
                      >

                        {interviewLoading ? (
                          <>
                            <Loader
                              size={18}
                              className="career-spin"
                            />

                            AI Evaluating...
                          </>
                        ) : (
                          <>
                            <Sparkles
                              size={18}
                            />

                            Submit Answer
                          </>
                        )}

                      </button>

                    </div>


                    {interviewError && (

                      <div className="interview-inline-error">

                        <AlertCircle
                          size={16}
                        />

                        {interviewError}

                      </div>

                    )}


                    {/* EVALUATION */}

                    {showEvaluation &&
                      evaluation && (

                        <div className="voice-evaluation-card">

                          <div className="evaluation-heading">

                            <div className="evaluation-score-circle">

                              <Star size={18} />

                            </div>

                            <div>

                              <span>
                                Answer Score
                              </span>

                              <strong>
                                {
                                  evaluation.score
                                }
                                /10
                              </strong>

                            </div>

                          </div>


                          <div className="evaluation-block">

                            <h4>
                              AI Feedback
                            </h4>

                            <p>
                              {
                                evaluation.feedback
                              }
                            </p>

                          </div>


                          <div className="evaluation-block">

                            <h4>
                              Better Answer
                            </h4>

                            <p>
                              {
                                evaluation.betterAnswer
                              }
                            </p>

                          </div>


                          <button
                            type="button"
                            onClick={
                              nextInterviewQuestion
                            }
                            className="career-btn career-btn-primary next-question-button"
                          >

                            Next Question

                            <ChevronRight
                              size={18}
                            />

                          </button>

                        </div>
                    )}

                  </div>
                )}


              {/* =================================================
                  FINAL RESULT
              ================================================= */}

              {interviewSession &&
                interviewSession.completed && (

                  <div className="interview-complete">

                    <div className="result-hero">

                      <div className="result-trophy">
                        <Trophy size={38} />
                      </div>

                      <span className="completed-badge">
                        INTERVIEW COMPLETED
                      </span>

                      <h3>
                        Great work! 🎉
                      </h3>

                      <p>
                        You completed all{" "}
                        {
                          interviewSession.totalQuestions
                        }{" "}
                        questions.
                      </p>

                    </div>


                    {/* SCORE */}

                    <div className="final-score-card">

                      <div className="final-score-ring">

                        <div>

                          <strong>
                            {
                              interviewSession.percentage
                            }%
                          </strong>

                          <span>
                            Overall Score
                          </span>

                        </div>

                      </div>

                      <div className="final-score-summary">

                        <div className="final-score-title">
                          Interview Performance
                        </div>

                        <div className="final-score-points">
                          {
                            interviewSession.totalScore
                          }{" "}
                          /{" "}
                          {
                            interviewSession.totalQuestions *
                            10
                          }{" "}
                          points
                        </div>

                        <div className="final-score-description">

                          {
                            interviewSession.recommendation ||
                            "Keep practicing and continue improving your interview skills."
                          }

                        </div>

                      </div>

                    </div>


                    {/* OVERALL FEEDBACK */}

                    {interviewSession.overallFeedback && (

                      <div className="final-result-section">

                        <div className="result-section-heading">

                          <div className="result-icon purple-result">
                            <Brain size={18} />
                          </div>

                          <div>

                            <h4>
                              AI Interview Analysis
                            </h4>

                          </div>

                        </div>

                        <p>
                          {
                            interviewSession.overallFeedback
                          }
                        </p>

                      </div>
                    )}


                    {/* STRENGTHS */}

                    <div className="final-result-section">

                      <div className="result-section-heading">

                        <div className="result-icon green-result">
                          <ThumbsUp
                            size={18}
                          />
                        </div>

                        <h4>
                          Your Strengths
                        </h4>

                      </div>

                      <div className="result-chip-list">

                        {(
                          interviewSession.strengths ||
                          []
                        ).map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="final-result-item strength-result"
                            >
                              <CheckCircle
                                size={16}
                              />

                              {item}

                            </div>
                          )
                        )}

                      </div>

                    </div>


                    {/* IMPROVEMENT */}

                    <div className="final-result-section">

                      <div className="result-section-heading">

                        <div className="result-icon orange-result">
                          <AlertTriangle
                            size={18}
                          />
                        </div>

                        <h4>
                          Areas of Improvement
                        </h4>

                      </div>

                      <div className="result-chip-list">

                        {(
                          interviewSession
                            .areasOfImprovement ||
                          []
                        ).map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="final-result-item improvement-result"
                            >
                              <AlertTriangle
                                size={16}
                              />

                              {item}

                            </div>
                          )
                        )}

                      </div>

                    </div>


                    {/* TIPS */}

                    <div className="final-result-section">

                      <div className="result-section-heading">

                        <div className="result-icon blue-result">
                          <Lightbulb
                            size={18}
                          />
                        </div>

                        <h4>
                          Interview Tips
                        </h4>

                      </div>

                      <div className="result-chip-list">

                        {(
                          interviewSession
                            .interviewTips ||
                          []
                        ).map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="final-result-item tip-result"
                            >
                              <span className="tip-number">
                                {index + 1}
                              </span>

                              {item}

                            </div>
                          )
                        )}

                      </div>

                    </div>


                    {/* QUESTION ANALYSIS */}

                    <div className="final-result-section">

                      <div className="result-section-heading">

                        <div className="result-icon purple-result">
                          <FileText
                            size={18}
                          />
                        </div>

                        <h4>
                          Question-by-Question Analysis
                        </h4>

                      </div>

                      <div className="question-analysis-list">

                        {(
                          interviewSession.questions ||
                          []
                        ).map(
                          (
                            question,
                            index
                          ) => (

                            <div
                              key={
                                question._id ||
                                index
                              }
                              className="question-analysis-card"
                            >

                              <div className="question-analysis-top">

                                <span>
                                  Question{" "}
                                  {
                                    index + 1
                                  }
                                </span>

                                <strong>
                                  {
                                    question.score ??
                                    0
                                  }
                                  /10
                                </strong>

                              </div>

                              <h5>
                                {
                                  question.question
                                }
                              </h5>

                              <div className="analysis-answer">

                                <strong>
                                  Your answer
                                </strong>

                                <p>
                                  {
                                    question.userAnswer ||
                                    "No answer recorded."
                                  }
                                </p>

                              </div>

                              <div className="analysis-feedback">

                                <strong>
                                  AI feedback
                                </strong>

                                <p>
                                  {
                                    question.feedback ||
                                    "No feedback available."
                                  }
                                </p>

                              </div>

                              <div className="analysis-better-answer">

                                <strong>
                                  Better answer
                                </strong>

                                <p>
                                  {
                                    question.betterAnswer ||
                                    "No better-answer example available."
                                  }
                                </p>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    </div>


                    {/* CLOSE */}

                    <div className="final-result-actions">

                      <button
                        type="button"
                        onClick={
                          closeInterview
                        }
                        className="career-btn career-btn-primary"
                      >
                        Done
                      </button>

                    </div>

                  </div>
                )}

            </div>

          </div>
        )}

      </div>

    </Layout>
  );
}



const AtsScoreCard = ({ title, value }) => {
  const numericValue = Number.isFinite(Number(value))
    ? Math.round(
        Math.min(Math.max(Number(value), 0), 100)
      )
    : 0;

  return (
    <div className="ats-score-card">
      <span>{title}</span>
      <strong>{numericValue}%</strong>
      <div className="ats-score-track">
        <div
          className="ats-score-fill"
          style={{ width: `${numericValue}%` }}
        />
      </div>
    </div>
  );
};

const AtsKeywordSection = ({
  title,
  items,
  type = "matched",
}) => {
  const safeItems = Array.isArray(items)
    ? items.filter(Boolean)
    : [];

  return (
    <div className={`ats-keyword-section ${type}`}>
      <div className="ats-subheading">
        {type === "matched" ? (
          <CheckCircle size={17} />
        ) : (
          <AlertTriangle size={17} />
        )}
        {title}
      </div>

      {safeItems.length > 0 ? (
        <div className="ats-chip-list">
          {safeItems.map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="ats-empty-list">
          None identified.
        </p>
      )}
    </div>
  );
};

export default Career;