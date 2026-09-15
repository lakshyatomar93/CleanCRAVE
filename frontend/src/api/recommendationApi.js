import api from "./api";

export const getRecommendations = async () => {
  const response = await api.get(
    "/recommendations"
  );

  return response.data;
};