import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api/authApi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!/^\S+@gmail\.com$/i.test(cleanEmail)) {
      setError(
        "Please enter the Gmail address used for your CleanCRAVE account."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(cleanEmail);

      if (data?.requiresOtp) {
        setEmail(cleanEmail);
        setStep(2);

        setSuccess(
          "A 6-digit OTP has been sent to your registered Gmail address."
        );
      } else {
        setSuccess(
          data?.message ||
            "If an account exists with this email, a reset OTP has been sent."
        );
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to send password reset OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CONTINUE FROM OTP
  // ==========================================

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(
        "Please enter the 6-digit OTP sent to your Gmail."
      );
      return;
    }

    setStep(3);

    setSuccess(
      "OTP entered successfully. Now create your new password."
    );
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the 6-digit OTP.");
      setStep(2);
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(
        email.trim().toLowerCase(),
        cleanOtp,
        newPassword
      );

      setSuccess(
        data?.message ||
          "Your password has been changed successfully."
      );

      setNewPassword("");
      setConfirmPassword("");
      setOtp("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to reset password.";

      setError(message);

      if (
        message.toLowerCase().includes("otp") ||
        message.toLowerCase().includes("expired")
      ) {
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHANGE EMAIL
  // ==========================================

  const handleChangeEmail = () => {
    setStep(1);

    setOtp("");
    setNewPassword("");
    setConfirmPassword("");

    setError("");
    setSuccess("");
  };

  // ==========================================
  // BACK TO OTP
  // ==========================================

  const handleBackToOtp = () => {
    setStep(2);

    setError("");
    setSuccess("");
  };

  // ==========================================
  // STEP INDICATOR
  // ==========================================

  const StepIndicator = () => {
    return (
      <div className="mb-8 flex items-center justify-center">
        {/* STEP 1 */}

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
            step >= 1
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {step > 1 ? "✓" : "1"}
        </div>

        <div
          className={`h-1 w-12 sm:w-16 ${
            step >= 2
              ? "bg-green-600"
              : "bg-gray-200"
          }`}
        />

        {/* STEP 2 */}

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
            step >= 2
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {step > 2 ? "✓" : "2"}
        </div>

        <div
          className={`h-1 w-12 sm:w-16 ${
            step >= 3
              ? "bg-green-600"
              : "bg-gray-200"
          }`}
        />

        {/* STEP 3 */}

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
            step >= 3
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          3
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f8f3]">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />

      {/* MAIN */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_25px_80px_rgba(20,83,45,0.12)] lg:grid-cols-2">

          {/* ==========================================
              LEFT PANEL
          ========================================== */}

          <div className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[50px] border-white/10" />

            <div>

              {/* LOGO */}

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
                Account recovery
              </p>

              <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                Get back to
                <br />
                eating smart.
                <br />

                <span className="text-lime-200">
                  Safely.
                </span>
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-green-50">
                We'll verify your registered Gmail address
                before allowing you to create a new password.
              </p>

            </div>

            {/* SECURITY */}

            <div className="space-y-3 text-sm text-green-50">

              <p>
                ✓ 6-digit email verification OTP
              </p>

              <p>
                ✓ OTP expires after 10 minutes
              </p>

              <p>
                ✓ Password securely hashed
              </p>

            </div>

          </div>

          {/* ==========================================
              RIGHT PANEL
          ========================================== */}

          <div className="p-6 sm:p-10 lg:p-12">

            <div className="mx-auto w-full max-w-lg">

              {/* MOBILE LOGO */}

              <div className="mb-8 text-center lg:hidden">

                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                  🥗
                </div>

                <h1 className="text-3xl font-black text-green-700">
                  CleanCRAVE
                </h1>

              </div>

              {/* HEADER */}

              <div className="mb-7">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  🔐 Secure recovery
                </div>

                <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Forgot password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Recover your account in three simple steps.
                </p>

              </div>

              {/* STEP INDICATOR */}

              <StepIndicator />

              {/* EMAIL DISPLAY */}

              {step > 1 && (
                <div className="mb-5 flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 px-4 py-3">

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                      Registered email
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                      {email}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="ml-3 shrink-0 text-xs font-bold text-green-700 hover:underline"
                  >
                    Change
                  </button>

                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* ==========================================
                  STEP 1
              ========================================== */}

              {step === 1 && (
                <form
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Registered Gmail address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      autoComplete="email"
                      placeholder="you@gmail.com"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Enter the same Gmail address you used
                      when creating your CleanCRAVE account.
                    </p>

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading
                      ? "Sending OTP..."
                      : "Send reset OTP"}
                  </button>

                </form>
              )}

              {/* ==========================================
                  STEP 2
              ========================================== */}

              {step === 2 && (
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >

                  <div className="text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                      ✉️
                    </div>

                    <h3 className="text-xl font-extrabold text-gray-900">
                      Check your Gmail
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                      We've sent a 6-digit verification
                      code to your registered email address.
                    </p>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Enter verification OTP
                    </label>

                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="123456"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center text-2xl font-black tracking-[0.45em] text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4 text-center">

                    <p className="text-xs leading-5 text-gray-500">
                      Your OTP is valid for{" "}
                      <span className="font-bold text-gray-700">
                        10 minutes
                      </span>.
                    </p>

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="w-full text-sm font-semibold text-green-700 hover:underline"
                  >
                    Use a different email
                  </button>

                </form>
              )}

              {/* ==========================================
                  STEP 3
              ========================================== */}

              {step === 3 && (
                <form
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >

                  <div className="text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                      🔑
                    </div>

                    <h3 className="text-xl font-extrabold text-gray-900">
                      Create a new password
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                      Choose a strong password for your
                      CleanCRAVE account.
                    </p>

                  </div>

                  {/* NEW PASSWORD */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      New password
                    </label>

                    <div className="flex items-center rounded-2xl border border-gray-200 bg-white focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100">

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(e.target.value)
                        }
                        required
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-4 text-sm text-gray-900 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        className="mr-2 rounded-xl p-2 text-gray-400 hover:bg-gray-100"
                      >
                        {showPassword
                          ? "🙈"
                          : "👁️"}
                      </button>

                    </div>

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Confirm new password
                    </label>

                    <div className="flex items-center rounded-2xl border border-gray-200 bg-white focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100">

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        required
                        autoComplete="new-password"
                        placeholder="Enter password again"
                        className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-4 text-sm text-gray-900 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) => !prev
                          )
                        }
                        className="mr-2 rounded-xl p-2 text-gray-400 hover:bg-gray-100"
                      >
                        {showConfirmPassword
                          ? "🙈"
                          : "👁️"}
                      </button>

                    </div>

                  </div>

                  {/* PASSWORD REQUIREMENTS */}

                  <div className="rounded-2xl bg-gray-50 p-4">

                    <p className="mb-2 text-xs font-bold text-gray-700">
                      Password requirements
                    </p>

                    <div className="space-y-1.5 text-xs">

                      <p
                        className={
                          newPassword.length >= 6
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {newPassword.length >= 6
                          ? "✓"
                          : "○"}{" "}
                        At least 6 characters
                      </p>

                      <p
                        className={
                          newPassword &&
                          newPassword === confirmPassword
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {newPassword &&
                        newPassword === confirmPassword
                          ? "✓"
                          : "○"}{" "}
                        Passwords match
                      </p>

                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-green-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading
                      ? "Changing password..."
                      : "Change password"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToOtp}
                    className="w-full text-sm font-semibold text-green-700 hover:underline"
                  >
                    ← Back to OTP
                  </button>

                </form>
              )}

              {/* LOGIN */}

              <div className="mt-8 text-center text-sm text-gray-500">

                Remembered your password?{" "}

                <Link
                  to="/login"
                  className="font-bold text-green-600 hover:underline"
                >
                  Back to login
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;