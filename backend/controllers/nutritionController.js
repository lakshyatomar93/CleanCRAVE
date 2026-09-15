const User = require("../models/User");
const NutritionLog = require("../models/NutritionLog");

const {
  calculateNutritionTarget,
} = require("../services/nutritionCalculator");

const {
  getTodayNutrition,
} = require("../services/nutritionLogService");


// ==========================================
// GET TODAY'S NUTRITION NEEDS
// ==========================================

const getNutritionNeeds = async (req, res) => {

  try {

    const userId =
      req.user.userId || req.user.id;


    const user =
      await User.findById(userId).lean();


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    const targets =
      calculateNutritionTarget(user);


    const consumed =
      await getTodayNutrition(userId);


    const remainingBudget =
      Math.max(
        (user.dailyBudget || 0) -
        (consumed.spent || 0),
        0
      );


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


    res.json({

      success: true,

      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel:
          user.activityLevel,
        goal: user.goal,
      },

      targets,

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

    });

  } catch (error) {

    console.error(
      "Nutrition error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to calculate nutrition needs",

    });

  }

};


// ==========================================
// GET NUTRITION HISTORY
// ==========================================

const getNutritionHistory = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.userId || req.user.id;


    const user =
      await User.findById(userId).lean();


    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found",

      });

    }


    // --------------------------------------
    // Number of days
    // --------------------------------------

    let days =
      Number(req.query.days) || 7;


    // Keep the request reasonable.
    days = Math.min(
      Math.max(days, 1),
      30
    );


    // --------------------------------------
    // Today's date
    // --------------------------------------

    const now = new Date();

    const endDate =
      new Date(now);

    endDate.setHours(
      0,
      0,
      0,
      0
    );


    // --------------------------------------
    // Starting date
    // --------------------------------------

    const startDate =
      new Date(endDate);

    startDate.setDate(
      startDate.getDate() -
        (days - 1)
    );


    // --------------------------------------
    // Convert to YYYY-MM-DD
    // --------------------------------------

    const formatDate = (date) => {

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;

    };


    const start =
      formatDate(startDate);

    const end =
      formatDate(endDate);


    // --------------------------------------
    // Get existing logs
    // --------------------------------------

    const logs =
      await NutritionLog.find({

        user: userId,

        date: {
          $gte: start,
          $lte: end,
        },

      })
        .sort({
          date: 1,
        })
        .lean();


    // --------------------------------------
    // Create lookup map
    // --------------------------------------

    const logMap =
      new Map(
        logs.map(
          (log) => [
            log.date,
            log,
          ]
        )
      );


    // --------------------------------------
    // Fill missing days with zero values
    // --------------------------------------

    const history = [];


    for (
      let i = 0;
      i < days;
      i++
    ) {

      const currentDate =
        new Date(startDate);

      currentDate.setDate(
        startDate.getDate() + i
      );


      const date =
        formatDate(currentDate);


      const log =
        logMap.get(date);


      history.push({

        date,

        calories:
          log?.calories || 0,

        protein:
          log?.protein || 0,

        carbohydrates:
          log?.carbohydrates || 0,

        fat:
          log?.fat || 0,

        fiber:
          log?.fiber || 0,

        spent:
          log?.spent || 0,

      });

    }


    // --------------------------------------
    // Nutrition targets
    // --------------------------------------

    const targets =
      calculateNutritionTarget(user);


    // --------------------------------------
    // Summary
    // --------------------------------------

    const totalCalories =
      history.reduce(
        (sum, day) =>
          sum +
          Number(
            day.calories || 0
          ),
        0
      );


    const totalProtein =
      history.reduce(
        (sum, day) =>
          sum +
          Number(
            day.protein || 0
          ),
        0
      );


    const totalSpent =
      history.reduce(
        (sum, day) =>
          sum +
          Number(
            day.spent || 0
          ),
        0
      );


    const trackedDays =
      history.filter(
        (day) =>
          day.calories > 0 ||
          day.protein > 0 ||
          day.spent > 0
      ).length;


    const averageCalories =
      trackedDays > 0
        ? Math.round(
            totalCalories /
              trackedDays
          )
        : 0;


    const averageProtein =
      trackedDays > 0
        ? Math.round(
            totalProtein /
              trackedDays
          )
        : 0;


    // --------------------------------------
    // Response
    // --------------------------------------

    res.json({

      success: true,

      days,

      history,

      targets: {

        calories:
          targets.calories,

        protein:
          targets.protein,

        carbohydrates:
          targets.carbohydrates,

        fat:
          targets.fat,

        fiber:
          targets.fiber,

      },

      summary: {

        totalCalories,

        averageCalories,

        totalProtein,

        averageProtein,

        totalSpent,

        trackedDays,

      },

    });

  } catch (error) {

    console.error(
      "Nutrition history error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to load nutrition history",

    });

  }

};


module.exports = {

  getNutritionNeeds,

  getNutritionHistory,

};