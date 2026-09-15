const NutritionLog =
  require("../models/NutritionLog");


const getTodayDate = () => {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(now.getDate())
      .padStart(2, "0");


  return `${year}-${month}-${day}`;
};


const getTodayNutrition =
  async (userId) => {

    const date =
      getTodayDate();


    let log =
      await NutritionLog.findOne({
        user: userId,
        date,
      });


    if (!log) {

      log =
        await NutritionLog.create({
          user: userId,
          date,
        });

    }


    return log;
  };


const addNutrition = async (
  userId,
  nutrition,
  spent = 0
) => {

  const date =
    getTodayDate();


  const log =
    await NutritionLog.findOneAndUpdate(

      {
        user: userId,
        date,
      },

      {
        $inc: {

          calories:
            nutrition.calories || 0,

          protein:
            nutrition.protein || 0,

          carbohydrates:
            nutrition.carbohydrates || 0,

          fat:
            nutrition.fat || 0,

          fiber:
            nutrition.fiber || 0,

          spent:
            spent || 0,

        },
      },

      {
        new: true,

        upsert: true,

        setDefaultsOnInsert: true,
      }
    );


  return log;
};


module.exports = {
  getTodayDate,
  getTodayNutrition,
  addNutrition,
};