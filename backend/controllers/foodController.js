const Food = require("../models/Food");

const {
  searchUSDAFoods,
  getUSDAFood,
} = require("../services/usdaService");

const {
  extractNutrition,
} = require("../services/nutritionService");

const {
  syncFoods,
  syncFoodCatalog,
  cleanupFoodCatalogDuplicates,
} = require("../services/foodSyncService");

const bulkSynchronizeFoods = async (req, res) => {
  try {
    const queries = [
      "chicken",
      "paneer",
      "rice",
      "dal",
      "egg",
      "oats",
      "milk",
      "apple",
      "banana",
      "broccoli",
      "potato",
      "tomato",
      "tofu",
      "salmon",
      "fish",
      "peanuts",
      "almonds",
      "yogurt",
      "roti",
      "chickpeas",
    ];

    const allResults = [];

    for (const query of queries) {
      try {
        console.log(`Syncing: ${query}`);

        const results = await syncFoods(query, 3);

        // Make sure results is an array
        if (Array.isArray(results)) {
          allResults.push(...results);
        } else {
          console.log(
            `Unexpected result for ${query}:`,
            results
          );
        }

      } catch (error) {
        console.error(
          `Failed to sync ${query}:`,
          error.message
        );
      }
    }

    res.json({
      success: true,
      message: "Bulk food synchronization completed",
      count: allResults.length,
      results: allResults,
    });

  } catch (error) {
    console.error("Bulk sync error:", error);

    res.status(500).json({
      success: false,
      message: "Bulk food synchronization failed",
      error: error.message,
    });
  }
};


const cleanupCatalog = async (req, res) => {
  try {
    const result =
      await cleanupFoodCatalogDuplicates();

    res.json({
      message:
        "FoodFit catalog cleanup completed",
      ...result,
    });
  } catch (error) {
    console.error(
      "Cleanup controller error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to clean FoodFit catalog",
      error: error.message,
    });
  }
};

// ============================================================
// SEARCH USDA FOODS
// ============================================================

const searchFoods = async (req, res) => {
  try {
    const {
      query,
      pageSize = 20,
    } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const data = await searchUSDAFoods(
      query.trim(),
      Number(pageSize)
    );

    return res.json({
      success: true,
      foods: data.foods || [],
      totalHits: data.totalHits || 0,
    });

  } catch (error) {
    console.error(
      "Search foods error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to search foods",
    });
  }
};


// ============================================================
// IMPORT ONE USDA FOOD
// ============================================================

const importFood = async (req, res) => {
  try {
    const {
      fdcId,
    } = req.params;

    if (!fdcId) {
      return res.status(400).json({
        success: false,
        message: "FDC ID is required",
      });
    }

    const detailedFood =
      await getUSDAFood(
        Number(fdcId)
      );

    if (!detailedFood) {
      return res.status(404).json({
        success: false,
        message: "USDA food not found",
      });
    }

    const nutrition =
      extractNutrition(
        detailedFood
      );

    const foodData = {
      name:
        detailedFood.description,

      description:
        detailedFood.description || "",

      category:
        detailedFood.foodCategory ||
        "Other",

      price: 50,

      servingSize:
        detailedFood.servingSize ||
        100,

      servingUnit:
        detailedFood.servingSizeUnit ||
        "g",

      fdcId:
        Number(detailedFood.fdcId),

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

    // ----------------------------------------------------------
    // IMPORTANT
    //
    // Import by FDC ID.
    // This does NOT create a FoodFit catalogKey.
    // Therefore arbitrary USDA imports will not appear
    // in Discover.
    // ----------------------------------------------------------

    const food =
      await Food.findOneAndUpdate(
        {
          fdcId:
            Number(detailedFood.fdcId),
        },
        {
          $set: foodData,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Food imported successfully",
      food,
    });

  } catch (error) {
    console.error(
      "Import food error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to import food",
    });
  }
};


// ============================================================
// GET FOODFIT FOODS
// ============================================================

