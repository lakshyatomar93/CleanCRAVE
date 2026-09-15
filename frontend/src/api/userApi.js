import api from "./api";


// ==========================================
// UPDATE USER PROFILE
// ==========================================

export const updateProfile = async (
  profileData
) => {

  const response =
    await api.put(
      "/auth/profile",
      profileData
    );

  return response.data;

};