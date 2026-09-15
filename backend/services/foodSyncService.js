const Food = require("../models/Food");

const {
    searchUSDAFoods,
    getUSDAFood,
} = require("./usdaService");

const { extractNutrition } = require("./nutritionService");

const { searchFoodImage } = require("./imageService");

const FOOD_CATALOG = require("../config/foodCatalog");


// ============================================================
// TEXT UTILITIES
// ============================================================

const normalizeText = (text = "") => {
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};


const createCatalogKey = (name = "") => {
    return normalizeText(name)
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
};


const hasPhrase = (text, phrase) => {
    return normalizeText(text).includes(
        normalizeText(phrase)
    );
};


const hasAnyPhrase = (text, phrases = []) => {
    return phrases.some((phrase) =>
        hasPhrase(text, phrase)
    );
};


// ============================================================
// USDA SEARCH OVERRIDES
// ============================================================

const SEARCH_OVERRIDES = {

    "Paneer": [
        "paneer",
        "cottage cheese",
    ],

    "Paneer Tikka": [
        "paneer tikka",
        "paneer tikka masala",
    ],

    "Dal": [
        "lentils cooked",
        "lentil cooked",
    ],

    "Rajma": [
        "kidney beans cooked",
        "kidney beans",
    ],

    "Chole": [
        "chickpeas cooked",
        "garbanzo beans cooked",
    ],

    "Rice": [
        "white rice cooked",
    ],

    "Brown Rice": [
        "brown rice cooked",
    ],

    "Roti": [
        "roti",
        "chapati",
        "whole wheat flatbread",
    ],

    "Poha": [
        "poha",
        "flattened rice",
        "rice flakes",
    ],

    "Idli": [
        "idli",
    ],

    "Tofu": [
        "tofu raw",
        "tofu",
    ],

    "Oats": [
        "oats raw",
        "oats",
        "oatmeal",
    ],

    "Chickpeas": [
        "chickpeas cooked",
        "garbanzo beans cooked",
    ],

    "Lentils": [
        "lentils raw",
        "lentils cooked",
        "lentils",
    ],

    "Sweet Potato": [
        "sweet potato cooked",
        "sweet potato raw",
    ],

    "Broccoli": [
        "broccoli raw",
        "broccoli cooked",
    ],

    "Spinach": [
        "spinach raw",
        "spinach cooked",
    ],

    "Boiled Egg": [
        "egg whole boiled",
        "hard boiled egg",
        "boiled egg",
    ],

    "Egg Omelette": [
        "egg omelet",
        "egg omelette",
    ],

    "Scrambled Eggs": [
        "scrambled eggs",
        "scrambled egg",
    ],

    "Chicken Breast": [
        "chicken breast roasted",
        "chicken breast baked",
        "chicken breast cooked",
    ],

    "Chicken Tikka": [
        "chicken tikka",
    ],

    "Chicken Curry": [
        "chicken curry",
    ],

    "Grilled Chicken": [
        "grilled chicken breast",
        "grilled chicken",
    ],

    "Fish": [
        "fish cooked",
        "fish raw",
    ],

    "Salmon": [
        "salmon cooked",
        "salmon raw",
    ],

    "Prawns": [
        "shrimp cooked",
        "prawns cooked",
    ],

    "Apple": [
        "apple raw",
    ],

    "Banana": [
        "banana raw",
    ],

    "Guava": [
        "guava raw",
    ],

    "Orange": [
        "orange raw",
    ],

    "Mango": [
        "mango raw",
    ],

    "Papaya": [
        "papaya raw",
    ],

    "Greek Yogurt": [
        "greek yogurt plain",
        "greek yoghurt plain",
    ],

    "Milk": [
        "whole milk",
    ],

    "Peanut Butter": [
        "peanut butter",
    ],

    "Almonds": [
        "almonds raw",
        "almonds",
    ],

};


// ============================================================
// FOOD MATCHING RULES
// ============================================================

