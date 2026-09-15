const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    // USDA FoodData Central ID
    fdcId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // Display name used by FoodFit
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique identifier for FoodFit catalog items.
    // Example:
    // Paneer        -> paneer
    // Chicken Breast -> chicken-breast
    // Greek Yogurt  -> greek-yogurt
    //
    // Arbitrary USDA foods imported through syncFoods()
    // do not need this field.
    catalogKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "Other",
    },

    // FoodFit selling price
    price: {
      type: Number,
      required: true,
      default: 0,
    },

    servingSize: {
      type: Number,
      default: 100,
    },

    servingUnit: {
      type: String,
      default: "g",
    },

    image: {
      type: String,
      default: "",
    },

    imageSource: {
      type: String,
      default: "",
    },

    imagePhotographer: {
      type: String,
      default: "",
    },

    imagePhotographerUrl: {
      type: String,
      default: "",
    },

    imagePageUrl: {
      type: String,
      default: "",
    },

    foodPreference: {
      type: String,
      enum: [
        "Vegetarian",
        "Non-Vegetarian",
        "Vegan",
        "Eggitarian",
        "Unknown",
      ],
      default: "Unknown",
    },

    nutrition: {
      calories: {
        type: Number,
        default: 0,
      },

      protein: {
        type: Number,
        default: 0,
      },

      carbohydrates: {
        type: Number,
        default: 0,
      },

      fat: {
        type: Number,
        default: 0,
      },

      fiber: {
        type: Number,
        default: 0,
      },

      sugar: {
        type: Number,
        default: 0,
      },

      sodium: {
        type: Number,
        default: 0,
      },
    },

    source: {
      type: String,
      default: "USDA FoodData Central",
    },

    sourceUpdatedAt: {
      type: Date,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Food", foodSchema);