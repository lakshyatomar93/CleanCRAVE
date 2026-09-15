const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getNutritionNeeds,
  getNutritionHistory,
} = require("../controllers/nutritionController");


const router = express.Router();


// ==========================================
// TODAY'S NUTRITION
// ==========================================

router.get(
  "/",
  authMiddleware,
  getNutritionNeeds
);


// ==========================================
// NUTRITION HISTORY
// ==========================================

router.get(
  "/history",
  authMiddleware,
  getNutritionHistory
);


module.exports = router;