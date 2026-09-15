import api from "./api";

// Get today's nutrition needs
export const getNutritionNeeds = async () => {
  const response = await api.get("/nutrition");
  return response.data;
};

// Get nutrition history
export const getNutritionHistory = async (days = 7) => {
  const response = await api.get(
    `/nutrition/history?days=${days}`
  );

  return response.data;
};