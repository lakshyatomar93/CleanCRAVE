const Food = require("../models/Food");

const {
  calculateNutritionTarget,
} = require("./nutritionCalculator");

const {
  getTodayNutrition,
} = require("./nutritionLogService");


// ==========================================
// HELPER: FOOD PREFERENCE MATCH
// ==========================================

const isPreferenceCompatible = (
  foodPreference,
  userPreference
) => {

  // If user hasn't selected a preference,
  // don't reject the food.
  if (!userPreference) {
    return true;
  }


  // Exact match
  if (
    foodPreference === userPreference
  ) {
    return true;
  }


  // Vegan users should only receive vegan food.
  if (
    userPreference === "Vegan"
  ) {

    return (
      foodPreference === "Vegan"
    );

  }


  // Vegetarian users can eat Vegetarian
  // and Vegan food.
  if (
    userPreference === "Vegetarian"
  ) {

    return (
      foodPreference === "Vegetarian" ||
      foodPreference === "Vegan"
    );

  }


  // Eggitarian users can eat:
  // Vegetarian, Vegan and Eggitarian.
  if (
    userPreference === "Eggitarian"
  ) {

    return (
      foodPreference === "Vegetarian" ||
      foodPreference === "Vegan" ||
      foodPreference === "Eggitarian"
    );

  }


  // Non-Vegetarian users can eat all known
  // food categories.
  if (
    userPreference === "Non-Vegetarian"
  ) {

    return (
      foodPreference === "Vegetarian" ||
      foodPreference === "Vegan" ||
      foodPreference === "Eggitarian" ||
      foodPreference === "Non-Vegetarian"
    );

  }


  return true;

};


// ==========================================
// HELPER: GOAL SCORE
// ==========================================

const getGoalScore = (
  goal,
  nutrition
) => {

  const protein =
    nutrition.protein || 0;

  const calories =
    nutrition.calories || 0;

  const fat =
    nutrition.fat || 0;

  const fiber =
    nutrition.fiber || 0;


  let score = 0;


  // ========================================
  // LOSE
  // ========================================

  if (goal === "Lose") {

    // Prefer moderate calories
    if (calories <= 500) {
      score += 15;
    }

    // Higher protein helps with satiety
    if (protein >= 20) {
      score += 20;
    } else if (protein >= 10) {
      score += 10;
    }

    // Fiber is useful for fullness
    if (fiber >= 5) {
      score += 15;
    }

    // Avoid very high fat
    if (fat <= 20) {
      score += 10;
    }

  }


  // ========================================
  // MAINTAIN
  // ========================================

  else if (goal === "Maintain") {

    if (
      calories >= 250 &&
      calories <= 600
    ) {

      score += 15;

    }

    if (protein >= 15) {
      score += 15;
    }

    if (fiber >= 4) {
      score += 10;
    }

    if (fat <= 25) {
      score += 10;
    }

  }


  // ========================================
  // GAIN
  // ========================================

  else if (goal === "Gain") {

    // Higher calories are useful
    if (calories >= 400) {
      score += 20;
    } else if (calories >= 250) {
      score += 10;
    }

    // Protein is important
    if (protein >= 20) {
      score += 20;
    } else if (protein >= 10) {
      score += 10;
    }

    if (fat >= 10) {
      score += 10;
    }

  }


  // ========================================
  // MUSCLE GAIN
  // ========================================

  else if (
    goal === "Muscle Gain"
  ) {

    // Strong protein preference
    if (protein >= 25) {
      score += 30;
    } else if (protein >= 20) {
      score += 20;
    } else if (protein >= 15) {
      score += 10;
    }

    // Moderate/high calories
    if (calories >= 300) {
      score += 15;
    }

    // Some fiber is still useful
    if (fiber >= 4) {
      score += 5;
    }

  }


  return score;

};


// ==========================================
// RECOMMENDATION SERVICE
// ==========================================