const FOOD_RULES = {

    Paneer: {
        required: ["paneer"],
        preferred: [
            "paneer",
            "paneer cheese",
        ],
        forbidden: [
            "pizza",
            "burger",
            "sandwich",
            "sauce",
            "dressing",
        ],
    },

    "Paneer Tikka": {
        required: ["paneer"],
        preferred: [
            "paneer tikka",
            "tikka",
        ],
        forbidden: [
            "pizza",
            "burger",
            "sandwich",
            "paneer masala",
        ],
    },

    Dal: {
        required: [
            "lentil",
            "lentils",
            "dal",
            "dhal",
        ],
        preferred: [
            "cooked",
            "boiled",
            "without salt",
        ],
        forbidden: [
            "soup",
            "bread",
            "pasta",
            "cookie",
            "cake",
        ],
    },

    Rajma: {
        required: [
            "kidney bean",
            "kidney beans",
        ],
        preferred: [
            "cooked",
            "boiled",
            "without salt",
        ],
        forbidden: [
            "with meat",
            "meat",
            "pork",
            "beef",
            "chicken",
            "sausage",
            "burger",
            "chili",
        ],
    },

    Chole: {
        required: [
            "chickpea",
            "chickpeas",
            "garbanzo",
        ],
        preferred: [
            "cooked",
            "boiled",
        ],
        forbidden: [
            "hummus",
            "falafel",
            "soup",
            "burger",
        ],
    },

    Rice: {
        required: ["rice"],
        preferred: [
            "white rice",
            "cooked",
        ],
        forbidden: [
            "brown rice",
            "rice pudding",
            "rice cake",
            "cracker",
            "flour",
            "bread",
            "cereal",
        ],
    },

    "Brown Rice": {
        required: ["brown rice"],
        preferred: [
            "cooked",
        ],
        forbidden: [
            "pudding",
            "cracker",
            "flour",
            "bread",
            "white rice",
        ],
    },

    Roti: {
        required: [
            "roti",
            "chapati",
            "flatbread",
        ],
        preferred: [
            "whole wheat",
            "whole grain",
        ],
        forbidden: [
            "loaf",
            "sandwich",
            "toast",
            "cracker",
            "pita",
        ],
    },

    Poha: {
        required: [
            "poha",
            "flattened rice",
            "beaten rice",
            "rice flakes",
        ],
        preferred: [
            "flattened rice",
            "rice flakes",
        ],
        forbidden: [
            "bread",
            "pasta",
            "rice pudding",
            "cereal",
        ],
    },

    Idli: {
        required: ["idli"],
        forbidden: [
            "bread",
            "cake",
            "pudding",
        ],
    },

    Tofu: {
        required: ["tofu"],
        preferred: [
            "raw",
            "firm",
            "calcium sulfate",
        ],
        forbidden: [
            "sauce",
            "dressing",
            "pizza",
            "burger",
        ],
    },

    Oats: {
        required: [
            "oat",
            "oats",
            "oatmeal",
        ],
        preferred: [
            "oats",
            "oatmeal",
            "raw",
        ],
        forbidden: [
            "yogurt",
            "yoghurt",
            "cookie",
            "cake",
            "bar",
            "granola",
            "flour",
        ],
    },

    Chickpeas: {
        required: [
            "chickpea",
            "chickpeas",
            "garbanzo",
        ],
        preferred: [
            "cooked",
            "boiled",
        ],
        forbidden: [
            "hummus",
            "falafel",
            "soup",
            "burger",
        ],
    },

    Lentils: {
        required: [
            "lentil",
            "lentils",
        ],
        preferred: [
            "raw",
            "cooked",
            "boiled",
        ],
        forbidden: [
            "soup",
            "bread",
            "pasta",
        ],
    },

    "Sweet Potato": {
        required: ["sweet potato"],
        preferred: [
            "cooked",
            "boiled",
        ],
        forbidden: [
            "pie",
            "fries",
            "chips",
            "casserole",
        ],
    },

    Broccoli: {
        required: ["broccoli"],
        preferred: [
            "raw",
            "cooked",
            "boiled",
        ],
        forbidden: [
            "broccoli raab",
            "broccoli rabe",
            "soup",
            "pizza",
        ],
    },

    Spinach: {
        required: ["spinach"],
        preferred: [
            "raw",
            "cooked",
            "boiled",
        ],
        forbidden: [
            "malabar spinach",
            "new zealand spinach",
            "spinach dip",
            "soup",
        ],
    },

    "Boiled Egg": {
        required: ["egg"],
        preferred: [
            "boiled",
            "hard boiled",
            "hard-boiled",
        ],
        forbidden: [
            "egg salad",
            "sandwich",
            "powder",
        ],
    },

    "Egg Omelette": {
        required: ["egg"],
        preferred: [
            "omelet",
            "omelette",
        ],
        forbidden: [
            "sandwich",
            "pizza",
            "powder",
        ],
    },

    "Scrambled Eggs": {
        required: ["egg"],
        preferred: [
            "scrambled",
        ],
        forbidden: [
            "sandwich",
            "pizza",
            "powder",
            "frozen mixture",
        ],
    },

    "Chicken Breast": {
        required: [
            "chicken",
        ],
        preferred: [
            "chicken breast",
            "roasted",
            "baked",
            "cooked",
        ],
        forbidden: [
            "bratwurst",
            "sausage",
            "nugget",
            "wing",
            "thigh",
            "drumstick",
            "leg",
            "breaded",
            "fried",
            "skin eaten",
        ],
    },

    "Chicken Tikka": {
        required: [
            "chicken",
        ],
        preferred: [
            "chicken tikka",
            "tikka",
        ],
        forbidden: [
            "bratwurst",
            "sausage",
            "nugget",
            "wing",
            "thigh",
            "drumstick",
            "breaded",
            "fried",
        ],
    },

    "Chicken Curry": {
        required: [
            "chicken",
            "curry",
        ],
        preferred: [
            "chicken curry",
            "curry chicken",
        ],
        forbidden: [
            "with rice",
            "bratwurst",
            "sausage",
            "nugget",
            "wing",
            "thigh",
            "drumstick",
            "breaded",
            "burger",
            "sandwich",
        ],
    },

    "Grilled Chicken": {
        required: [
            "chicken",
        ],
        preferred: [
            "grilled chicken",
            "grilled chicken breast",
            "roasted chicken",
        ],
        forbidden: [
            "bratwurst",
            "sausage",
            "nugget",
            "wing",
            "thigh",
            "drumstick",
            "breaded",
            "fried",
        ],
    },

    Fish: {
        required: ["fish"],
        preferred: [
            "fish",
            "cooked",
        ],
        forbidden: [
            "tuna",
            "salmon",
            "fish stick",
            "fish sticks",
            "breaded",
            "fried",
            "nugget",
            "burger",
        ],
    },

    Salmon: {
        required: ["salmon"],
        preferred: [
            "salmon",
            "cooked",
            "raw",
        ],
        forbidden: [
            "nugget",
            "burger",
            "breaded",
            "patty",
            "cake",
        ],
    },

    Prawns: {
        required: [
            "shrimp",
            "prawn",
            "prawns",
        ],
        preferred: [
            "cooked",
        ],
        forbidden: [
            "breaded",
            "fried",
            "burger",
            "soup",
        ],
    },

    Apple: {
        required: ["apple"],
        preferred: [
            "raw",
            "fresh",
        ],
        forbidden: [
            "peel",
            "juice",
            "pie",
            "sauce",
            "cider",
            "jam",
            "cooked",
            "boiled",
        ],
    },

    Banana: {
        required: ["banana"],
        preferred: [
            "raw",
            "fresh",
        ],
        forbidden: [
            "bread",
            "cake",
            "chips",
            "pudding",
            "juice",
        ],
    },

    Guava: {
        required: ["guava"],
        preferred: [
            "raw",
            "fresh",
        ],
        forbidden: [
            "juice",
            "nectar",
            "jam",
        ],
    },

    Orange: {
        required: ["orange"],
        preferred: [
            "raw",
            "fresh",
        ],
        forbidden: [
            "peel",
            "juice",
            "marmalade",
            "soda",
            "drink",
        ],
    },

    Mango: {
        required: ["mango"],
        preferred: [
            "raw",
            "fresh",
        ],
        forbidden: [
            "juice",
            "nectar",
            "syrup",
            "dessert",
        ],
    },

    Papaya: {
        required: ["papaya"],
        preferred: [
            "raw",
            "fresh",
        ],
        forbidden: [
            "juice",
            "nectar",
            "dessert",
        ],
    },

    "Greek Yogurt": {
        required: [
            "greek yogurt",
            "greek yoghurt",
        ],
        preferred: [
            "plain",
        ],
        forbidden: [
            "oats",
            "flavored",
            "ice cream",
            "dessert",
            "drink",
        ],
    },

    Milk: {
        required: ["milk"],
        preferred: [
            "whole milk",
            "raw",
        ],
        forbidden: [
            "chocolate milk",
            "milkshake",
            "ice cream",
            "condensed",
            "evaporated",
            "powder",
        ],
    },

    "Peanut Butter": {
        required: [
            "peanut butter",
        ],
        forbidden: [
            "cookie",
            "candy",
            "bar",
            "ice cream",
        ],
    },

    Almonds: {
        required: [
            "almond",
            "almonds",
        ],
        preferred: [
            "raw",
        ],
        forbidden: [
            "flour",
            "milk",
            "butter",
            "cookie",
            "candy",
        ],
    },

};


