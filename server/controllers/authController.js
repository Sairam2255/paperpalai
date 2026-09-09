const crypto = require("crypto");

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const {
  sendPasswordResetEmail,
} = require("../services/emailService");

// ==========================================
// GOOGLE CLIENT
// ==========================================
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// JWT
// ==========================================
const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Registration Error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !user.password) {
      return res.status(400).json({
        message:
          "Invalid email or password.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GOOGLE LOGIN
// ==========================================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message:
          "Google credential is required.",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error(
        "GOOGLE_CLIENT_ID missing."
      );

      return res.status(500).json({
        message:
          "Google login is not configured on the server.",
      });
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message:
          "Invalid Google credential.",
      });
    }

    const {
      sub,
      email,
      name,
      email_verified:
        emailVerified,
    } = payload;

    if (
      !sub ||
      !email ||
      !emailVerified
    ) {
      return res.status(401).json({
        message:
          "Google account verification failed.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    let user = await User.findOne({
      googleId: sub,
    });

    if (!user) {
      user = await User.findOne({
        email: normalizedEmail,
      });

      if (user) {
        user.googleId = sub;

        if (!user.name && name) {
          user.name = name;
        }

        await user.save();
      } else {
        user = await User.create({
          name:
            name?.trim() ||
            "PaperPal User",
          email: normalizedEmail,
          googleId: sub,
        });
      }
    }

    const token =
      generateToken(user._id);

    return res.status(200).json({
      message:
        "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Google Login Error:",
      error
    );

    return res.status(401).json({
      message:
        "Google sign-in failed. Please try again.",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================
const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message:
          "Email address is required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Always return the same response.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    }

    // Google-only account
    if (!user.password) {
      return res.status(200).json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    }

    const rawToken =
      crypto.randomBytes(32).toString("hex");

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    user.resetPasswordToken =
      hashedToken;

    user.resetPasswordExpires =
      new Date(
        Date.now() + 30 * 60 * 1000
      );

    await user.save();

    const clientUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5175";

    const resetUrl =
      `${clientUrl}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });

      console.log(
        `Password reset email sent to ${user.email}`
      );
    } catch (emailError) {
      console.error(
        "Password reset email failed:",
        emailError
      );

      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpires =
        undefined;

      await user.save();

      return res.status(500).json({
        message:
          "Unable to send reset email. Please check the server email configuration.",
      });
    }

    return res.status(200).json({
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================
const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      token,
      password,
    } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message:
          "Reset token and new password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user =
      await User.findOne({
        resetPasswordToken:
          hashedToken,
        resetPasswordExpires: {
          $gt: new Date(),
        },
      });

    if (!user) {
      return res.status(400).json({
        message:
          "This reset link is invalid or has expired.",
      });
    }

    user.password = password;
    user.resetPasswordToken =
      undefined;
    user.resetPasswordExpires =
      undefined;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// PROFILE
// ==========================================
const getProfile = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      message:
        "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
};