const getRecommendations = async (
  user
) => {

  // ==========================================
  // 1. CALCULATE DAILY TARGET
  // ==========================================

  const targets =
    calculateNutritionTarget(user);


  // ==========================================
  // 2. GET TODAY'S CONSUMPTION
  // ==========================================

  const consumed =
    await getTodayNutrition(
      user._id
    );


  // ==========================================
  // 3. CALCULATE REMAINING NEEDS
  // ==========================================

  const remaining = {

    calories: Math.max(
      targets.calories -
      consumed.calories,
      0
    ),

    protein: Math.max(
      targets.protein -
      consumed.protein,
      0
    ),

    carbohydrates: Math.max(
      targets.carbohydrates -
      consumed.carbohydrates,
      0
    ),

    fat: Math.max(
      targets.fat -
      consumed.fat,
      0
    ),

    fiber: Math.max(
      targets.fiber -
      consumed.fiber,
      0
    ),

  };


  // ==========================================
  // 4. REMAINING BUDGET
  // ==========================================

  const remainingBudget =
    Math.max(

      (user.dailyBudget || 0) -
      (consumed.spent || 0),

      0

    );


  // ==========================================
  // 5. GET AVAILABLE FOODS
  // ==========================================

  const foods =
    await Food.find({

      isAvailable: true,

      price: {
        $gt: 0,
        $lte: remainingBudget,
      },

    }).lean();


  // ==========================================
  // 6. FILTER FOOD PREFERENCE
  // ==========================================

  const compatibleFoods =
    foods.filter(
      (food) =>
        isPreferenceCompatible(
          food.foodPreference,
          user.foodPreference
        )
    );


  // ==========================================
  // 7. SCORE FOODS
  // ==========================================

  const scoredFoods =
    compatibleFoods.map(
      (food) => {

        const nutrition =
          food.nutrition || {};


        const calories =
          nutrition.calories || 0;

        const protein =
          nutrition.protein || 0;

        const carbohydrates =
          nutrition.carbohydrates || 0;

        const fat =
          nutrition.fat || 0;

        const fiber =
          nutrition.fiber || 0;


        let score = 0;

        const reasons = [];


        // ====================================
        // GOAL SCORE
        // ====================================

        const goalScore =
          getGoalScore(
            user.goal,
            nutrition
          );

        score += goalScore;


        if (
          user.goal === "Muscle Gain" &&
          protein >= 20
        ) {

          reasons.push(
            "High in protein for your muscle gain goal"
          );

        }


        if (
          user.goal === "Lose" &&
          fiber >= 5
        ) {

          reasons.push(
            "Good fiber content for your weight loss goal"
          );

        }


        if (
          user.goal === "Gain" &&
          calories >= 400
        ) {

          reasons.push(
            "Provides useful calories for your weight gain goal"
          );

        }


        // ====================================
        // CALORIE SCORE
        // ====================================

        if (
          remaining.calories > 0 &&
          calories > 0
        ) {

          const calorieRatio =
            calories /
            remaining.calories;


          if (
            calorieRatio >= 0.15 &&
            calorieRatio <= 0.40
          ) {

            score += 20;

            reasons.push(
              "Fits well within your remaining calorie target"
            );

          }

          else if (
            calorieRatio > 0 &&
            calorieRatio <= 0.60
          ) {

            score += 10;

          }

          // Food is too large for the remaining
          // calorie allowance.
          else if (
            calorieRatio > 1
          ) {

            score -= 25;

            reasons.push(
              "Higher than your remaining calorie allowance"
            );

          }

        }


        // ====================================
        // PROTEIN SCORE
        // ====================================

        if (
          remaining.protein > 0
        ) {

          const proteinRatio =
            protein /
            remaining.protein;


          if (
            proteinRatio >= 0.20
          ) {

            score += 25;

            reasons.push(
              "Helps you reach your remaining protein target"
            );

          }

          else if (
            proteinRatio >= 0.10
          ) {

            score += 12;

          }

        }


        // ====================================
        // FIBER SCORE
        // ====================================

        if (fiber >= 5) {

          score += 10;

          reasons.push(
            "Good source of dietary fiber"
          );

        }

        else if (fiber >= 3) {

          score += 5;

        }


        // ====================================
        // FAT SCORE
        // ====================================

        if (
          remaining.fat > 0
        ) {

          if (
            fat <=
            remaining.fat * 0.35
          ) {

            score += 8;

            reasons.push(
              "Fits comfortably within your remaining fat target"
            );

          }

          else if (
            fat >
            remaining.fat
          ) {

            score -= 10;

          }

        }


        // ====================================
        // FOOD PREFERENCE
        // ====================================

        if (
          food.foodPreference ===
          user.foodPreference
        ) {

          score += 20;

          reasons.push(

            `Matches your ${user.foodPreference.toLowerCase()} preference`

          );

        }

        else if (
          food.foodPreference === "Vegan" &&
          user.foodPreference === "Vegetarian"
        ) {

          score += 15;

          reasons.push(
            "Vegan food matches your vegetarian preference"
          );

        }

        else if (
          food.foodPreference === "Vegetarian" &&
          user.foodPreference === "Eggitarian"
        ) {

          score += 15;

          reasons.push(
            "Vegetarian food matches your eggitarian preference"
          );

        }


        // ====================================
        // BUDGET SCORE
        // ====================================

        if (
          remainingBudget > 0
        ) {

          const budgetRatio =
            food.price /
            remainingBudget;


          if (
            budgetRatio <= 0.30
          ) {

            score += 15;

            reasons.push(
              "Fits comfortably within your remaining daily budget"
            );

          }

          else if (
            budgetRatio <= 0.60
          ) {

            score += 10;

            reasons.push(
              "Fits within your remaining daily budget"
            );

          }

          else if (
            budgetRatio <= 0.85
          ) {

            score += 5;

          }

        }


        // ====================================
        // HIGH PROTEIN BONUS
        // ====================================

        if (
          protein >= 25
        ) {

          score += 10;

        }

        else if (
          protein >= 20
        ) {

          score += 5;

        }


        // ====================================
        // CARBOHYDRATE BALANCE
        // ====================================

        if (
          remaining.carbohydrates > 0 &&
          carbohydrates <=
            remaining.carbohydrates * 0.40
        ) {

          score += 5;

        }


        // ====================================
        // SCORE NORMALIZATION
        // ====================================

        const recommendationScore =
          Math.max(
            0,
            Math.min(
              Math.round(score),
              100
            )
          );


        // ====================================
        // DEFAULT REASON
        // ====================================

        if (
          reasons.length === 0
        ) {

          reasons.push(
            "Suitable for your current nutrition needs"
          );

        }


        return {

          ...food,

          recommendationScore,

          recommendationReasons:
            reasons.slice(0, 3),

        };

      }
    );


  // ==========================================
  // 8. SORT
  // ==========================================

  scoredFoods.sort(
    (a, b) => {

      // First compare recommendation score
      if (
        b.recommendationScore !==
        a.recommendationScore
      ) {

        return (
          b.recommendationScore -
          a.recommendationScore
        );

      }


      // If scores are equal,
      // prefer higher protein.
      const proteinA =
        a.nutrition?.protein || 0;

      const proteinB =
        b.nutrition?.protein || 0;


      return (
        proteinB -
        proteinA
      );

    }
  );


  // ==========================================
  // 9. TOP 12
  // ==========================================

  const recommendations =
    scoredFoods.slice(
      0,
      12
    );


  // ==========================================
  // 10. RESPONSE
  // ==========================================

  return {

    nutritionNeeds: {

      ...targets,

      dailyCalories:
        targets.calories,

    },


    consumed: {

      calories:
        consumed.calories,

      protein:
        consumed.protein,

      carbohydrates:
        consumed.carbohydrates,

      fat:
        consumed.fat,

      fiber:
        consumed.fiber,

    },


    remaining,


    budget: {

      daily:
        user.dailyBudget || 0,

      spent:
        consumed.spent || 0,

      remaining:
        remainingBudget,

    },


    recommendations,

  };

};


module.exports = {
  getRecommendations,
};