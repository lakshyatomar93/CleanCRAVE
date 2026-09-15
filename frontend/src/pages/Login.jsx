import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

import {
  firebaseAuth,
  loginUser,
  verifyAdminLoginOtp,
  resendAdminLoginOtp,
} from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // ============================================================
  // ADMIN OTP STATE
  // ============================================================

  const [adminOtpMode, setAdminOtpMode] = useState(false);
  const [adminOtp, setAdminOtp] = useState("");
  const [adminLoginEmail, setAdminLoginEmail] = useState("");

  const [adminOtpLoading, setAdminOtpLoading] = useState(false);
  const [adminOtpResending, setAdminOtpResending] =
    useState(false);

  // ============================================================
  // UI STATE
  // ============================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  // ============================================================
  // FIREBASE ERROR HANDLER
  // ============================================================

  const getFirebaseErrorMessage = (error) => {
    const code = error?.code || "";

    switch (code) {
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";

      case "auth/popup-blocked":
        return "Your browser blocked the Google login popup. Please allow popups for this site.";

      case "auth/operation-not-allowed":
        return "Google sign-in is not enabled in Firebase Authentication. Please enable Google Authentication in your Firebase Console.";

      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase. Add localhost to Firebase Authentication → Settings → Authorized domains.";

      case "auth/invalid-oauth-client-id":
        return "Google OAuth configuration is incorrect. Please check your Firebase Google provider configuration.";

      case "auth/configuration-not-found":
        return "Firebase Authentication configuration was not found. Please check your Firebase configuration.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait a while and try again.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using another sign-in method.";

      default:
        return (
          error?.message ||
          "Google authentication failed. Please try again."
        );
    }
  };

  // ============================================================
  // SAVE AUTHENTICATED USER
  // ============================================================

  const saveAuthenticatedUser = (data) => {
    if (!data?.token) {
      throw new Error(
        "Authentication succeeded, but CleanCRAVE server did not return a login token."
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

    // ----------------------------------------------------------
    // ADMIN / USER ROUTING
    // ----------------------------------------------------------

    if (data?.user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

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
  // NORMAL EMAIL + PASSWORD LOGIN
  //
  // NORMAL USER:
  // Email + password -> Login
  //
  // ADMIN:
  // Email + password -> OTP
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------------------------

    if (!formData.email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    // ----------------------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------------------

    if (!formData.password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({
        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,
      });

      console.log(
        "========== EMAIL LOGIN =========="
      );

      console.log(
        "Backend response:",
        data
      );

      console.log(
        "================================="
      );

      // --------------------------------------------------------
      // ADMIN LOGIN
      //
      // Backend sends OTP instead of token.
      // --------------------------------------------------------

      if (
        data?.requiresAdminEmailOtp
      ) {
        setAdminLoginEmail(
          data.email ||
            formData.email
              .trim()
              .toLowerCase()
        );

        setAdminOtpMode(true);

        setAdminOtp("");

        setSuccess(
          data.message ||
            "A verification OTP has been sent to your admin email."
        );

        return;
      }

      // --------------------------------------------------------
      // NORMAL USER EMAIL NOT VERIFIED
      // --------------------------------------------------------

      if (
        data?.requiresEmailVerification
      ) {
        setError(
          data.message ||
            "Please verify your email before logging in."
        );

        return;
      }

      // --------------------------------------------------------
      // NORMAL USER DIRECT LOGIN
      // --------------------------------------------------------

      saveAuthenticatedUser(data);
    } catch (error) {
      console.error(
        "Email login error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADMIN OTP VERIFICATION
  // ============================================================

  const handleAdminOtpVerification = async (
    e
  ) => {
    e.preventDefault();

    if (adminOtpLoading) return;

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // OTP VALIDATION
    // ----------------------------------------------------------

    if (!adminOtp.trim()) {
      setError(
        "Please enter the verification OTP."
      );
      return;
    }

    if (!/^\d{6}$/.test(adminOtp.trim())) {
      setError(
        "Please enter the 6-digit OTP sent to your email."
      );
      return;
    }

    setAdminOtpLoading(true);

    try {
      const data =
        await verifyAdminLoginOtp(
          adminLoginEmail,
          adminOtp.trim()
        );

      console.log(
        "========== ADMIN OTP VERIFIED =========="
      );

      console.log(
        "Admin verification response:",
        data
      );

      console.log(
        "========================================"
      );

      // --------------------------------------------------------
      // SAVE ADMIN AUTHENTICATION
      // --------------------------------------------------------

      saveAuthenticatedUser(data);
    } catch (error) {
      console.error(
        "Admin OTP verification error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setAdminOtpLoading(false);
    }
  };

  // ============================================================
  // RESEND ADMIN OTP
  // ============================================================

  const handleResendAdminOtp = async () => {
    if (adminOtpResending) return;

    setError("");
    setSuccess("");

    try {
      setAdminOtpResending(true);

      const data =
        await resendAdminLoginOtp(
          adminLoginEmail
        );

      setAdminOtp("");

      setSuccess(
        data.message ||
          "A new verification OTP has been sent to your email."
      );
    } catch (error) {
      console.error(
        "Admin OTP resend error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resend OTP."
      );
    } finally {
      setAdminOtpResending(false);
    }
  };

  // ============================================================
  // BACK TO LOGIN FROM ADMIN OTP
  // ============================================================

  const handleBackToLogin = () => {
    setAdminOtpMode(false);
    setAdminOtp("");
    setAdminLoginEmail("");
    setError("");
    setSuccess("");
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    if (googleLoading) return;

    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log(
        "Starting Google Firebase login..."
      );

      // --------------------------------------------------------
      // FIREBASE GOOGLE POPUP
      // --------------------------------------------------------

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      console.log(
        "========== GOOGLE FIREBASE DEBUG =========="
      );

      console.log(
        "Firebase user:",
        result?.user
      );

      console.log(
        "Firebase UID:",
        result?.user?.uid
      );

      console.log(
        "Firebase email:",
        result?.user?.email
      );

      console.log(
        "Firebase display name:",
        result?.user?.displayName
      );

      console.log(
        "==========================================="
      );

      // --------------------------------------------------------
      // GET FIREBASE ID TOKEN
      // --------------------------------------------------------

      const firebaseToken =
        await result.user.getIdToken();

      console.log(
        "Firebase ID token received."
      );

      // --------------------------------------------------------
      // SEND FIREBASE TOKEN TO BACKEND
      // --------------------------------------------------------

      const data =
        await firebaseAuth(
          firebaseToken,
          {
            name:
              result.user.displayName ||
              "",

            email:
              result.user.email ||
              "",

            firebaseUid:
              result.user.uid,

            authProvider:
              "google",
          }
        );

      console.log(
        "========== CLEANCRAVE GOOGLE LOGIN =========="
      );

      console.log(
        "Backend response:",
        data
      );

      console.log(
        "CleanCRAVE token:",
        data?.token
      );

      console.log(
        "CleanCRAVE user:",
        data?.user
      );

      console.log(
        "============================================="
      );

      // --------------------------------------------------------
      // NEW GOOGLE USER
      //
      // New Google users need to complete their nutrition
      // profile before the account is created.
      // --------------------------------------------------------

      if (
        data?.isNewUser ||
        data?.requiresSetup
      ) {
        localStorage.setItem(
          "firebaseSetupToken",
          firebaseToken
        );

        localStorage.setItem(
          "firebaseSetupUser",
          JSON.stringify({
            name:
              result.user.displayName ||
              "",

            email:
              result.user.email ||
              "",

            firebaseUid:
              result.user.uid,

            authProvider:
              "google",
          })
        );

        navigate(
          "/register?firebase=google"
        );

        return;
      }

      // --------------------------------------------------------
      // EXISTING GOOGLE USER
      // --------------------------------------------------------

      saveAuthenticatedUser(data);
    } catch (error) {
      console.error(
        "========== GOOGLE LOGIN ERROR =========="
      );

      console.error(
        "Firebase error code:",
        error?.code
      );

      console.error(
        "Firebase error message:",
        error?.message
      );

      console.error(
        "Complete error:",
        error
      );

      console.error(
        "========================================="
      );

      const firebaseMessage =
        getFirebaseErrorMessage(
          error
        );

      setError(
        `${error?.code || "firebase-error"}: ${firebaseMessage}`
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f8f3]">

      {/* =====================================================
          BACKGROUND DECORATIONS
      ===================================================== */}

      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="pointer-events-none absolute right-[35%] top-[10%] h-20 w-20 rounded-full bg-lime-200/30 blur-2xl" />

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_25px_80px_rgba(20,83,45,0.12)] backdrop-blur-xl lg:grid-cols-2">

          {/* =================================================
              LEFT - BRAND SECTION
          ================================================= */}

          <div className="relative hidden min-h-[760px] overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

            {/* Decorative circles */}

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[50px] border-white/10" />

            <div className="absolute right-20 top-1/2 h-16 w-16 rounded-full bg-white/10 blur-sm" />

            {/* Floating icons */}

            <div className="absolute right-12 top-28 flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
              🥗
            </div>

            <div
              className="absolute bottom-32 left-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur"
              style={{
                animationDelay:
                  "0.5s",
              }}
            >
              🍎
            </div>

            <div className="absolute bottom-20 right-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
              💪
            </div>

            {/* Brand */}

            <div className="relative z-10">

              <div className="mb-8 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
                  🥗
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight">
                    CleanCRAVE
                  </h1>

                  <p className="text-xs font-medium text-green-100">
                    Eat smart. Stay fit.
                  </p>
                </div>

              </div>

              <div className="max-w-md">

                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
                  Welcome back
                </p>

                <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                  Your food.
                  <br />
                  Your goals.
                  <br />

                  <span className="text-lime-200">
                    Your way.
                  </span>
                </h2>

                <p className="mt-6 max-w-sm text-base leading-7 text-green-50">
                  Get personalized food recommendations based on
                  your nutrition goals, preferences and budget.
                </p>

              </div>

            </div>

            {/* Benefits */}

            <div className="relative z-10 space-y-3">

              {[
                {
                  icon: "🎯",
                  title:
                    "Personalized recommendations",
                },

                {
                  icon: "🥑",
                  title:
                    "Track your nutrition",
                },

                {
                  icon: "💰",
                  title:
                    "Stay within your budget",
                },

                {
                  icon: "🔐",
                  title:
                    "Secure Google login",
                },

              ].map(
                (item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm transition duration-300 hover:translate-x-1 hover:bg-white/15"
                  >

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg">
                      {item.icon}
                    </span>

                    <span className="text-sm font-medium text-white">
                      {item.title}
                    </span>

                    <svg
                      className="ml-auto h-4 w-4 text-green-100"
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

                  </div>
                )
              )}

            </div>

          </div>

          {/* =================================================
              RIGHT - LOGIN FORM
          ================================================= */}

          <div className="flex min-h-[760px] items-center justify-center p-5 sm:p-8 lg:p-10 xl:p-14">

            <div className="w-full max-w-md">

              {/* =================================================
                  MOBILE LOGO
              ================================================= */}

              <div className="mb-8 text-center lg:hidden">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl shadow-sm">
                  🥗
                </div>

                <h1 className="text-3xl font-black tracking-tight text-green-700">
                  CleanCRAVE
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Eat smart. Stay fit.
                </p>

              </div>

              {/* =================================================
                  ADMIN OTP SCREEN
              ================================================= */}

              {adminOtpMode ? (
                <div>

                  {/* OTP ICON */}

                  <div className="mb-6 flex justify-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-4xl shadow-sm">
                      🔐
                    </div>

                  </div>

                  {/* OTP HEADING */}

                  <div className="mb-7 text-center">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                      Admin verification

                    </div>

                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                      Verify your email
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      We sent a 6-digit verification code to
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-green-700">
                      {adminLoginEmail}
                    </p>

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div
                      className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                      role="alert"
                    >

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100">
                        !
                      </div>

                      <div className="flex-1 break-words pt-1">
                        {error}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setError("")
                        }
                        className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                        aria-label="Dismiss error"
                      >
                        ×
                      </button>

                    </div>
                  )}

                  {/* SUCCESS */}

                  {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        ✓
                      </div>

                      <div className="pt-1">
                        {success}
                      </div>

                    </div>
                  )}

                  {/* OTP FORM */}

                  <form
                    onSubmit={
                      handleAdminOtpVerification
                    }
                    className="space-y-5"
                  >

                    <div>

                      <label
                        htmlFor="adminOtp"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Verification code
                      </label>

                      <input
                        id="adminOtp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={adminOtp}
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

                          setAdminOtp(
                            value
                          );

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-center text-xl font-bold tracking-[0.45em] text-gray-900 outline-none transition-all duration-200 placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      />

                      <p className="mt-2 text-center text-xs text-gray-400">
                        The OTP is valid for 10 minutes.
                      </p>

                    </div>

                    {/* VERIFY BUTTON */}

                    <button
                      type="submit"
                      disabled={
                        adminOtpLoading ||
                        adminOtp.length !== 6
                      }
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >

                      {adminOtpLoading ? (
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
                            Verifying...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            Verify & Login
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

                  </form>

                  {/* RESEND / BACK */}

                  <div className="mt-6 space-y-3 text-center">

                    <button
                      type="button"
                      onClick={
                        handleResendAdminOtp
                      }
                      disabled={
                        adminOtpResending
                      }
                      className="text-sm font-bold text-green-600 transition hover:text-green-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {adminOtpResending
                        ? "Sending new OTP..."
                        : "Didn't receive the code? Resend OTP"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleBackToLogin
                      }
                      className="block w-full text-sm font-semibold text-gray-500 transition hover:text-gray-700"
                    >
                      ← Back to login
                    </button>

                  </div>

                  {/* SECURITY NOTICE */}

                  <div className="mt-7 rounded-2xl border border-green-100 bg-green-50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                        🛡️
                      </div>

                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Secure admin access
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-700">
                          Your admin account requires email
                          verification before access is granted.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <>
                  {/* =================================================
                      HEADING
                  ================================================= */}

                  <div className="mb-7">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                      Healthy choices start here

                    </div>

                    <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                      Welcome back! 👋
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                      Sign in to continue your CleanCRAVE journey.
                    </p>

                  </div>

                  {/* =================================================
                      ERROR MESSAGE
                  ================================================= */}

                  {error && (
                    <div
                      className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                      role="alert"
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

                      <div className="flex-1 break-words pt-1">
                        {error}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setError("")
                        }
                        className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
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
                      SUCCESS MESSAGE
                  ================================================= */}

                  {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        ✓
                      </div>

                      <div className="pt-1">
                        {success}
                      </div>

                    </div>
                  )}

                  {/* =================================================
                      GOOGLE LOGIN
                  ================================================= */}

                  <button
                    type="button"
                    onClick={
                      handleGoogleLogin
                    }
                    disabled={
                      googleLoading ||
                      loading
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {googleLoading ? (
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
                          Connecting to Google...
                        </span>
                      </>
                    ) : (
                      <>
                        {/* Google icon */}

                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                        >

                          <path
                            fill="#4285F4"
                            d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
                          />

                          <path
                            fill="#34A853"
                            d="M12 21.99c2.63 0 4.84-.87 6.45-2.37l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.99Z"
                          />

                          <path
                            fill="#FBBC05"
                            d="M6.54 14.09a5.86 5.86 0 0 1 0-4.18V7.41H3.3a9.76 9.76 0 0 0 0 9.18l3.24-2.5Z"
                          />

                          <path
                            fill="#EA4335"
                            d="M12 5.88c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 2.99 14.63 2.01 12 2.01a9.74 9.74 0 0 0-8.7 5.4l3.24 2.5C7.31 7.6 9.46 5.88 12 5.88Z"
                          />

                        </svg>

                        <span>
                          Continue with Google
                        </span>
                      </>
                    )}

                  </button>

                  {/* =================================================
                      DIVIDER
                  ================================================= */}

                  <div className="my-6 flex items-center gap-4">

                    <div className="h-px flex-1 bg-gray-200" />

                    <span className="text-xs font-medium text-gray-400">
                      OR
                    </span>

                    <div className="h-px flex-1 bg-gray-200" />

                  </div>

                  {/* =================================================
                      EMAIL + PASSWORD FORM
                  ================================================= */}

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="space-y-5"
                  >

                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div>

                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Email address
                      </label>

                      <div
                        className={`group flex items-center rounded-2xl border bg-white transition-all duration-200 ${
                          focusedField ===
                          "email"
                            ? "border-green-500 ring-4 ring-green-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >

                        <div
                          className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            focusedField ===
                            "email"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-50 text-gray-400"
                          }`}
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeWidth="1.8"
                              d="m4 7 7.2 5.1a1.4 1.4 0 0 0 1.6 0L20 7"
                            />

                          </svg>

                        </div>

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
                          placeholder="you@example.com"
                          className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        />

                      </div>

                    </div>

                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label
                          htmlFor="password"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Password
                        </label>

                        <Link
                          to="/forgot-password"
                          className="text-xs font-semibold text-green-600 transition hover:text-green-700 hover:underline"
                        >
                          Forgot password?
                        </Link>

                      </div>

                      <div
                        className={`group flex items-center rounded-2xl border bg-white transition-all duration-200 ${
                          focusedField ===
                          "password"
                            ? "border-green-500 ring-4 ring-green-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >

                        <div
                          className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            focusedField ===
                            "password"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-50 text-gray-400"
                          }`}
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >

                            <rect
                              width="15"
                              height="12"
                              x="4.5"
                              y="10"
                              rx="2"
                              strokeWidth="1.8"
                            />

                            <path
                              strokeLinecap="round"
                              strokeWidth="1.8"
                              d="M8 10V7a4 4 0 0 1 8 0v3"
                            />

                          </svg>

                        </div>

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
                          autoComplete="current-password"
                          required
                          placeholder="Enter your password"
                          className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        />

                        {/* SHOW / HIDE PASSWORD */}

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

                          {showPassword ? (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >

                              <path
                                strokeLinecap="round"
                                strokeWidth="1.8"
                                d="M3 3l18 18"
                              />

                              <path
                                strokeLinecap="round"
                                strokeWidth="1.8"
                                d="M9.9 5.2A10.8 10.8 0 0 0 3 12c1.6 3.5 4.8 6 9 6 1.5 0 2.9-.3 4.1-.9M14.1 5.2A10.8 10.8 0 0 1 21 12a10.8 10.8 0 0 1-3.1 4.1"
                              />

                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >

                              <path
                                strokeLinecap="round"
                                strokeWidth="1.8"
                                d="M2.8 12s3.2-6 9.2-6 9.2 6 9.2 6-3.2 6-9.2 6-9.2-6-9.2-6Z"
                              />

                              <circle
                                cx="12"
                                cy="12"
                                r="2.5"
                                strokeWidth="1.8"
                              />

                            </svg>
                          )}

                        </button>

                      </div>

                    </div>

                    {/* =================================================
                        LOGIN BUTTON
                    ================================================= */}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        googleLoading
                      }
                      className="group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                            Signing you in...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            Login to CleanCRAVE
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

                  </form>

                  {/* =================================================
                      REGISTER DIVIDER
                  ================================================= */}

                  <div className="my-7 flex items-center gap-4">

                    <div className="h-px flex-1 bg-gray-200" />

                    <span className="text-xs font-medium text-gray-400">
                      New to CleanCRAVE?
                    </span>

                    <div className="h-px flex-1 bg-gray-200" />

                  </div>

                  {/* =================================================
                      REGISTER
                  ================================================= */}

                  <Link
                    to="/register"
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                  >

                    <span>
                      Create your account
                    </span>

                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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

                  </Link>

                  {/* =================================================
                      FOOTER
                  ================================================= */}

                  <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                    By continuing, you agree to use CleanCRAVE
                    responsibly and make healthier food choices.
                  </p>

                </>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;