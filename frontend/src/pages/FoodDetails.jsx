import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";

import { getFoodById } from "../api/foodApi";

import {
  addToCart as addFoodToCart,
} from "../api/cartApi";

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const loadFood = async () => {
      try {
        setLoading(true);

        const data = await getFoodById(id);

        setFood(data.food);
      } catch (error) {
        console.error("Failed to load food:", error);
        setFood(null);
      } finally {
        setLoading(false);
      }
    };

    loadFood();
  }, [id]);

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <AppLayout>
        <FoodDetailsSkeleton />
      </AppLayout>
    );
  }

  /* ==========================================
     NOT FOUND
  ========================================== */

  if (!food) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50">
              <span className="text-4xl">
                🍽️
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Food not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This food may have been removed or is no longer
              available.
            </p>

            <Link
              to="/discover"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <span>←</span>
              Back to Discover
            </Link>

          </div>
        </div>
      </AppLayout>
    );
  }

  const nutrition = food.nutrition || {};

  const hasImage =
    food.image &&
    typeof food.image === "string" &&
    food.image.trim() !== "" &&
    !imageError;

  /* ==========================================
     ADD TO CART
  ========================================== */

  const handleAddToCart = async () => {
    if (addingToCart) return;

    try {
      setAddingToCart(true);

      await addFoodToCart(food._id);

      navigate("/cart");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to add item to cart"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full">

        {/* ======================================
            BACK BUTTON
        ======================================= */}

        <Link
          to="/discover"
          className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>

          Back to Discover
        </Link>

        {/* ======================================
            MAIN CARD
        ======================================= */}

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          <div className="grid lg:grid-cols-2">

            {/* ==================================
                IMAGE
            =================================== */}

            <div className="relative min-h-[300px] bg-gray-100 sm:min-h-[420px] lg:min-h-[650px]">

              {hasImage ? (
                <img
                  src={food.image}
                  alt={food.name}
                  className="h-full min-h-[300px] w-full object-cover sm:min-h-[420px] lg:min-h-[650px]"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 sm:min-h-[420px] lg:min-h-[650px]">

                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm">
                    <span className="text-5xl">
                      🍽️
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-gray-400">
                    Image unavailable
                  </p>

                </div>
              )}

              {/* Image gradient */}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />

              {/* Food preference */}

              <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-lg backdrop-blur-md">
                  {food.foodPreference || "Food"}
                </span>
              </div>

              {/* Recommendation score */}

              {food.recommendationScore !== undefined && (
                <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-green-700 shadow-lg backdrop-blur-md">
                    ⭐
                    {Math.round(
                      Number(food.recommendationScore) || 0
                    )}
                    % match
                  </span>
                </div>
              )}

              {/* Photographer */}

              {food.imagePhotographer && (
                <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-6">
                  <p className="rounded-lg bg-black/30 px-2.5 py-1.5 text-[10px] text-white backdrop-blur-sm">
                    Photo by {food.imagePhotographer}
                  </p>
                </div>
              )}

            </div>

            {/* ==================================
                DETAILS
            =================================== */}

            <div className="flex flex-col p-5 sm:p-7 lg:p-10 xl:p-12">

              {/* Category */}

              <div className="flex items-center gap-2">

                <span className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                  {food.category || "Healthy choice"}
                </span>

                <span className="h-1 w-1 rounded-full bg-gray-300" />

                <span className="text-xs text-gray-400">
                  {food.servingSize || 100}
                  {food.servingUnit || "g"}
                </span>

              </div>

              {/* Name */}

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl xl:text-5xl">
                {food.name}
              </h1>

              {/* Description */}

              <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
                {food.description ||
                  "A delicious food choice selected for your CleanCRAVE journey."}
              </p>

              {/* Price */}

              <div className="mt-6 flex flex-wrap items-end gap-3">

                <span className="text-3xl font-extrabold tracking-tight text-green-600 sm:text-4xl">
                  ₹{food.price}
                </span>

                <span className="pb-1 text-sm text-gray-400">
                  per serving
                </span>

              </div>

              {/* ==================================
                  NUTRITION
              =================================== */}

              <section className="mt-8">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                      Nutrition
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Nutrition per serving
                    </p>
                  </div>

                  <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-green-50 sm:flex">
                    <span>🥗</span>
                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">

                  <Nutrition
                    icon="🔥"
                    label="Calories"
                    value={nutrition.calories}
                    unit="kcal"
                    highlight
                  />

                  <Nutrition
                    icon="💪"
                    label="Protein"
                    value={nutrition.protein}
                    unit="g"
                    highlight
                  />

                  <Nutrition
                    icon="🌾"
                    label="Carbs"
                    value={nutrition.carbohydrates}
                    unit="g"
                  />

                  <Nutrition
                    icon="🥑"
                    label="Fat"
                    value={nutrition.fat}
                    unit="g"
                  />

                  <Nutrition
                    icon="🌿"
                    label="Fiber"
                    value={nutrition.fiber}
                    unit="g"
                  />

                  <Nutrition
                    icon="🍬"
                    label="Sugar"
                    value={nutrition.sugar}
                    unit="g"
                  />

                </div>
              </section>

              {/* ==================================
                  WHY CleanCRAVE
              =================================== */}

              <section className="mt-7 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <span>✨</span>
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-sm font-bold text-green-900 sm:text-base">
                      Why CleanCRAVE recommends this
                    </h3>

                    <div className="mt-3 grid gap-2 text-xs text-green-800 sm:grid-cols-2 sm:text-sm">

                      <Reason text="Fits your food preference" />

                      <Reason text="Within your daily budget" />

                      <Reason text="Supports your nutrition target" />

                      <Reason text="Good source of nutrients" />

                    </div>

                  </div>

                </div>
              </section>

              {/* ==================================
                  ADD TO CART
              =================================== */}

              <div className="mt-7">

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl hover:shadow-green-200 disabled:cursor-not-allowed disabled:bg-green-400 disabled:hover:translate-y-0 sm:text-base"
                >
                  {addingToCart ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
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

                      Adding to cart...
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20.5 8H6"
                        />

                        <circle
                          cx="10"
                          cy="19"
                          r="1.2"
                        />

                        <circle
                          cx="17"
                          cy="19"
                          r="1.2"
                        />
                      </svg>

                      Add to Cart

                      <span className="mx-1 text-green-200">
                        •
                      </span>

                      ₹{food.price}
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-gray-400">
                  You can review your nutrition and total
                  before checkout.
                </p>

              </div>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

/* ==========================================
   NUTRITION COMPONENT
========================================== */

const Nutrition = ({
  icon,
  label,
  value,
  unit,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-3.5 transition sm:p-4 ${
        highlight
          ? "border-green-100 bg-green-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">

        <span className="text-sm">
          {icon}
        </span>

        <span
          className={`text-[11px] font-medium ${
            highlight
              ? "text-green-700"
              : "text-gray-500"
          }`}
        >
          {label}
        </span>

      </div>

      <p
        className={`mt-2 text-xl font-extrabold ${
          highlight
            ? "text-green-700"
            : "text-gray-900"
        }`}
      >
        {Math.round(Number(value) || 0)}

        <span
          className={`ml-1 text-xs font-medium ${
            highlight
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {unit}
        </span>
      </p>
    </div>
  );
};

/* ==========================================
   REASON COMPONENT
========================================== */

const Reason = ({ text }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-green-600 shadow-sm">
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
};

/* ==========================================
   LOADING SKELETON
========================================== */

const FoodDetailsSkeleton = () => {
  return (
    <div className="w-full">

      {/* Back skeleton */}

      <div className="mb-5 h-5 w-32 animate-pulse rounded-lg bg-gray-200" />

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

        <div className="grid lg:grid-cols-2">

          {/* Image */}

          <div className="aspect-[4/3] animate-pulse bg-gray-200 lg:aspect-auto lg:min-h-[650px]" />

          {/* Content */}

          <div className="space-y-6 p-5 sm:p-8 lg:p-10">

            <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200" />

            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-gray-200" />

            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>

            <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />

            <div className="h-14 animate-pulse rounded-2xl bg-gray-200" />

          </div>

        </div>
      </div>
    </div>
  );
};

export default FoodDetails;