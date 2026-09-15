import React, { useState } from "react";
import { Link } from "react-router-dom";
import { addToCart } from "../api/cartApi";

const FoodCard = ({ food }) => {
  const nutrition = food.nutrition || {};
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (adding) return;

    try {
      setAdding(true);

      await addToCart(food._id);

      // Tell the global cart bar that the cart has changed.
      window.dispatchEvent(new Event("cartUpdated"));

      alert(`${food.name} added to cart`);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to add item"
      );
    } finally {
      setAdding(false);
    }
  };

  const hasImage =
    food.image &&
    typeof food.image === "string" &&
    food.image.trim() !== "" &&
    !imageError;

  const calories = Math.round(
    Number(nutrition.calories) || 0
  );

  const protein = Math.round(
    Number(nutrition.protein) || 0
  );

  const carbs = Math.round(
    Number(nutrition.carbohydrates) || 0
  );

  return (
    <Link
      to={`/foods/${food._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-green-200 hover:shadow-xl hover:shadow-green-100/40"
    >
      {/* =====================================
          IMAGE
      ====================================== */}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">

        {hasImage ? (
          <img
            src={food.image}
            alt={food.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="text-3xl">🍽️</span>
            </div>

            <span className="mt-3 text-xs font-medium text-gray-400">
              Image unavailable
            </span>
          </div>
        )}

        {/* Image Overlay */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* =====================================
            CleanCRAVE SCORE
        ====================================== */}

        {food.recommendationScore !== undefined && (
          <div className="absolute left-3 top-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-green-700 shadow-md backdrop-blur-md">
              <span>⭐</span>

              <span>
                {Math.round(
                  Number(food.recommendationScore) || 0
                )}
              </span>

              <span className="font-medium text-green-600">
                match
              </span>
            </div>
          </div>
        )}

        {/* =====================================
            FOOD PREFERENCE
        ====================================== */}

        {food.foodPreference && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-gray-700 shadow-md backdrop-blur-md">
              {food.foodPreference}
            </span>
          </div>
        )}

        {/* =====================================
            PRICE OVER IMAGE
        ====================================== */}

        <div className="absolute bottom-3 right-3">
          <div className="rounded-xl bg-white px-3 py-2 shadow-lg">
            <span className="text-sm font-extrabold text-green-600">
              ₹{food.price}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================
          CONTENT
      ====================================== */}

      <div className="flex flex-1 flex-col p-4 sm:p-5">

        {/* Name + Category */}

        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-tight text-gray-900 sm:text-lg">
            {food.name}
          </h3>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              {food.category || "Healthy choice"}
            </span>

            <span className="h-1 w-1 rounded-full bg-gray-300" />

            <span className="text-xs text-gray-400">
              {food.servingSize || 100}
              {food.servingUnit || "g"}
            </span>
          </div>
        </div>

        {/* =====================================
            NUTRITION
        ====================================== */}

        <div className="mt-5 grid grid-cols-3 gap-2">

          <Nutrition
            label="Calories"
            value={calories}
            unit="kcal"
          />

          <Nutrition
            label="Protein"
            value={protein}
            unit="g"
            highlight
          />

          <Nutrition
            label="Carbs"
            value={carbs}
            unit="g"
          />

        </div>

        {/* =====================================
            WHY RECOMMENDED
        ====================================== */}

        {food.recommendationReasons?.length > 0 && (
          <div className="mt-4 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-3.5">

            <div className="flex items-start gap-2">

              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <span className="text-xs">✨</span>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">
                  Recommended for you
                </p>

                <p className="mt-1 text-xs leading-5 text-green-700/80">
                  {food.recommendationReasons[0]}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =====================================
            BOTTOM ACTION
        ====================================== */}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Serving
            </p>

            <p className="mt-0.5 text-xs font-semibold text-gray-600">
              {food.servingSize || 100}
              {food.servingUnit || "g"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className={`flex min-w-[90px] items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 ${
              adding
                ? "cursor-not-allowed bg-green-400"
                : "bg-green-600 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md hover:shadow-green-200"
            }`}
          >
            {adding ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-30"
                  />

                  <path
                    d="M21 12a9 9 0 0 1-9 9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

                Adding
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>

                Add
              </>
            )}
          </button>

        </div>
      </div>
    </Link>
  );
};

/* ==========================================
   NUTRITION COMPONENT
========================================== */

const Nutrition = ({
  label,
  value,
  unit,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl px-2 py-3 text-center transition-colors ${
        highlight
          ? "bg-green-50"
          : "bg-gray-50 group-hover:bg-gray-100/80"
      }`}
    >
      <p
        className={`text-sm font-extrabold ${
          highlight
            ? "text-green-700"
            : "text-gray-800"
        }`}
      >
        {value}

        <span
          className={`ml-0.5 text-[9px] font-medium ${
            highlight
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {unit}
        </span>
      </p>

      <p className="mt-0.5 text-[9px] font-medium text-gray-400 sm:text-[10px]">
        {label}
      </p>
    </div>
  );
};

export default FoodCard;