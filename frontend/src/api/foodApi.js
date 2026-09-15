import api from "./api";


export const getFoods = async (params = {}) => {
  const response = await api.get("/foods", {
    params,
  });

  return response.data;
};


export const getFoodById = async (id) => {
  const response = await api.get(
    `/foods/${id}`
  );

  return response.data;
};


export const searchFoods = async (query) => {
  const response = await api.get(
    "/foods/search",
    {
      params: {
        query,
      },
    }
  );

  return response.data;
};