// ============================================================
// CHECK USDA CANDIDATE
// ============================================================

const isValidCandidate = (
    catalogItem,
    usdaFood
) => {

    if (!usdaFood) {
        return false;
    }


    const description = normalizeText(
        usdaFood.description || ""
    );


    if (!description) {
        return false;
    }


    const rules =
        FOOD_RULES[catalogItem.name];


    if (!rules) {
        return true;
    }


    // ----------------------------------------------------------
    // Forbidden words
    // ----------------------------------------------------------

    if (
        hasAnyPhrase(
            description,
            rules.forbidden || []
        )
    ) {

        return false;

    }


    // ----------------------------------------------------------
    // Required words
    // ----------------------------------------------------------

    const required =
        rules.required || [];


    if (required.length > 0) {

        const isSpecialAllRequiredFood = [
            "Chicken Curry",
        ].includes(catalogItem.name);


        if (isSpecialAllRequiredFood) {

            const allRequired =
                required.every((word) =>
                    hasPhrase(
                        description,
                        word
                    )
                );


            if (!allRequired) {
                return false;
            }

        } else {

            const hasRequired =
                required.some((word) =>
                    hasPhrase(
                        description,
                        word
                    )
                );


            if (!hasRequired) {
                return false;
            }

        }

    }


    return true;
};


