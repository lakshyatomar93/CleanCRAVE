const axios = require("axios");

const USDA_BASE_URL =
  "https://api.nal.usda.gov/fdc/v1";


// ========================================
// Search USDA foods
// ========================================

const searchUSDAFoods = async (
  query,
  pageSize = 20
) => {

  try {

    const response = await axios.get(
      `${USDA_BASE_URL}/foods/search`,
      {
        params: {
          api_key: process.env.USDA_API_KEY,
          query,
          pageSize,
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "USDA search error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to fetch food data from USDA"
    );
  }
};


// ========================================
// Get single USDA food
// ========================================

const getUSDAFood = async (fdcId) => {

  try {

    const response = await axios.get(
      `${USDA_BASE_URL}/food/${fdcId}`,
      {
        params: {
          api_key: process.env.USDA_API_KEY,
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "USDA food details error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to fetch food details"
    );
  }
};


module.exports = {
  searchUSDAFoods,
  getUSDAFood,
};