const getFoods = async (req, res) => {
  try {
    const {
      preference,
      category,
      maxPrice,
      search,
      available,
    } = req.query;

    // ==========================================================
    // IMPORTANT
    //
    // Discover should ONLY show FoodFit catalog foods.
    //
    // Arbitrary USDA foods imported through syncFoods()
    // do not have catalogKey and therefore will not appear.
    // ==========================================================

    const filter = {
      catalogKey: {
        $exists: true,
        $ne: "",
      },
      isAvailable: true,
    };

    if (preference) {
      filter.foodPreference = preference;
    }

    if (category) {
      filter.category = category;
    }

    if (maxPrice) {
      filter.price = {
        $lte: Number(maxPrice),
      };
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // ----------------------------------------------------------
    // Preference
    // ----------------------------------------------------------

    if (preference) {
      filter.foodPreference =
        preference;
    }

    // ----------------------------------------------------------
    // Category
    // ----------------------------------------------------------

    if (category) {
      filter.category =
        category;
    }

    // ----------------------------------------------------------
    // Maximum price
    // ----------------------------------------------------------

    if (
      maxPrice !== undefined &&
      maxPrice !== ""
    ) {
      const parsedMaxPrice =
        Number(maxPrice);

      if (
        !Number.isNaN(
          parsedMaxPrice
        )
      ) {
        filter.price = {
          $lte:
            parsedMaxPrice,
        };
      }
    }

    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    if (
      search &&
      search.trim()
    ) {
      filter.name = {
        $regex:
          search.trim(),
        $options: "i",
      };
    }

    // ----------------------------------------------------------
    // Availability
    // ----------------------------------------------------------

    if (
      available !== undefined
    ) {
      filter.isAvailable =
        available === "true";
    }

    // ----------------------------------------------------------
    // Get catalog
    // ----------------------------------------------------------

    const foods =
      await Food.find(filter)
        .sort({
          name: 1,
        })
        .limit(100);

    return res.json({
      success: true,
      count:
        foods.length,
      foods,
    });

  } catch (error) {
    console.error(
      "Get foods error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch foods",
      error:
        error.message,
    });
  }
};


// ============================================================
// GET ONE FOOD
// ============================================================

const getFoodById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const food =
      await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message:
          "Food not found",
      });
    }

    return res.json({
      success: true,
      food,
    });

  } catch (error) {
    console.error(
      "Get food by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch food",
      error:
        error.message,
    });
  }
};


// ============================================================
// CREATE FOOD
// ============================================================

const createFood = async (
  req,
  res
) => {
  try {
    const {
      name,
      catalogKey,
      description,
      category,
      price,
      servingSize,
      servingUnit,
      image,
      imageSource,
      imagePhotographer,
      imagePhotographerUrl,
      imagePageUrl,
      foodPreference,
      nutrition,
      source,
      sourceUpdatedAt,
      isAvailable,
      fdcId,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Food name is required",
      });
    }

    // ----------------------------------------------------------
    // If this is a catalog item, prevent duplicate catalogKey.
    // ----------------------------------------------------------

    if (catalogKey) {
      const existingCatalogFood =
        await Food.findOne({
          catalogKey:
            catalogKey.trim(),
        });

      if (existingCatalogFood) {
        return res.status(409).json({
          success: false,
          message:
            "A food with this catalog key already exists",
          food:
            existingCatalogFood,
        });
      }
    }

    // ----------------------------------------------------------
    // If FDC ID already exists, don't create duplicate.
    // ----------------------------------------------------------

    if (fdcId) {
      const existingFdcFood =
        await Food.findOne({
          fdcId:
            Number(fdcId),
        });

      if (existingFdcFood) {
        return res.status(409).json({
          success: false,
          message:
            "A food with this USDA FDC ID already exists",
          food:
            existingFdcFood,
        });
      }
    }

    const food =
      await Food.create({
        name:
          name.trim(),

        catalogKey:
          catalogKey ||
          undefined,

        description:
          description || "",

        category:
          category ||
          "Other",

        price:
          Number(price) || 0,

        servingSize:
          Number(servingSize) ||
          100,

        servingUnit:
          servingUnit ||
          "g",

        image:
          image || "",

        imageSource:
          imageSource || "",

        imagePhotographer:
          imagePhotographer || "",

        imagePhotographerUrl:
          imagePhotographerUrl || "",

        imagePageUrl:
          imagePageUrl || "",

        foodPreference:
          foodPreference ||
          "Unknown",

        nutrition: {
          calories:
            Number(
              nutrition?.calories
            ) || 0,

          protein:
            Number(
              nutrition?.protein
            ) || 0,

          carbohydrates:
            Number(
              nutrition?.carbohydrates
            ) || 0,

          fat:
            Number(
              nutrition?.fat
            ) || 0,

          fiber:
            Number(
              nutrition?.fiber
            ) || 0,

          sugar:
            Number(
              nutrition?.sugar
            ) || 0,

          sodium:
            Number(
              nutrition?.sodium
            ) || 0,
        },

        source:
          source ||
          "FoodFit",

        sourceUpdatedAt:
          sourceUpdatedAt
            ? new Date(
              sourceUpdatedAt
            )
            : undefined,

        fdcId:
          fdcId
            ? Number(fdcId)
            : undefined,

        isAvailable:
          isAvailable ??
          true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Food created successfully",
      food,
    });

  } catch (error) {
    console.error(
      "Create food error:",
      error
    );

    // MongoDB duplicate key
    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A food with this catalog key or USDA FDC ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create food",
      error:
        error.message,
    });
  }
};


// ============================================================
// UPDATE FOOD
// ============================================================