// ============================================================
// SCORE USDA CANDIDATE
// ============================================================

const scoreCandidate = (
    catalogItem,
    usdaFood
) => {

    const description =
        normalizeText(
            usdaFood?.description || ""
        );


    let score = 0;


    const rules =
        FOOD_RULES[catalogItem.name] || {};


    // ----------------------------------------------------------
    // Exact name
    // ----------------------------------------------------------

    if (
        description ===
        normalizeText(catalogItem.name)
    ) {

        score += 300;

    }


    // ----------------------------------------------------------
    // Catalog name contained
    // ----------------------------------------------------------

    if (
        hasPhrase(
            description,
            catalogItem.name
        )
    ) {

        score += 150;

    }


    // ----------------------------------------------------------
    // Preferred words
    // ----------------------------------------------------------

    for (
        const word of rules.preferred || []
    ) {

        if (
            hasPhrase(
                description,
                word
            )
        ) {

            score += 40;

        }

    }


    // ----------------------------------------------------------
    // Required words
    // ----------------------------------------------------------

    for (
        const word of rules.required || []
    ) {

        if (
            hasPhrase(
                description,
                word
            )
        ) {

            score += 60;

        }

    }


    // ----------------------------------------------------------
    // Preparation preference
    // ----------------------------------------------------------

    if (
        description.includes("cooked")
    ) {

        score += 10;

    }


    if (
        description.includes("raw")
    ) {

        score += 10;

    }


    // ----------------------------------------------------------
    // Penalize processed/branded products
    // ----------------------------------------------------------

    if (
        usdaFood.brandName
    ) {

        score -= 15;

    }


    return score;
};


// ============================================================
// NUTRITION VALIDATION
// ============================================================

const hasUsefulNutrition = (nutrition) => {

    if (!nutrition) {
        return false;
    }


    const calories =
        Number(nutrition.calories) || 0;


    const protein =
        Number(nutrition.protein) || 0;


    const carbohydrates =
        Number(nutrition.carbohydrates) || 0;


    const fat =
        Number(nutrition.fat) || 0;


    return (
        calories > 0 ||
        protein > 0 ||
        carbohydrates > 0 ||
        fat > 0
    );
};


// ============================================================
// FIND BEST USDA FOOD
// ============================================================

const findBestUSDAFood = async (
    catalogItem,
    usedFdcIds
) => {

    const queries =
        SEARCH_OVERRIDES[catalogItem.name] ||
        [catalogItem.search];


    const candidates = [];


    // ----------------------------------------------------------
    // Search USDA using all queries
    // ----------------------------------------------------------

    for (
        const query of queries
    ) {

        try {

            console.log(
                `USDA search: "${catalogItem.name}" -> "${query}"`
            );


            const response =
                await searchUSDAFoods(
                    query,
                    20
                );


            const foods =
                response?.foods || [];


            for (
                const food of foods
            ) {

                if (!food?.fdcId) {
                    continue;
                }


                const fdcId =
                    String(food.fdcId);


                // ----------------------------------------------------
                // NEVER reuse an FDC ID
                // ----------------------------------------------------

                if (
                    usedFdcIds.has(fdcId)
                ) {

                    continue;

                }


                // ----------------------------------------------------
                // Don't add same candidate twice
                // ----------------------------------------------------

                if (
                    candidates.some(
                        (item) =>
                            String(item.food.fdcId) ===
                            fdcId
                    )
                ) {

                    continue;

                }


                // ----------------------------------------------------
                // Strict semantic validation
                // ----------------------------------------------------

                if (
                    !isValidCandidate(
                        catalogItem,
                        food
                    )
                ) {

                    continue;

                }


                const score =
                    scoreCandidate(
                        catalogItem,
                        food
                    );


                candidates.push({
                    food,
                    score,
                    query,
                });

            }


        } catch (error) {

            console.error(
                `USDA search failed for "${catalogItem.name}":`,
                error.message
            );

        }

    }


    // ----------------------------------------------------------
    // Highest score first
    // ----------------------------------------------------------

    candidates.sort(
        (a, b) =>
            b.score - a.score
    );


    // ----------------------------------------------------------
    // Print top candidates
    // ----------------------------------------------------------

    console.log(
        `\nCandidates for ${catalogItem.name}:`
    );


    candidates
        .slice(0, 10)
        .forEach(
            (candidate, index) => {

                console.log(
                    `${index + 1}. ${candidate.food.description} | score=${candidate.score} | fdcId=${candidate.food.fdcId}`
                );

            }
        );


    // ----------------------------------------------------------
    // Try candidates one by one
    // ----------------------------------------------------------

    for (
        const candidate of candidates
    ) {

        try {

            console.log(
                `Checking USDA details: ${candidate.food.description}`
            );


            const detailedFood =
                await getUSDAFood(
                    candidate.food.fdcId
                );


            const nutrition =
                extractNutrition(
                    detailedFood
                );


            console.log(
                "Nutrition:",
                nutrition
            );


            if (
                !hasUsefulNutrition(
                    nutrition
                )
            ) {

                console.log(
                    `Skipping ${candidate.food.description}: no usable nutrition`
                );

                continue;

            }


            return {

                food:
                    candidate.food,

                detailedFood,

                nutrition,

                score:
                    candidate.score,

            };

        } catch (error) {

            console.error(
                `Failed USDA details for ${candidate.food.fdcId}:`,
                error.message
            );

        }

    }


    return null;
};


