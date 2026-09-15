const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC ACCOUNT INFORMATION
    // ============================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ============================================================
    // FIREBASE
    // ============================================================

    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: [
        "password",
        "google",
        "phone",
        "google-password",
        "phone-password",
      ],
      default: "password",
    },

    // ============================================================
    // VERIFICATION STATUS
    // ============================================================

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // EMAIL OTP
    // Used during registration and email login
    // ============================================================

    emailOtp: {
      type: String,
      default: "",
    },

    emailOtpExpires: {
      type: Date,
      default: null,
    },

    emailOtpAttempts: {
      type: Number,
      default: 0,
    },

    // ============================================================
    // PASSWORD RESET OTP
    // ============================================================

    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpires: {
      type: Date,
      default: null,
    },

    resetOtpAttempts: {
      type: Number,
      default: 0,
    },

    // ============================================================
    // ROLE
    // ============================================================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ============================================================
    // FOODFIT PROFILE
    // ============================================================

    age: {
      type: Number,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    height: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    activityLevel: {
      type: String,
      enum: [
        "Sedentary",
        "Light",
        "Moderate",
        "Active",
        "Very Active",
      ],
    },

    foodPreference: {
      type: String,
      enum: [
        "Vegetarian",
        "Non-Vegetarian",
        "Vegan",
        "Eggitarian",
      ],
    },

    goal: {
      type: String,
      enum: [
        "Lose",
        "Maintain",
        "Gain",
        "Muscle Gain",
      ],
    },

    dailyBudget: {
      type: Number,
      default: 300,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);