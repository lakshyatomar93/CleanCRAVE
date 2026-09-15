const calculateBMR = ({
  gender,
  weight,
  height,
  age,
}) => {

  if (!weight || !height || !age) {
    return 0;
  }


  if (gender === "Female") {

    return (
      10 * weight +
      6.25 * height -
      5 * age -
      161
    );

  }


  return (
    10 * weight +
    6.25 * height -
    5 * age +
    5
  );

};


// ==========================================
// ACTIVITY MULTIPLIER
// ==========================================

const getActivityMultiplier = (
  activityLevel
) => {

  return {

    Sedentary: 1.2,

    Light: 1.375,

    Moderate: 1.55,

    Active: 1.725,

    "Very Active": 1.9,

  }[activityLevel] || 1.2;

};


// ==========================================
// TDEE
// ==========================================

const calculateTDEE = (
  user
) => {

  const bmr =
    calculateBMR(user);


  if (!bmr) {
    return 0;
  }


  return Math.round(
    bmr *
      getActivityMultiplier(
        user.activityLevel
      )
  );

};


// ==========================================
// CALORIES
// ==========================================

const calculateCalories = (
  user
) => {

  const tdee =
    calculateTDEE(user);


  if (!tdee) {
    return 0;
  }


  let calories =
    tdee;


  switch (user.goal) {

    case "Lose":

      calories -= 400;

      break;


    case "Gain":

      calories += 300;

      break;


    case "Muscle Gain":

      calories += 250;

      break;


    case "Maintain":

    default:

      break;

  }


  return Math.round(
    calories
  );

};


// ==========================================
// PROTEIN
// ==========================================

const calculateProtein = (
  user
) => {

  if (!user.weight) {
    return 0;
  }


  let multiplier =
    1.2;


  switch (user.goal) {

    case "Lose":

      multiplier = 1.6;

      break;


    case "Gain":

      multiplier = 1.4;

      break;


    case "Muscle Gain":

      multiplier = 1.8;

      break;


    case "Maintain":

    default:

      multiplier = 1.2;

      break;

  }


  return Math.round(
    user.weight *
      multiplier
  );

};


// ==========================================
// COMPLETE NUTRITION TARGET
// ==========================================

const calculateNutritionTarget = (
  user
) => {

  const bmr =
    Math.round(
      calculateBMR(user)
    );


  const tdee =
    calculateTDEE(user);


  const calories =
    calculateCalories(user);


  const protein =
    calculateProtein(user);


  const proteinCalories =
    protein * 4;


  const remainingCalories =
    Math.max(
      calories -
        proteinCalories,
      0
    );


  const carbohydrates =
    Math.round(
      (remainingCalories * 0.65) /
        4
    );


  const fat =
    Math.round(
      (remainingCalories * 0.35) /
        9
    );


  const fiber =
    Math.round(
      (calories / 1000) *
        14
    );


  return {

    bmr,

    tdee,

    calories,

    protein,

    carbohydrates,

    fat,

    fiber,

  };

};


module.exports = {

  calculateBMR,

  getActivityMultiplier,

  calculateTDEE,

  calculateCalories,

  calculateProtein,

  calculateNutritionTarget,

};