// ============================================================
// FOOD PREFERENCE DETECTION
// ============================================================

const detectPreference = (food) => {

    const text =
        normalizeText(
            `${food?.description || ""} ${food?.foodCategory || ""}`
        );


    if (
        hasAnyPhrase(
            text,
            [
                "egg",
            ]
        )
    ) {

        return "Eggitarian";

    }


    if (
        hasAnyPhrase(
            text,
            [
                "chicken",
                "fish",
                "salmon",
                "shrimp",
                "prawn",
                "beef",
                "pork",
                "mutton",
                "lamb",
                "turkey",
            ]
        )
    ) {

        return "Non-Vegetarian";

    }


    if (
        hasAnyPhrase(
            text,
            [
                "milk",
                "cheese",
                "yogurt",
                "yoghurt",
                "paneer",
                "butter",
            ]
        )
    ) {

        return "Vegetarian";

    }


    return "Vegan";
};


// ============================================================
// PRICE
// ============================================================

const estimateFoodPrice = (
    foodName
) => {

    const item =
        FOOD_CATALOG.find(
            (item) =>
                normalizeText(item.name) ===
                normalizeText(foodName)
        );


    return item?.price || 50;
};


// ============================================================
// SYNC FOOD CATALOG
// ============================================================

const syncFoodCatalog = async () => {

    console.log(
        "\n=============================================="
    );


    console.log(
        "STARTING FOOD CATALOG SYNCHRONIZATION"
    );


    console.log(
        "==============================================\n"
    );


    const summary = {

        created: 0,

        updated: 0,

        skipped: 0,

        failed: 0,

        details: [],

    };


    // ----------------------------------------------------------
    // Existing foods
    // ----------------------------------------------------------

    const existingFoods =
        await Food.find({});


    // ----------------------------------------------------------
    // Used USDA IDs
    // ----------------------------------------------------------

    const usedFdcIds =
        new Set(

            existingFoods

                .filter(
                    (food) =>
                        food.fdcId
                )

                .map(
                    (food) =>
                        String(food.fdcId)
                )

        );


    // ----------------------------------------------------------
    // Used images
    // ----------------------------------------------------------

    const usedImageUrls =
        new Set(

            existingFoods

                .filter(
                    (food) =>
                        food.image
                )

                .map(
                    (food) =>
                        food.image
                )

        );


    console.log(
        `Existing foods: ${existingFoods.length}`
    );


    console.log(
        `Used USDA IDs: ${usedFdcIds.size}`
    );


    // ==========================================================
    // PROCESS CATALOG
    // ==========================================================

    for (
        const catalogItem of FOOD_CATALOG
    ) {

        console.log(
            "\n----------------------------------------------"
        );


        console.log(
            `Processing: ${catalogItem.name}`
        );


        console.log(
            "----------------------------------------------"
        );


        try {

            // ------------------------------------------------------
            // Find existing food
            // ------------------------------------------------------

            const catalogKey =
                createCatalogKey(
                    catalogItem.name
                );


            const existingFood =
                await Food.findOne({
                    $or: [
                        {
                            catalogKey,
                        },
                        {
                            name: catalogItem.name,
                            catalogKey: {
                                $exists: false,
                            },
                        },
                        {
                            name: catalogItem.name,
                            catalogKey: null,
                        },
                    ],
                });


            // ------------------------------------------------------
            // Existing USDA ID
            // ------------------------------------------------------

            const previousFdcId =
                existingFood?.fdcId
                    ? String(existingFood.fdcId)
                    : null;


            if (previousFdcId) {

                usedFdcIds.delete(
                    previousFdcId
                );

            }


            // ------------------------------------------------------
            // Find USDA match
            // ------------------------------------------------------

            const match =
                await findBestUSDAFood(
                    catalogItem,
                    usedFdcIds
                );


            // ------------------------------------------------------
            // No reliable match
            // ------------------------------------------------------

            if (!match) {

                console.log(
                    `❌ No reliable USDA match for ${catalogItem.name}`
                );


                if (previousFdcId) {

                    usedFdcIds.add(
                        previousFdcId
                    );

                }


                summary.skipped++;


                summary.details.push({

                    name:
                        catalogItem.name,

                    status:
                        "skipped",

                    reason:
                        "No reliable USDA match with usable nutrition",

                });


                continue;

            }


            const {
                food: usdaFood,
                detailedFood,
                nutrition,
                score,
            } = match;


            const fdcId =
                Number(
                    detailedFood.fdcId ||
                    usdaFood.fdcId
                );


            console.log(
                `✅ Selected: ${detailedFood.description}`
            );


            console.log(
                `FDC ID: ${fdcId}`
            );


            console.log(
                `Score: ${score}`
            );


            // ------------------------------------------------------
            // Final duplicate check
            // ------------------------------------------------------

            const duplicate =
                await Food.findOne({
                    fdcId,
                });


            if (
                duplicate &&
                (
                    !existingFood ||
                    String(duplicate._id) !==
                    String(existingFood._id)
                )
            ) {

                console.log(
                    `⚠️ FDC ID ${fdcId} already belongs to ${duplicate.name}`
                );


                if (previousFdcId) {

                    usedFdcIds.add(
                        previousFdcId
                    );

                }


                summary.skipped++;


                summary.details.push({

                    name:
                        catalogItem.name,

                    status:
                        "skipped",

                    reason:
                        `USDA food already used by ${duplicate.name}`,

                    fdcId,

                });


                continue;

            }


            // ======================================================
            // IMAGE
            // ======================================================

            let imageData = null;


            // ------------------------------------------------------
            // IMPORTANT:
            //
            // Do NOT trust imageSource alone.
            //
            // Example of BAD database data:
            //
            // image:
            // https://example.com/paneer-tikka.jpg
            //
            // imageSource:
            // Pexels
            //
            // This is NOT a Pexels image.
            //
            // Therefore we check the actual URL.
            // ------------------------------------------------------

            const existingImage =
                existingFood?.image || "";


            const isValidPexelsImage =
                typeof existingImage === "string" &&
                existingImage.startsWith(
                    "https://images.pexels.com/"
                );


            if (
                existingImage &&
                isValidPexelsImage
            ) {

                console.log(
                    `✅ Keeping existing Pexels image for ${catalogItem.name}`
                );


                imageData = {

                    url:
                        existingImage,

                    source:
                        "Pexels",

                    photographer:
                        existingFood.imagePhotographer ||
                        existingFood.photographer ||
                        "",

                    photographerUrl:
                        existingFood.imagePhotographerUrl ||
                        "",

                    pageUrl:
                        existingFood.imagePageUrl ||
                        "",

                };

            } else {

                if (existingImage) {

                    console.log(
                        `🔄 Replacing invalid image for ${catalogItem.name}: ${existingImage}`
                    );

                } else {

                    console.log(
                        `🖼️ Searching image for ${catalogItem.name}`
                    );

                }


                imageData =
                    await searchFoodImage(

                        catalogItem.imageQuery ||
                        catalogItem.name,

                        usedImageUrls

                    );

            }


            if (
                imageData?.url
            ) {

                usedImageUrls.add(
                    imageData.url
                );

            }


            // ======================================================
            // FOOD DATA
            // ======================================================

            const foodData = {

                name:
                    catalogItem.name,

                catalogKey,

                description:
                    detailedFood.description ||
                    catalogItem.name,

                category:
                    catalogItem.category ||
                    "Other",

                price:
                    catalogItem.price ||
                    estimateFoodPrice(
                        catalogItem.name
                    ),

                servingSize:
                    detailedFood.servingSize ||
                    100,

                servingUnit:
                    detailedFood.servingSizeUnit ||
                    "g",

                fdcId,

                foodPreference:
                    catalogItem.preference ||
                    detectPreference(
                        detailedFood
                    ),

                nutrition: {

                    calories:
                        Number(
                            nutrition.calories
                        ) || 0,

                    protein:
                        Number(
                            nutrition.protein
                        ) || 0,

                    carbohydrates:
                        Number(
                            nutrition.carbohydrates
                        ) || 0,

                    fat:
                        Number(
                            nutrition.fat
                        ) || 0,

                    fiber:
                        Number(
                            nutrition.fiber
                        ) || 0,

                    sugar:
                        Number(
                            nutrition.sugar
                        ) || 0,

                    sodium:
                        Number(
                            nutrition.sodium
                        ) || 0,

                },

                source:
                    "USDA",

                sourceUpdatedAt:
                    new Date(),

                isAvailable:
                    existingFood?.isAvailable ??
                    true,

            };


            // ======================================================
            // SAVE IMAGE
            // ======================================================

            if (
                imageData?.url
            ) {

                foodData.image =
                    imageData.url;


                foodData.imageSource =
                    imageData.source ||
                    "Pexels";


                foodData.imagePhotographer =
                    imageData.photographer ||
                    "";


                foodData.imagePhotographerUrl =
                    imageData.photographerUrl ||
                    "";


                foodData.imagePageUrl =
                    imageData.pageUrl ||
                    "";

            }


            // ======================================================
            // UPDATE
            // ======================================================

            if (existingFood) {

                existingFood.set(
                    foodData
                );


                await existingFood.save();


                usedFdcIds.add(
                    String(fdcId)
                );


                summary.updated++;


                summary.details.push({

                    name:
                        catalogItem.name,

                    status:
                        "updated",

                    fdcId,

                    usdaName:
                        detailedFood.description,

                    nutrition,

                });


                console.log(
                    `✅ Updated ${catalogItem.name}`
                );

            }


            // ======================================================
            // CREATE
            // ======================================================

            else {

                await Food.create(
                    foodData
                );


                usedFdcIds.add(
                    String(fdcId)
                );


                summary.created++;


                summary.details.push({

                    name:
                        catalogItem.name,

                    status:
                        "created",

                    fdcId,

                    usdaName:
                        detailedFood.description,

                    nutrition,

                });


                console.log(
                    `✅ Created ${catalogItem.name}`
                );

            }


        } catch (error) {

            console.error(
                `❌ Failed ${catalogItem.name}:`,
                error.message
            );


            summary.failed++;


            summary.details.push({

                name:
                    catalogItem.name,

                status:
                    "failed",

                reason:
                    error.message,

            });

        }

    }


    // ==========================================================
    // FINAL SUMMARY
    // ==========================================================

    console.log(
        "\n=============================================="
    );


    console.log(
        "FOOD CATALOG SYNCHRONIZATION COMPLETE"
    );


    console.log(
        "=============================================="
    );


    console.log(
        `Created: ${summary.created}`
    );


    console.log(
        `Updated: ${summary.updated}`
    );


    console.log(
        `Skipped: ${summary.skipped}`
    );


    console.log(
        `Failed: ${summary.failed}`
    );


    console.log(
        `Total: ${FOOD_CATALOG.length}`
    );


    console.log(
        "==============================================\n"
    );


    // ----------------------------------------------------------
    // Your existing controller expects an ARRAY.
    // ----------------------------------------------------------

    const finalResults =
        summary.details;


    finalResults.success =
        true;


    finalResults.created =
        summary.created;


    finalResults.updated =
        summary.updated;


    finalResults.skipped =
        summary.skipped;


    finalResults.failed =
        summary.failed;


    finalResults.totalProcessed =
        FOOD_CATALOG.length;


    return finalResults;
};


