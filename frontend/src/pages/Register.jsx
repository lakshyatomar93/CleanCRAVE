import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  firebaseSetup,
  registerUser,
  resendRegistrationEmailOtp,
  verifyRegistrationEmailOtp,
} from "../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ============================================================
  // GOOGLE FIREBASE SETUP
  // ============================================================

  const firebaseProvider =
    searchParams.get("firebase");

  const isFirebaseSetup =
    firebaseProvider === "google";

  const [
    firebaseSetupToken,
    setFirebaseSetupToken,
  ] = useState(
    () =>
      localStorage.getItem(
        "firebaseSetupToken"
      ) || ""
  );

  const [
    firebaseSetupUser,
    setFirebaseSetupUser,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "firebaseSetupUser"
        );

      return saved
        ? JSON.parse(saved)
        : null;
    } catch {
      return null;
    }
  });

  // ============================================================
  // FORM DATA
  //
  // PHONE REMOVED
  // ============================================================

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      age: "",
      gender: "Male",
      height: "",
      weight: "",
      activityLevel: "Moderate",
      foodPreference: "Vegetarian",
      goal: "Maintain",
      dailyBudget: 300,
    });

  // ============================================================
  // GENERAL UI STATE
  // ============================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    focusedField,
    setFocusedField,
  ] = useState("");

  // ============================================================
  // REGISTRATION EMAIL OTP STATE
  // ============================================================

  const [
    emailOtpSent,
    setEmailOtpSent,
  ] = useState(false);

  const [
    emailOtp,
    setEmailOtp,
  ] = useState("");

  const [
    emailOtpLoading,
    setEmailOtpLoading,
  ] = useState(false);

  const [
    resendOtpLoading,
    setResendOtpLoading,
  ] = useState(false);

  // ============================================================
  // LOAD GOOGLE FIREBASE SETUP DATA
  // ============================================================

  useEffect(() => {
    if (!isFirebaseSetup) {
      return;
    }

    const token =
      localStorage.getItem(
        "firebaseSetupToken"
      );

    const savedUser =
      localStorage.getItem(
        "firebaseSetupUser"
      );

    if (!token || !savedUser) {
      setError(
        "Your Google verification session is missing or expired. Please start again from the login page."
      );

      return;
    }

    try {
      const firebaseUser =
        JSON.parse(savedUser);

      setFirebaseSetupToken(token);
      setFirebaseSetupUser(
        firebaseUser
      );

      setFormData((prev) => ({
        ...prev,

        name:
          firebaseUser.name ||
          prev.name,

        email:
          firebaseUser.email ||
          prev.email,
      }));
    } catch (error) {
      console.error(
        "Google setup data error:",
        error
      );

      setError(
        "Unable to load your verified Google account. Please start again."
      );
    }
  }, [isFirebaseSetup]);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const passwordStrength =
    useMemo(() => {
      const password =
        formData.password;

      if (!password) {
        return {
          score: 0,
          label: "",
          width: "0%",
        };
      }

      let score = 0;

      if (password.length >= 6) {
        score++;
      }

      if (password.length >= 10) {
        score++;
      }

      if (/[A-Z]/.test(password)) {
        score++;
      }

      if (/[0-9]/.test(password)) {
        score++;
      }

      if (/[^A-Za-z0-9]/.test(password)) {
        score++;
      }

      if (score <= 1) {
        return {
          score,
          label: "Weak",
          width: "25%",
        };
      }

      if (score <= 3) {
        return {
          score,
          label: "Good",
          width: "60%",
        };
      }

      return {
        score,
        label: "Strong",
        width: "100%",
      };
    }, [formData.password]);

  // ============================================================
  // FORM COMPLETION
  //
  // PHONE REMOVED FROM COMPLETION CALCULATION
  // ============================================================

  const completionFields = [
    formData.name,
    formData.email,
    formData.password,
    formData.age,
    formData.height,
    formData.weight,
    formData.dailyBudget,
  ];

  const completedFields =
    completionFields.filter(
      (field) =>
        String(field).trim() !== ""
    ).length;

  const completionPercentage =
    Math.round(
      (completedFields /
        completionFields.length) *
        100
    );

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        formData.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!formData.password) {
      return "Please create a password.";
    }

    if (
      formData.password.length < 6
    ) {
      return "Password must contain at least 6 characters.";
    }

    if (
      !formData.age ||
      Number(formData.age) < 1 ||
      Number(formData.age) > 120
    ) {
      return "Please enter a valid age between 1 and 120.";
    }

    if (
      !formData.height ||
      Number(formData.height) <= 0
    ) {
      return "Please enter a valid height.";
    }

    if (
      !formData.weight ||
      Number(formData.weight) <= 0
    ) {
      return "Please enter a valid weight.";
    }

    if (
      formData.dailyBudget ===
        "" ||
      Number(formData.dailyBudget) < 0
    ) {
      return "Please enter a valid daily food budget.";
    }

    return "";
  };

  // ============================================================
  // SAVE AUTHENTICATED USER
  // ============================================================

  const saveAuthenticatedUser =
    (data) => {
      if (!data?.token) {
        throw new Error(
          "Account was created, but the server did not return a login token."
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      localStorage.removeItem(
        "firebaseSetupToken"
      );

      localStorage.removeItem(
        "firebaseSetupUser"
      );

      if (
        data?.user?.role ===
        "admin"
      ) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    };

  // ============================================================
  // NORMAL REGISTRATION
  //
  // STEP 1:
  // Create account + send registration email OTP.
  //
  // STEP 2:
  // User enters OTP.
  //
  // STEP 3:
  // Backend verifies email and returns JWT.
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // GOOGLE SETUP SESSION VALIDATION
    // ----------------------------------------------------------

    if (isFirebaseSetup) {
      if (
        !firebaseSetupToken
      ) {
        setError(
          "Your Google verification session is missing. Please start again from the login page."
        );

        return;
      }
    }

    // ----------------------------------------------------------
    // NORMAL FORM VALIDATION
    // ----------------------------------------------------------

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    setLoading(true);

    try {
      const profileData = {
        name:
          formData.name.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,

        age:
          Number(formData.age),

        gender:
          formData.gender,

        height:
          Number(formData.height),

        weight:
          Number(formData.weight),

        activityLevel:
          formData.activityLevel,

        foodPreference:
          formData.foodPreference,

        goal:
          formData.goal,

        dailyBudget:
          Number(
            formData.dailyBudget
          ),
      };

      // --------------------------------------------------------
      // GOOGLE ACCOUNT SETUP
      //
      // Google users do not need registration email OTP because
      // Firebase has already authenticated their Google account.
      // --------------------------------------------------------

      if (isFirebaseSetup) {
        const data =
          await firebaseSetup(
            firebaseSetupToken,
            profileData
          );

        if (
          !data?.token ||
          !data?.user
        ) {
          throw new Error(
            "Google account setup was not completed. Please try again."
          );
        }

        saveAuthenticatedUser(
          data
        );

        return;
      }

      // --------------------------------------------------------
      // NORMAL EMAIL/PASSWORD REGISTRATION
      // --------------------------------------------------------

      const data =
        await registerUser(
          profileData
        );

      console.log(
        "========== REGISTRATION =========="
      );

      console.log(
        "Backend response:",
        data
      );

      console.log(
        "Requires email verification:",
        data?.requiresEmailVerification
      );

      console.log(
        "=================================="
      );

      // --------------------------------------------------------
      // REGISTRATION OTP REQUIRED
      // --------------------------------------------------------

      if (
        data?.requiresEmailVerification
      ) {
        setEmailOtpSent(
          true
        );

        setEmailOtp("");

        setSuccess(
          data.message ||
            "Registration successful. We sent a verification OTP to your email."
        );

        return;
      }

      // --------------------------------------------------------
      // FALLBACK
      //
      // In case backend ever returns a token directly.
      // --------------------------------------------------------

      if (
        data?.token &&
        data?.user
      ) {
        saveAuthenticatedUser(
          data
        );

        return;
      }

      throw new Error(
        "Account creation was not completed. Please try again."
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VERIFY REGISTRATION EMAIL OTP
  // ============================================================

  const handleVerifyEmailOtp =
    async () => {
      if (emailOtpLoading) {
        return;
      }

      setError("");
      setSuccess("");

      const cleanOtp =
        emailOtp.trim();

      if (
        !/^\d{6}$/.test(
          cleanOtp
        )
      ) {
        setError(
          "Please enter the 6-digit OTP sent to your Gmail."
        );

        return;
      }

      const email =
        formData.email
          .trim()
          .toLowerCase();

      if (!email) {
        setError(
          "Your email address is missing. Please start registration again."
        );

        return;
      }

      setEmailOtpLoading(true);

      try {
        const data =
          await verifyRegistrationEmailOtp(
            email,
            cleanOtp
          );

        console.log(
          "========== REGISTRATION EMAIL VERIFICATION =========="
        );

        console.log(
          "Backend response:",
          data
        );

        console.log(
          "Token:",
          data?.token
        );

        console.log(
          "User:",
          data?.user
        );

        console.log(
          "======================================================"
        );

        saveAuthenticatedUser(
          data
        );
      } catch (error) {
        console.error(
          "Registration email OTP error:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to verify the OTP. Please try again."
        );
      } finally {
        setEmailOtpLoading(
          false
        );
      }
    };

  // ============================================================
  // RESEND REGISTRATION EMAIL OTP
  // ============================================================

  const handleResendEmailOtp =
    async () => {
      if (
        resendOtpLoading
      ) {
        return;
      }

      setError("");
      setSuccess("");

      const email =
        formData.email
          .trim()
          .toLowerCase();

      if (!email) {
        setError(
          "Your email address is missing."
        );

        return;
      }

      setResendOtpLoading(
        true
      );

      try {
        const data =
          await resendRegistrationEmailOtp(
            email
          );

        setEmailOtp("");

        setSuccess(
          data?.message ||
            "A new verification OTP has been sent to your email."
        );
      } catch (error) {
        console.error(
          "Resend registration OTP error:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to resend the OTP. Please try again."
        );
      } finally {
        setResendOtpLoading(
          false
        );
      }
    };

  // ============================================================
  // BACK TO REGISTRATION FORM
  // ============================================================

  const handleBackToForm =
    () => {
      setEmailOtpSent(
        false
      );

      setEmailOtp("");

      setError("");

      setSuccess("");
    };

  // ============================================================
  // INPUT CLASS
  // ============================================================

  const getInputClass =
    (field) => {
      return `
        w-full rounded-2xl border bg-white px-4 py-3.5
        text-sm text-gray-900 outline-none
        transition-all duration-200
        placeholder:text-gray-400
        ${
          focusedField === field
            ? "border-green-500 ring-4 ring-green-100"
            : "border-gray-200 hover:border-gray-300"
        }
      `;
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f8f3]">

      {/* =====================================================
          BACKGROUND DECORATIONS
      ===================================================== */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-green-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="pointer-events-none absolute right-1/4 top-1/4 h-24 w-24 rounded-full bg-lime-200/20 blur-2xl" />

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_25px_80px_rgba(20,83,45,0.12)] backdrop-blur-xl lg:grid-cols-[0.8fr_1.2fr]">

          {/* =================================================
              LEFT BRAND PANEL
          ================================================= */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 text-white lg:flex lg:min-h-[820px] lg:flex-col lg:justify-between xl:p-12">

            {/* Decorative circles */}

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[45px] border-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full border-[50px] border-white/10" />

            {/* Floating food icons */}

            <div className="absolute right-10 top-24 flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
              🥗
            </div>

            <div className="absolute bottom-44 right-14 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
              🍎
            </div>

            <div className="absolute bottom-20 left-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
              💪
            </div>

            {/* Brand */}

            <div className="relative z-10">

              <div className="mb-12 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
                  🥗
                </div>

                <div>

                  <h1 className="text-2xl font-black">
                    CleanCRAVE
                  </h1>

                  <p className="text-xs text-green-100">
                    Eat smart. Stay fit.
                  </p>

                </div>

              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
                Start your journey
              </p>

              <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                Build a diet
                <br />
                that works
                <br />

                <span className="text-lime-200">
                  for you.
                </span>
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-green-50">
                Tell CleanCRAVE a little about yourself and we'll
                personalize food recommendations around your
                goals, preferences and budget.
              </p>

            </div>

            {/* Steps */}

            <div className="relative z-10 space-y-4">

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-green-700">
                  1
                </div>

                <div>

                  <p className="font-bold">
                    Tell us about yourself
                  </p>

                  <p className="mt-1 text-xs text-green-100">
                    Basic information and body measurements
                  </p>

                </div>

              </div>

              <div className="ml-5 h-6 w-px bg-white/20" />

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 font-bold text-white">
                  2
                </div>

                <div>

                  <p className="font-bold">
                    Set your preferences
                  </p>

                  <p className="mt-1 text-xs text-green-100">
                    Food choices, activity and goals
                  </p>

                </div>

              </div>

              <div className="ml-5 h-6 w-px bg-white/20" />

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 font-bold text-white">
                  3
                </div>

                <div>

                  <p className="font-bold">
                    Get personalized food
                  </p>

                  <p className="mt-1 text-xs text-green-100">
                    Recommendations made for you
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT FORM
          ================================================= */}

          <div className="p-5 sm:p-8 lg:p-10 xl:p-12">

            <div className="mx-auto w-full max-w-2xl">

              {/* =================================================
                  MOBILE LOGO
              ================================================= */}

              <div className="mb-7 text-center lg:hidden">

                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                  🥗
                </div>

                <h1 className="text-3xl font-black text-green-700">
                  CleanCRAVE
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Eat smart. Stay fit.
                </p>

              </div>

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-7">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                  {emailOtpSent
                    ? "Verify your email"
                    : "Personalize your experience"}

                </div>

                <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">

                  {emailOtpSent
                    ? "Check your email"
                    : "Create your account"}

                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">

                  {emailOtpSent
                    ? "Enter the verification code we sent to your email address."
                    : "Let's create a CleanCRAVE profile that fits your lifestyle."}

                </p>

              </div>

              {/* =================================================
                  PROGRESS
              ================================================= */}

              {!emailOtpSent && (
                <div className="mb-7 rounded-2xl border border-gray-100 bg-gray-50 p-4">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-xs font-semibold text-gray-600">
                      Profile completion
                    </span>

                    <span className="text-xs font-bold text-green-600">
                      {completionPercentage}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-green-600 transition-all duration-500"
                      style={{
                        width: `${completionPercentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-xs text-gray-400">

                    {completionPercentage ===
                    100
                      ? "You're all set! 🎉"
                      : "Complete your details to get personalized recommendations."}

                  </p>

                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100">

                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                      />

                    </svg>

                  </div>

                  <span className="flex-1 pt-1">
                    {error}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
                    aria-label="Dismiss error"
                  >

                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        strokeLinecap="round"
                        strokeWidth="2"
                        d="M6 18 18 6M6 6l12 12"
                      />

                    </svg>

                  </button>

                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    ✓
                  </div>

                  <span className="pt-1">
                    {success}
                  </span>

                </div>
              )}

              {/* =================================================
                  EMAIL VERIFICATION OTP SCREEN
              ================================================= */}

              {emailOtpSent ? (
                <div className="space-y-6">

                  {/* OTP INFORMATION */}

                  <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                        ✉️
                      </div>

                      <div>

                        <p className="text-sm font-bold text-green-800">
                          Verification code sent
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-700">
                          We sent a 6-digit OTP to
                          {" "}
                          <span className="font-bold">
                            {formData.email
                              .trim()
                              .toLowerCase()}
                          </span>
                          .
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* OTP INPUT */}

                  <div>

                    <label
                      htmlFor="registration-email-otp"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email verification code
                    </label>

                    <input
                      id="registration-email-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => {
                        const value =
                          e.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              6
                            );

                        setEmailOtp(
                          value
                        );

                        setError("");
                        setSuccess("");
                      }}
                      placeholder="Enter 6-digit OTP"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                  </div>

                  {/* VERIFY BUTTON */}

                  <button
                    type="button"
                    onClick={
                      handleVerifyEmailOtp
                    }
                    disabled={
                      emailOtpLoading
                    }
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >

                    {emailOtpLoading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >

                          <circle
                            className="opacity-30"
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                          />

                          <path
                            d="M21 12a9 9 0 0 1-9 9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                        </svg>

                        <span>
                          Verifying email...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Verify Email & Create Account
                        </span>

                        <svg
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h14m-6-6 6 6-6 6"
                          />

                        </svg>

                      </>
                    )}

                  </button>

                  {/* RESEND */}

                  <button
                    type="button"
                    onClick={
                      handleResendEmailOtp
                    }
                    disabled={
                      resendOtpLoading ||
                      emailOtpLoading
                    }
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-600 transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {resendOtpLoading
                      ? "Sending new OTP..."
                      : "Didn't receive the code? Resend OTP"}

                  </button>

                  {/* BACK */}

                  <button
                    type="button"
                    onClick={
                      handleBackToForm
                    }
                    disabled={
                      emailOtpLoading ||
                      resendOtpLoading
                    }
                    className="w-full rounded-2xl px-5 py-3 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ← Back to registration
                  </button>

                </div>
              ) : (
                /* =================================================
                   REGISTRATION FORM
                ================================================= */

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-8"
                >

                  {/* =================================================
                      SECTION 1 - BASIC INFORMATION
                  ================================================= */}

                  <section>

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-lg">
                        👤
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-900">
                          Basic information
                        </h3>

                        <p className="text-xs text-gray-500">
                          Tell us who you are
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      {/* NAME */}

                      <div>

                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Full name
                        </label>

                        <input
                          id="name"
                          name="name"
                          value={
                            formData.name
                          }
                          onChange={
                            handleChange
                          }
                          onFocus={() =>
                            setFocusedField(
                              "name"
                            )
                          }
                          onBlur={() =>
                            setFocusedField(
                              ""
                            )
                          }
                          autoComplete="name"
                          required
                          className={getInputClass(
                            "name"
                          )}
                          placeholder="Your name"
                        />

                      </div>

                      {/* EMAIL */}

                      <div>

                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Email address
                        </label>

                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={
                            formData.email
                          }
                          onChange={
                            handleChange
                          }
                          onFocus={() =>
                            setFocusedField(
                              "email"
                            )
                          }
                          onBlur={() =>
                            setFocusedField(
                              ""
                            )
                          }
                          autoComplete="email"
                          required
                          readOnly={
                            isFirebaseSetup
                          }
                          className={getInputClass(
                            "email"
                          )}
                          placeholder="you@example.com"
                        />

                      </div>

                      {/* PASSWORD */}

                      <div className="sm:col-span-2">

                        <label
                          htmlFor="password"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Create password
                        </label>

                        <div
                          className={`flex items-center rounded-2xl border bg-white transition-all duration-200 ${
                            focusedField ===
                            "password"
                              ? "border-green-500 ring-4 ring-green-100"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >

                          <input
                            id="password"
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            name="password"
                            value={
                              formData.password
                            }
                            onChange={
                              handleChange
                            }
                            onFocus={() =>
                              setFocusedField(
                                "password"
                              )
                            }
                            onBlur={() =>
                              setFocusedField(
                                ""
                              )
                            }
                            autoComplete="new-password"
                            required
                            className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                            placeholder="Create a secure password"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (prev) =>
                                  !prev
                              )
                            }
                            className="mr-2 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPassword
                              ? "🙈"
                              : "👁️"}
                          </button>

                        </div>

                        {formData.password && (
                          <div className="mt-3">

                            <div className="mb-1 flex items-center justify-between">

                              <span className="text-xs text-gray-400">
                                Password strength
                              </span>

                              <span className="text-xs font-semibold text-gray-600">
                                {
                                  passwordStrength.label
                                }
                              </span>

                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">

                              <div
                                className="h-full rounded-full bg-green-500 transition-all duration-500"
                                style={{
                                  width:
                                    passwordStrength.width,
                                }}
                              />

                            </div>

                          </div>
                        )}

                      </div>

                      {/* AGE */}

                      <div>

                        <label
                          htmlFor="age"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Age
                        </label>

                        <input
                          id="age"
                          type="number"
                          name="age"
                          min="1"
                          max="120"
                          value={
                            formData.age
                          }
                          onChange={
                            handleChange
                          }
                          onFocus={() =>
                            setFocusedField(
                              "age"
                            )
                          }
                          onBlur={() =>
                            setFocusedField(
                              ""
                            )
                          }
                          required
                          className={getInputClass(
                            "age"
                          )}
                          placeholder="e.g. 21"
                        />

                      </div>

                      {/* GENDER */}

                      <div>

                        <label
                          htmlFor="gender"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Gender
                        </label>

                        <select
                          id="gender"
                          name="gender"
                          value={
                            formData.gender
                          }
                          onChange={
                            handleChange
                          }
                          className={getInputClass(
                            "gender"
                          )}
                        >

                          <option>
                            Male
                          </option>

                          <option>
                            Female
                          </option>

                          <option>
                            Other
                          </option>

                        </select>

                      </div>

                    </div>

                  </section>

                  {/* =================================================
                      SECTION 2 - BODY
                  ================================================= */}

                  <section>

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                        📏
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-900">
                          Body information
                        </h3>

                        <p className="text-xs text-gray-500">
                          Used to estimate your nutrition needs
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      {/* HEIGHT */}

                      <div>

                        <label
                          htmlFor="height"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Height
                        </label>

                        <div className="relative">

                          <input
                            id="height"
                            type="number"
                            name="height"
                            min="1"
                            value={
                              formData.height
                            }
                            onChange={
                              handleChange
                            }
                            onFocus={() =>
                              setFocusedField(
                                "height"
                              )
                            }
                            onBlur={() =>
                              setFocusedField(
                                ""
                              )
                            }
                            required
                            className={`${getInputClass(
                              "height"
                            )} pr-14`}
                            placeholder="170"
                          />

                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                            cm
                          </span>

                        </div>

                      </div>

                      {/* WEIGHT */}

                      <div>

                        <label
                          htmlFor="weight"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Weight
                        </label>

                        <div className="relative">

                          <input
                            id="weight"
                            type="number"
                            name="weight"
                            min="1"
                            step="0.1"
                            value={
                              formData.weight
                            }
                            onChange={
                              handleChange
                            }
                            onFocus={() =>
                              setFocusedField(
                                "weight"
                              )
                            }
                            onBlur={() =>
                              setFocusedField(
                                ""
                              )
                            }
                            required
                            className={`${getInputClass(
                              "weight"
                            )} pr-14`}
                            placeholder="65"
                          />

                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                            kg
                          </span>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* =================================================
                      SECTION 3 - ACTIVITY
                  ================================================= */}

                  <section>

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
                        🏃
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-900">
                          Activity level
                        </h3>

                        <p className="text-xs text-gray-500">
                          How active are you on a typical day?
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">

                      {[
                        {
                          value:
                            "Sedentary",
                          icon:
                            "🪑",
                          short:
                            "Sedentary",
                        },
                        {
                          value:
                            "Light",
                          icon:
                            "🚶",
                          short:
                            "Light",
                        },
                        {
                          value:
                            "Moderate",
                          icon:
                            "🏃",
                          short:
                            "Moderate",
                        },
                        {
                          value:
                            "Active",
                          icon:
                            "🏋️",
                          short:
                            "Active",
                        },
                        {
                          value:
                            "Very Active",
                          icon:
                            "🔥",
                          short:
                            "Very Active",
                        },
                      ].map(
                        (item) => {
                          const selected =
                            formData.activityLevel ===
                            item.value;

                          return (
                            <button
                              key={
                                item.value
                              }
                              type="button"
                              onClick={() =>
                                setFormData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    activityLevel:
                                      item.value,
                                  })
                                )
                              }
                              className={`rounded-2xl border p-3 text-center transition-all duration-200 ${
                                selected
                                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                                  : "border-gray-200 bg-white text-gray-600 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50/50"
                              }`}
                            >

                              <div className="text-xl">
                                {
                                  item.icon
                                }
                              </div>

                              <p className="mt-1 text-xs font-semibold">
                                {
                                  item.short
                                }
                              </p>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </section>

                  {/* =================================================
                      SECTION 4 - FOOD PREFERENCE
                  ================================================= */}

                  <section>

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg">
                        🥗
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-900">
                          Food preference
                        </h3>

                        <p className="text-xs text-gray-500">
                          We'll prioritize foods you enjoy
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                      {[
                        {
                          value:
                            "Vegetarian",
                          icon:
                            "🥬",
                        },
                        {
                          value:
                            "Non-Vegetarian",
                          icon:
                            "🍗",
                        },
                        {
                          value:
                            "Vegan",
                          icon:
                            "🌱",
                        },
                        {
                          value:
                            "Eggitarian",
                          icon:
                            "🥚",
                        },
                      ].map(
                        (item) => {
                          const selected =
                            formData.foodPreference ===
                            item.value;

                          return (
                            <button
                              key={
                                item.value
                              }
                              type="button"
                              onClick={() =>
                                setFormData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    foodPreference:
                                      item.value,
                                  })
                                )
                              }
                              className={`rounded-2xl border p-4 transition-all duration-200 ${
                                selected
                                  ? "border-green-500 bg-green-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50/50"
                              }`}
                            >

                              <div className="text-2xl">
                                {
                                  item.icon
                                }
                              </div>

                              <p
                                className={`mt-2 text-xs font-semibold ${
                                  selected
                                    ? "text-green-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {
                                  item.value
                                }
                              </p>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </section>

                  {/* =================================================
                      SECTION 5 - GOAL
                  ================================================= */}

                  <section>

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
                        🎯
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-900">
                          Your goal
                        </h3>

                        <p className="text-xs text-gray-500">
                          What would you like to achieve?
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      {[
                        {
                          value:
                            "Lose",
                          icon:
                            "🔥",
                          title:
                            "Lose weight",
                          description:
                            "A calorie-conscious plan",
                        },
                        {
                          value:
                            "Maintain",
                          icon:
                            "⚖️",
                          title:
                            "Maintain weight",
                          description:
                            "Keep your current balance",
                        },
                        {
                          value:
                            "Gain",
                          icon:
                            "📈",
                          title:
                            "Gain weight",
                          description:
                            "Increase calories gradually",
                        },
                        {
                          value:
                            "Muscle Gain",
                          icon:
                            "💪",
                          title:
                            "Build muscle",
                          description:
                            "Protein-focused nutrition",
                        },
                      ].map(
                        (item) => {
                          const selected =
                            formData.goal ===
                            item.value;

                          return (
                            <button
                              key={
                                item.value
                              }
                              type="button"
                              onClick={() =>
                                setFormData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    goal: item.value,
                                  })
                                )
                              }
                              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                                selected
                                  ? "border-green-500 bg-green-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-green-200"
                              }`}
                            >

                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                                  selected
                                    ? "bg-white"
                                    : "bg-gray-50"
                                }`}
                              >
                                {
                                  item.icon
                                }
                              </div>

                              <div className="min-w-0 flex-1">

                                <p
                                  className={`text-sm font-bold ${
                                    selected
                                      ? "text-green-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {
                                    item.title
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {
                                    item.description
                                  }
                                </p>

                              </div>

                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-gray-300"
                                }`}
                              >

                                {selected && (
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >

                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="3"
                                      d="m5 12 4 4L19 7"
                                    />

                                  </svg>
                                )}

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </section>

                  {/* =================================================
                      SECTION 6 - BUDGET
                  ================================================= */}

                  <section>

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-lg">
                        💰
                      </div>

                      <div>

                        <h3 className="font-bold text-gray-900">
                          Daily food budget
                        </h3>

                        <p className="text-xs text-gray-500">
                          We'll keep recommendations within your budget
                        </p>

                      </div>

                    </div>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-600">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="dailyBudget"
                        min="0"
                        value={
                          formData.dailyBudget
                        }
                        onChange={
                          handleChange
                        }
                        onFocus={() =>
                          setFocusedField(
                            "dailyBudget"
                          )
                        }
                        onBlur={() =>
                          setFocusedField(
                            ""
                          )
                        }
                        required
                        className={`${getInputClass(
                          "dailyBudget"
                        )} pl-9 pr-16`}
                        placeholder="300"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                        / day
                      </span>

                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">

                      {[150, 200, 300, 500, 750].map(
                        (amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() =>
                              setFormData(
                                (
                                  prev
                                ) => ({
                                  ...prev,
                                  dailyBudget:
                                    amount,
                                })
                              )
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              Number(
                                formData.dailyBudget
                              ) ===
                              amount
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:text-green-600"
                            }`}
                          >
                            ₹{amount}
                          </button>
                        )
                      )}

                    </div>

                  </section>

                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <div className="border-t border-gray-100 pt-7">

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                    >

                      {!loading && (
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      )}

                      {loading ? (
                        <>
                          <svg
                            className="h-5 w-5 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >

                            <circle
                              className="opacity-30"
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="3"
                            />

                            <path
                              d="M21 12a9 9 0 0 1-9 9"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />

                          </svg>

                          <span>
                            Creating your CleanCRAVE profile...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {isFirebaseSetup
                              ? "Complete my CleanCRAVE account"
                              : "Create my CleanCRAVE account"}
                          </span>

                          <svg
                            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 12h14m-6-6 6 6-6 6"
                            />

                          </svg>

                        </>
                      )}

                    </button>

                  </div>

                </form>
              )}

              {/* =================================================
                  LOGIN LINK
              ================================================= */}

              {!emailOtpSent && (
                <div className="mt-7 text-center">

                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}

                    <Link
                      to="/login"
                      className="font-bold text-green-600 transition hover:text-green-700 hover:underline"
                    >
                      Login
                    </Link>

                  </p>

                </div>
              )}

              {/* =================================================
                  FOOTER
              ================================================= */}

              <p className="mt-5 text-center text-xs leading-5 text-gray-400">
                Your information helps CleanCRAVE personalize your
                nutrition recommendations.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;