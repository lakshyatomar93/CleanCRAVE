const Food = require("../models/Food");


// ==========================================
// ADMIN: GET ALL FOODS
// ==========================================

const getAdminFoods = async (req, res) => {
  try {

    const foods = await Food.find()
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: foods.length,
      foods,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to load foods",
    });

  }
};


// ==========================================
// ADMIN: CREATE FOOD
// ==========================================

const createAdminFood = async (
  req,
  res
) => {

  try {

    const food = await Food.create({
      ...req.body,
      source: "FoodFit Admin",
    });

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food,
    });

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message:
        "Failed to create food",
      error: error.message,
    });

  }
};


// ==========================================
// ADMIN: UPDATE FOOD
// ==========================================

const updateAdminFood = async (
  req,
  res
) => {

  try {

    const food =
      await Food.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!food) {

      return res.status(404).json({
        message: "Food not found",
      });

    }

    res.json({
      success: true,
      message: "Food updated successfully",
      food,
    });

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message:
        "Failed to update food",
      error: error.message,
    });

  }
};


// ==========================================
// ADMIN: DELETE FOOD
// ==========================================

const deleteAdminFood = async (
  req,
  res
) => {

  try {

    const food =
      await Food.findByIdAndDelete(
        req.params.id
      );

    if (!food) {

      return res.status(404).json({
        message: "Food not found",
      });

    }

    res.json({
      success: true,
      message: "Food deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete food",
    });

  }
};


// ==========================================
// ADMIN: TOGGLE AVAILABILITY
// ==========================================

const toggleFoodAvailability = async (
  req,
  res
) => {

  try {

    const food =
      await Food.findById(
        req.params.id
      );

    if (!food) {

      return res.status(404).json({
        message: "Food not found",
      });

    }

    food.isAvailable =
      !food.isAvailable;

    await food.save();

    res.json({
      success: true,
      message:
        "Food availability updated",
      food,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to update availability",
    });

  }
};


module.exports = {
  getAdminFoods,
  createAdminFood,
  updateAdminFood,
  deleteAdminFood,
  toggleFoodAvailability,
};