// ============================================================
// SYNC ARBITRARY USDA FOODS
// ============================================================

const syncFoods = async (
    query,
    pageSize = 20
) => {

    try {

        console.log(
            `Searching USDA for: ${query}`
        );


        const response =
            await searchUSDAFoods(
                query,
                pageSize
            );


        const foods =
            response?.foods || [];


        const syncedFoods = [];


        for (
            const food of foods
        ) {

            try {

                if (!food?.fdcId) {
                    continue;
                }


                const detailedFood =
                    await getUSDAFood(
                        food.fdcId
                    );


                const nutrition =
                    extractNutrition(
                        detailedFood
                    );


                if (
                    !hasUsefulNutrition(
                        nutrition
                    )
                ) {

                    continue;

                }


                const fdcId =
                    Number(
                        detailedFood.fdcId
                    );


                // --------------------------------------------------
                // Search image for arbitrary USDA food
                // --------------------------------------------------

                const imageData =
                    await searchFoodImage(
                        detailedFood.description,
                        new Set()
                    );


                const foodData = {

                    name:
                        detailedFood.description,

                    description:
                        detailedFood.description,

                    category:
                        detailedFood.foodCategory ||
                        "Other",

                    price:
                        estimateFoodPrice(
                            detailedFood.description
                        ),

                    servingSize:
                        detailedFood.servingSize ||
                        100,

                    servingUnit:
                        detailedFood.servingSizeUnit ||
                        "g",

                    fdcId,

                    foodPreference:
                        detectPreference(
                            detailedFood
                        ),

                    nutrition: {

                        calories:
                            Number(
                                nutrition.calories
                            ) || 0,

                        protein:
                            Number(
                                nutrition.protein
                            ) || 0,

                        carbohydrates:
                            Number(
                                nutrition.carbohydrates
                            ) || 0,

                        fat:
                            Number(
                                nutrition.fat
                            ) || 0,

                        fiber:
                            Number(
                                nutrition.fiber
                            ) || 0,

                        sugar:
                            Number(
                                nutrition.sugar
                            ) || 0,

                        sodium:
                            Number(
                                nutrition.sodium
                            ) || 0,

                    },

                    source:
                        "USDA",

                    sourceUpdatedAt:
                        new Date(),

                    isAvailable:
                        true,

                };


                // --------------------------------------------------
                // Add image
                // --------------------------------------------------

                if (
                    imageData?.url
                ) {

                    foodData.image =
                        imageData.url;


                    foodData.imageSource =
                        imageData.source ||
                        "Pexels";


                    foodData.imagePhotographer =
                        imageData.photographer ||
                        "";


                    foodData.imagePhotographerUrl =
                        imageData.photographerUrl ||
                        "";


                    foodData.imagePageUrl =
                        imageData.pageUrl ||
                        "";

                }


                const existingFood =
                    await Food.findOne({
                        fdcId,
                    });


                if (existingFood) {

                    existingFood.set(
                        foodData
                    );


                    await existingFood.save();

                } else {

                    await Food.create(
                        foodData
                    );

                }


                syncedFoods.push(
                    foodData
                );


            } catch (error) {

                console.error(
                    `Failed to sync ${food.description}:`,
                    error.message
                );

            }

        }


        return {

            success:
                true,

            query,

            count:
                syncedFoods.length,

            foods:
                syncedFoods,

        };


    } catch (error) {

        console.error(
            "syncFoods error:",
            error.message
        );


        throw error;

    }

};


