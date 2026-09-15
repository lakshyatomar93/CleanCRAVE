import api from "./api";

// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};

export const verifyRegistrationEmailOtp = async (
  email,
  otp
) => {
  const response = await api.post(
    "/auth/register/verify-email",
    {
      email,
      otp,
    }
  );

  return response.data;
};

export const resendRegistrationEmailOtp = async (
  email
) => {
  const response = await api.post(
    "/auth/register/resend-email",
    {
      email,
    }
  );

  return response.data;
};

// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (userData) => {
  const response = await api.post(
    "/auth/login",
    userData
  );

  return response.data;
};

// ============================================================
// ADMIN LOGIN OTP
// ============================================================

export const verifyAdminLoginOtp = async (
  email,
  otp
) => {
  const response = await api.post(
    "/auth/login/admin/verify-email",
    {
      email,
      otp,
    }
  );

  return response.data;
};

export const resendAdminLoginOtp = async (
  email
) => {
  const response = await api.post(
    "/auth/login/admin/resend-email",
    {
      email,
    }
  );

  return response.data;
};

// ============================================================
// FIREBASE / GOOGLE
// ============================================================

export const firebaseAuth = async (
  firebaseToken,
  profileData = {}
) => {
  const response = await api.post(
    "/auth/firebase",
    {
      firebaseToken,
      ...profileData,
    }
  );

  return response.data;
};

export const firebaseSetup = async (
  firebaseToken,
  profileData = {}
) => {
  const response = await api.post(
    "/auth/firebase/setup",
    {
      firebaseToken,
      ...profileData,
    }
  );

  return response.data;
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = async (email) => {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};

// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      email,
      otp,
      newPassword,
    }
  );

  return response.data;
};

// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateProfile = async (
  profileData
) => {
  const response = await api.put(
    "/auth/profile",
    profileData
  );

  return response.data;
};