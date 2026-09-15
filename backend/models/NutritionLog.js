const mongoose = require("mongoose");

const nutritionLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        
        spent: {
            type: Number,
            default: 0,
        },

        date: {
            type: String,
            required: true,
        },

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
    },
    {
        timestamps: true,
    }
);

nutritionLogSchema.index(
    { user: 1, date: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "NutritionLog",
    nutritionLogSchema
);