// ============================================================
// CLEAN DUPLICATE FOODFIT CATALOG ITEMS
// ============================================================

const cleanupFoodCatalogDuplicates = async () => {

    try {

        console.log(
            "\n=============================================="
        );


        console.log(
            "Starting FoodFit catalog duplicate cleanup..."
        );


        console.log(
            "==============================================\n"
        );


        let removed = 0;

        let updated = 0;


        for (
            const catalogItem of FOOD_CATALOG
        ) {

            const catalogKey =
                createCatalogKey(
                    catalogItem.name
                );


            // Find every record belonging to this catalog item.
            const foods =
                await Food.find({
                    $or: [
                        {
                            catalogKey,
                        },
                        {
                            name:
                                catalogItem.name,
                        },
                    ],
                }).sort({
                    createdAt: 1,
                });


            if (
                foods.length === 0
            ) {

                console.log(
                    `⚠️ No record found: ${catalogItem.name}`
                );


                continue;

            }


            // Keep the first/oldest record.
            const keeper =
                foods[0];


            // Give the keeper its permanent catalogKey.
            keeper.catalogKey =
                catalogKey;


            await keeper.save();


            updated++;


            // Delete all additional duplicate records.
            if (
                foods.length > 1
            ) {

                for (
                    let i = 1;
                    i < foods.length;
                    i++
                ) {

                    await Food.deleteOne({
                        _id:
                            foods[i]._id,
                    });


                    removed++;


                    console.log(
                        `🗑️ Removed duplicate: ${catalogItem.name}`
                    );

                }

            }


            console.log(
                `✅ Kept: ${catalogItem.name} | catalogKey: ${catalogKey}`
            );

        }


        console.log(
            "\n=============================================="
        );


        console.log(
            "Catalog cleanup completed"
        );


        console.log(
            `Updated: ${updated}`
        );


        console.log(
            `Removed: ${removed}`
        );


        console.log(
            "==============================================\n"
        );


        return {

            success: true,

            updated,

            removed,

        };


    } catch (error) {

        console.error(
            "Catalog cleanup error:",
            error
        );


        throw error;

    }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    syncFoods,

    syncFoodCatalog,

    detectPreference,

    cleanupFoodCatalogDuplicates,

};