// ============================================================
// NUTRITION SERVICE
// ============================================================
//
// Extracts nutrition values from USDA FoodData Central.
//
// IMPORTANT:
// USDA can return different structures depending on the
// food/data type. We therefore:
//   1. Identify the nutrient using nutrient number/id/name
//   2. Read ONLY the amount belonging to that nutrient
//   3. Never reuse one nutrient's value for another nutrient
//
// Values are generally per 100g when USDA provides them that way.
// ============================================================


// ============================================================
// NORMALIZE TEXT
// ============================================================

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};


// ============================================================
// GET NUTRIENT NUMBER
// ============================================================

const getNutrientNumber = (nutrient) => {

  if (!nutrient) {
    return "";
  }

  // USDA search/detail response can use different structures.
  const possibleNumbers = [

    nutrient.nutrient?.number,

    nutrient.nutrientNumber,

    nutrient.number,

    nutrient.nutrient?.id,

    nutrient.nutrientId,

    nutrient.id,

  ];

  for (const number of possibleNumbers) {

    if (
      number !== undefined &&
      number !== null &&
      number !== ""
    ) {
      return String(number);
    }

  }

  return "";
};


// ============================================================
// GET NUTRIENT NAME
// ============================================================

const getNutrientName = (nutrient) => {

  if (!nutrient) {
    return "";
  }

  return normalizeText(

    nutrient.nutrient?.name ||

    nutrient.name ||

    ""

  );

};


// ============================================================
// GET NUTRIENT UNIT
// ============================================================

const getNutrientUnit = (nutrient) => {

  if (!nutrient) {
    return "";
  }

  return normalizeText(

    nutrient.nutrient?.unitName ||

    nutrient.unitName ||

    ""

  );

};


// ============================================================
// GET NUTRIENT AMOUNT
// ============================================================
//
// IMPORTANT:
// We prioritize the direct `amount` field.
//
// We DO NOT blindly accept nested `value` fields because
// some USDA response structures can contain values that are
// not the actual nutrient amount we want.
// ============================================================

const getNutrientAmount = (nutrient) => {
  if (!nutrient) {
    return 0;
  }

  const possibleAmounts = [
    nutrient.amount,
    nutrient.value,
    nutrient.nutrient?.amount,
    nutrient.nutrient?.value,
  ];

  for (const amount of possibleAmounts) {
    if (
      amount !== undefined &&
      amount !== null &&
      amount !== "" &&
      Number.isFinite(Number(amount))
    ) {
      return Number(amount);
    }
  }

  return 0;
};


// ============================================================
// FIND NUTRIENT
// ============================================================

const findNutrient = (
  nutrients,
  nutrientNumbers = [],
  nutrientNames = []
) => {

  if (
    !Array.isArray(nutrients) ||
    nutrients.length === 0
  ) {

    return null;

  }


  const numbers = nutrientNumbers.map(
    (number) =>
      String(number)
  );


  const names = nutrientNames.map(
    (name) =>
      normalizeText(name)
  );


  // ==========================================================
  // 1. EXACT USDA NUTRIENT NUMBER
  // ==========================================================

  const byNumber = nutrients.find(
    (nutrient) => {

      const number =
        getNutrientNumber(
          nutrient
        );

      return (
        number &&
        numbers.includes(number)
      );

    }
  );


  if (byNumber) {
    return byNumber;
  }


  // ==========================================================
  // 2. EXACT NUTRIENT NAME
  // ==========================================================

  const byExactName = nutrients.find(
    (nutrient) => {

      const name =
        getNutrientName(
          nutrient
        );

      return (
        name &&
        names.includes(name)
      );

    }
  );


  if (byExactName) {
    return byExactName;
  }


  // ==========================================================
  // 3. PARTIAL NAME MATCH
  // ==========================================================

  const byPartialName = nutrients.find(
    (nutrient) => {

      const name =
        getNutrientName(
          nutrient
        );


      if (!name) {
        return false;
      }


      return names.some(
        (targetName) => {

          return (
            name.includes(targetName) ||
            targetName.includes(name)
          );

        }
      );

    }
  );


  return byPartialName || null;
};


// ============================================================
// GET NUTRIENT VALUE
// ============================================================

const getNutrientValue = (
  nutrients,
  nutrientNumbers,
  nutrientNames
) => {

  const nutrient =
    findNutrient(
      nutrients,
      nutrientNumbers,
      nutrientNames
    );


  if (!nutrient) {
    return 0;
  }


  return getNutrientAmount(
    nutrient
  );
};


// ============================================================
// EXTRACT NUTRITION
// ============================================================

const extractNutrition = (food) => {

  const nutrients =
    Array.isArray(
      food?.foodNutrients
    )
      ? food.foodNutrients
      : [];


  // ==========================================================
  // CALORIES
  // ==========================================================

  const calories = getNutrientValue(
    nutrients,
    ["1008", "2047", "2048", "208"],
    [
      "energy",
      "energy (atwater general factors)",
      "energy (atwater specific factors)",
      "energy, kcal",
      "calories",
    ]
  );


  // ==========================================================
  // PROTEIN
  // ==========================================================

  const protein = getNutrientValue(
    nutrients,
    ["1003", "203"],
    [
      "protein",
      "protein, total",
      "protein, total (n x 6.25)",
    ]
  );

  const carbohydrates = getNutrientValue(
    nutrients,
    ["1005", "205"],
    [
      "carbohydrate, by difference",
      "carbohydrate",
      "carbohydrates",
      "total carbohydrate",
    ]
  );

  const fat = getNutrientValue(
    nutrients,
    ["1004", "204"],
    [
      "total lipid (fat)",
      "total lipid",
      "fat",
      "total fat",
    ]
  );

  const fiber = getNutrientValue(
    nutrients,
    ["1079", "291"],
    [
      "fiber, total dietary",
      "dietary fiber",
      "fiber",
      "total dietary fiber",
    ]
  );


  // ==========================================================
  // SUGAR
  // ==========================================================

  const sugar = getNutrientValue(
    nutrients,
    ["2000", "1063", "269"],
    [
      "total sugars",
      "total sugar",
      "sugars, total including nlea",
      "sugar",
    ]
  );

  const sodium = getNutrientValue(
    nutrients,
    ["1093", "307"],
    [
      "sodium, na",
      "sodium",
    ]
  );


  return {

    calories: Number(calories) || 0,

    protein: Number(protein) || 0,

    carbohydrates:
      Number(carbohydrates) || 0,

    fat:
      Number(fat) || 0,

    fiber:
      Number(fiber) || 0,

    sugar:
      Number(sugar) || 0,

    sodium:
      Number(sodium) || 0,

  };

};


// ============================================================
// CHECK WHETHER NUTRITION EXISTS
// ============================================================

const hasNutrition = (nutrition) => {

  if (!nutrition) {
    return false;
  }


  return (

    Number(nutrition.calories) > 0 ||

    Number(nutrition.protein) > 0 ||

    Number(nutrition.carbohydrates) > 0 ||

    Number(nutrition.fat) > 0 ||

    Number(nutrition.fiber) > 0 ||

    Number(nutrition.sugar) > 0 ||

    Number(nutrition.sodium) > 0

  );

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  extractNutrition,

  hasNutrition,

};