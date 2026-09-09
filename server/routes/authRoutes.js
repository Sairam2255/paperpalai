const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Register
router.post(
  "/register",
  registerUser
);

// Login
router.post(
  "/login",
  loginUser
);

// Google Login
router.post(
  "/google",
  googleLogin
);

// Forgot password
router.post(
  "/forgot-password",
  forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  resetPassword
);

// Profile
router.get(
  "/profile",
  protect,
  getProfile
);

module.exports = router;