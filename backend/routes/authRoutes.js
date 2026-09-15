const express = require("express");

const {
  registerUser,
  verifyRegistrationEmail,
  resendRegistrationOtp,

  loginUser,
  verifyAdminLoginOtp,
  resendAdminLoginOtp,

  firebaseAuth,
  firebaseSetup,

  forgotPassword,
  resetPassword,

  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// REGISTER
// ============================================================

router.post(
  "/register",
  registerUser
);

router.post(
  "/register/verify-email",
  verifyRegistrationEmail
);

router.post(
  "/register/resend-email",
  resendRegistrationOtp
);

// ============================================================
// LOGIN
// ============================================================

router.post(
  "/login",
  loginUser
);

// Admin email OTP verification
router.post(
  "/login/admin/verify-email",
  verifyAdminLoginOtp
);

// Resend admin login OTP
router.post(
  "/login/admin/resend-email",
  resendAdminLoginOtp
);

// ============================================================
// FIREBASE / GOOGLE
// ============================================================

router.post(
  "/firebase",
  firebaseAuth
);

router.post(
  "/firebase/setup",
  firebaseSetup
);

// ============================================================
// FORGOT / RESET PASSWORD
// ============================================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

// ============================================================
// PROFILE
// ============================================================

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

module.exports = router;