// ============================================================
// NUTRITION SERVICE
// ============================================================
//
// Safely extracts USDA FoodData Central nutrients.
//
// FoodData Central nutrient `amount` values are normally expressed
// on a 100 g basis for the relevant food record. We only accept
// the amount belonging to the matched nutrient.
//
// IMPORTANT:
// - Missing nutrient values are NOT converted into another nutrient.
// - We do not use broad/ambiguous nutrient matches when an exact
//   USDA nutrient number is available.
// - A zero value is allowed when the food genuinely contains zero,
//   but missing values remain 0 only at the application layer.
// ============================================================

const normalizeText = (text = "") =>
    String(text)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

const getNutrientNumber = (nutrient) => {
    if (!nutrient) return "";

    const values = [
        nutrient.nutrient?.number,
        nutrient.nutrientNumber,
        nutrient.number,
        nutrient.nutrient?.id,
        nutrient.nutrientId,
        nutrient.id,
    ];

    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return String(value);
        }
    }

    return "";
};

const getNutrientName = (nutrient) => {
    if (!nutrient) return "";

    return normalizeText(
        nutrient.nutrient?.name ||
        nutrient.name ||
        ""
    );
};

const getNutrientUnit = (nutrient) => {
    if (!nutrient) return "";

    return normalizeText(
        nutrient.nutrient?.unitName ||
        nutrient.unitName ||
        ""
    );
};

// USDA detail/search nutrient records normally expose the actual
// nutrient amount through `amount`. Only fall back to `value` when
// the direct amount field does not exist.
const getNutrientAmount = (nutrient) => {
    if (!nutrient) return 0;

    const directAmount = nutrient.amount;

    if (
        directAmount !== undefined &&
        directAmount !== null &&
        directAmount !== "" &&
        Number.isFinite(Number(directAmount))
    ) {
        return Number(directAmount);
    }

    // Some response variants expose the value inside a nested
    // nutrient object.
    const fallbackAmounts = [
        nutrient.nutrient?.amount,
        nutrient.value,
        nutrient.nutrient?.value,
    ];

    for (const amount of fallbackAmounts) {
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

const findNutrient = (
    nutrients,
    nutrientNumbers = [],
    nutrientNames = []
) => {
    if (!Array.isArray(nutrients) || nutrients.length === 0) {
        return null;
    }

    const numbers = nutrientNumbers.map(String);
    const names = nutrientNames.map(normalizeText);

    // 1. Exact USDA nutrient number.
    const byNumber = nutrients.find((nutrient) =>
        numbers.includes(getNutrientNumber(nutrient))
    );

    if (byNumber) return byNumber;

    // 2. Exact nutrient name.
    const byExactName = nutrients.find((nutrient) => {
        const name = getNutrientName(nutrient);
        return name && names.includes(name);
    });

    if (byExactName) return byExactName;

    // 3. Conservative partial name fallback.
    const byPartialName = nutrients.find((nutrient) => {
        const name = getNutrientName(nutrient);

        if (!name) return false;

        return names.some(
            (targetName) =>
                name.includes(targetName) ||
                targetName.includes(name)
        );
    });

    return byPartialName || null;
};

const getNutrientValue = (
    nutrients,
    nutrientNumbers,
    nutrientNames
) => {
    const nutrient = findNutrient(
        nutrients,
        nutrientNumbers,
        nutrientNames
    );

    if (!nutrient) return 0;

    return getNutrientAmount(nutrient);
};

const extractNutrition = (food) => {
    const nutrients = Array.isArray(food?.foodNutrients)
        ? food.foodNutrients
        : [];

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
        carbohydrates: Number(carbohydrates) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
        sodium: Number(sodium) || 0,
    };
};

// A record with only one populated nutrient is not sufficient for
// the curated recommendation catalog.
const hasNutrition = (nutrition) => {
    if (!nutrition) return false;

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

// Used by foodSyncService for curated foods.
const hasCompleteNutrition = (nutrition) => {
    if (!nutrition) return false;

    const calories = Number(nutrition.calories);
    const protein = Number(nutrition.protein);
    const carbohydrates = Number(nutrition.carbohydrates);
    const fat = Number(nutrition.fat);

    return (
        Number.isFinite(calories) &&
        Number.isFinite(protein) &&
        Number.isFinite(carbohydrates) &&
        Number.isFinite(fat) &&
        calories > 0 &&
        protein >= 0 &&
        carbohydrates >= 0 &&
        fat >= 0
    );
};

module.exports = {
    extractNutrition,
    hasNutrition,
    hasCompleteNutrition,
    getNutrientNumber,
    getNutrientName,
    getNutrientUnit,
};