const updateFood = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const existingFood =
      await Food.findById(id);

    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message:
          "Food not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    // ----------------------------------------------------------
    // Don't accidentally convert an empty catalogKey to "".
    // ----------------------------------------------------------

    if (
      updateData.catalogKey === ""
    ) {
      delete updateData.catalogKey;
    }

    // ----------------------------------------------------------
    // Normalize numeric values
    // ----------------------------------------------------------

    if (
      updateData.price !== undefined
    ) {
      updateData.price =
        Number(
          updateData.price
        ) || 0;
    }

    if (
      updateData.servingSize !==
      undefined
    ) {
      updateData.servingSize =
        Number(
          updateData.servingSize
        ) || 100;
    }

    if (
      updateData.fdcId !== undefined &&
      updateData.fdcId !== null &&
      updateData.fdcId !== ""
    ) {
      updateData.fdcId =
        Number(
          updateData.fdcId
        );
    }

    // ----------------------------------------------------------
    // Nutrition
    // ----------------------------------------------------------

    if (
      updateData.nutrition
    ) {
      updateData.nutrition = {
        calories:
          Number(
            updateData.nutrition
              .calories
          ) || 0,

        protein:
          Number(
            updateData.nutrition
              .protein
          ) || 0,

        carbohydrates:
          Number(
            updateData.nutrition
              .carbohydrates
          ) || 0,

        fat:
          Number(
            updateData.nutrition
              .fat
          ) || 0,

        fiber:
          Number(
            updateData.nutrition
              .fiber
          ) || 0,

        sugar:
          Number(
            updateData.nutrition
              .sugar
          ) || 0,

        sodium:
          Number(
            updateData.nutrition
              .sodium
          ) || 0,
      };
    }

    // ----------------------------------------------------------
    // Prevent catalogKey collision
    // ----------------------------------------------------------

    if (
      updateData.catalogKey &&
      updateData.catalogKey !==
      existingFood.catalogKey
    ) {
      const duplicate =
        await Food.findOne({
          catalogKey:
            updateData.catalogKey,
          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another food already uses this catalog key",
        });
      }
    }

    // ----------------------------------------------------------
    // Prevent FDC ID collision
    // ----------------------------------------------------------

    if (
      updateData.fdcId &&
      updateData.fdcId !==
      existingFood.fdcId
    ) {
      const duplicate =
        await Food.findOne({
          fdcId:
            updateData.fdcId,
          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another food already uses this USDA FDC ID",
        });
      }
    }

    const food =
      await Food.findByIdAndUpdate(
        id,
        {
          $set:
            updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    return res.json({
      success: true,
      message:
        "Food updated successfully",
      food,
    });

  } catch (error) {
    console.error(
      "Update food error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate catalog key or USDA FDC ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update food",
      error:
        error.message,
    });
  }
};


// ============================================================
// DELETE FOOD
// ============================================================

const deleteFood = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const food =
      await Food.findByIdAndDelete(
        id
      );

    if (!food) {
      return res.status(404).json({
        success: false,
        message:
          "Food not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Food deleted successfully",
      food,
    });

  } catch (error) {
    console.error(
      "Delete food error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete food",
      error:
        error.message,
    });
  }
};


// ============================================================
// SYNCHRONIZE ARBITRARY USDA FOODS
// ============================================================

const synchronizeFoods = async (
  req,
  res
) => {
  try {
    const {
      query,
      pageSize = 20,
    } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Query is required",
      });
    }

    const result =
      await syncFoods(
        query.trim(),
        Number(pageSize)
      );

    return res.json(result);

  } catch (error) {
    console.error(
      "Synchronize foods error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to synchronize foods",
    });
  }
};


// ============================================================
// SYNCHRONIZE FOODFIT CATALOG
// ============================================================

const synchronizeFoodCatalog = async (
  req,
  res
) => {
  try {
    console.log(
      "Starting FoodFit catalog synchronization..."
    );

    const result =
      await syncFoodCatalog();

    // syncFoodCatalog() returns an array
    // with summary properties attached.
    const details =
      Array.isArray(result)
        ? result
        : [];

    return res.json({
      success:
        result?.success ??
        true,

      message:
        "FoodFit catalog synchronized successfully",

      created:
        result?.created ??
        details.filter(
          (item) =>
            item.status ===
            "created"
        ).length,

      updated:
        result?.updated ??
        details.filter(
          (item) =>
            item.status ===
            "updated"
        ).length,

      skipped:
        result?.skipped ??
        details.filter(
          (item) =>
            item.status ===
            "skipped"
        ).length,

      failed:
        result?.failed ??
        details.filter(
          (item) =>
            item.status ===
            "failed"
        ).length,

      totalProcessed:
        result?.totalProcessed ??
        details.length,

      results:
        details,
    });

  } catch (error) {
    console.error(
      "Synchronize FoodFit catalog error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to synchronize FoodFit catalog",
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  searchFoods,
  importFood,
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  synchronizeFoods,
  synchronizeFoodCatalog,
  synchronizeFoodCatalog,
  cleanupCatalog,
  bulkSynchronizeFoods,
};