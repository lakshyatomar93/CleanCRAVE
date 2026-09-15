import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";
import FoodCard from "../components/FoodCard";

import {
  getRecommendations,
} from "../api/recommendationApi";

// ==========================================
// DASHBOARD
// ==========================================

const Dashboard = () => {

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [category, setCategory] =
    useState("All");


  // ==========================================
  // USER
  // ==========================================

  const user = useMemo(() => {

    try {

      return (
        JSON.parse(
          localStorage.getItem("user")
        ) || {}
      );

    } catch {

      return {};

    }

  }, []);


  // ==========================================
  // LOAD RECOMMENDATIONS
  // ==========================================

  const loadRecommendations = async () => {

    try {

      setLoading(true);

      setError("");

      const result =
        await getRecommendations();

      setData(result);

    } catch (err) {

      console.error(
        "Failed to load recommendations:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load recommendations"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    loadRecommendations();

  }, []);


  // ==========================================
  // REFRESH DASHBOARD
  // ==========================================

  const refreshDashboard = async () => {

    await loadRecommendations();

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <AppLayout>

        <div className="min-h-[80vh] flex items-center justify-center">

          <div className="text-center">

            <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto" />

            <p className="mt-5 text-gray-500">
              Preparing your personalized food plan...
            </p>

          </div>

        </div>

      </AppLayout>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <AppLayout>

        <div className="p-8">

          <div className="bg-white rounded-2xl p-10 text-center">

            <div className="text-5xl">
              🥗
            </div>

            <h2 className="text-xl font-bold mt-4">
              Couldn't load your plan
            </h2>

            <p className="text-gray-500 mt-2">
              {error}
            </p>

            <button
              onClick={refreshDashboard}
              className="mt-5 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition"
            >
              Try Again
            </button>

          </div>

        </div>

      </AppLayout>

    );

  }


  // ==========================================
  // DATA
  // ==========================================

  const nutrition =
    data?.nutritionNeeds || {};

  const consumed =
    data?.consumed || {};

  const remaining =
    data?.remaining || {};

  const budget =
    data?.budget || {};

  const foods =
    data?.recommendations || [];


  // ==========================================
  // PROGRESS VALUES
  // ==========================================

  const calorieTarget =
    Number(
      nutrition.calories || 0
    );

  const consumedCalories =
    Number(
      consumed.calories || 0
    );

  const calorieRemaining =
    Math.max(
      Number(
        remaining.calories || 0
      ),
      0
    );


  const proteinTarget =
    Number(
      nutrition.protein || 0
    );

  const consumedProtein =
    Number(
      consumed.protein || 0
    );

  const proteinRemaining =
    Math.max(
      Number(
        remaining.protein || 0
      ),
      0
    );


  const dailyBudget =
    Number(
      budget.daily ??
      user.dailyBudget ??
      0
    );

  const spentBudget =
    Number(
      budget.spent || 0
    );

  const remainingBudget =
    Math.max(
      Number(
        budget.remaining ??
        dailyBudget -
        spentBudget
      ),
      0
    );


  // ==========================================
  // PROGRESS PERCENTAGES
  // ==========================================

  const calorieProgress =
    getProgressPercentage(
      consumedCalories,
      calorieTarget
    );

  const proteinProgress =
    getProgressPercentage(
      consumedProtein,
      proteinTarget
    );

  const budgetProgress =
    getProgressPercentage(
      spentBudget,
      dailyBudget
    );


  // ==========================================
  // FILTER FOODS
  // ==========================================

  let filteredFoods =
    foods;


  if (
    category ===
    "High Protein"
  ) {

    filteredFoods =
      foods.filter(
        (food) =>
          (
            food.nutrition
              ?.protein || 0
          ) >= 15
      );

  }


  else if (
    category ===
    "Low Calorie"
  ) {

    filteredFoods =
      foods.filter(
        (food) =>
          (
            food.nutrition
              ?.calories || 0
          ) <= 350
      );

  }


  else if (
    category ===
    "Budget"
  ) {

    filteredFoods =
      foods.filter(
        (food) =>
          (
            food.price || 0
          ) <= 150
      );

  }


  // ==========================================
  // BEST FOOD
  // ==========================================

  const bestFood =
    foods.length > 0
      ? foods[0]
      : null;


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <AppLayout>

      <div className="min-h-screen bg-slate-50/70">

        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">


          {/* =====================================================
              TOP HEADER
          ====================================================== */}

          <section className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-600">
                    Your personal food plan
                  </p>

                </div>


                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">

                  Good morning,{" "}

                  <span className="text-green-600">

                    {
                      user.name?.split(
                        " "
                      )[0] ||
                      "there"
                    }

                  </span>{" "}

                  👋

                </h1>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">

                  Smart food recommendations
                  built around your goals,
                  nutrition needs and daily
                  budget.

                </p>

              </div>


              <button
                onClick={
                  refreshDashboard
                }
                disabled={loading}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:text-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                >
                  ↻
                </span>

                Refresh

              </button>

            </div>

          </section>


          {/* =====================================================
              HERO
          ====================================================== */}

          <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-6 py-7 text-white shadow-lg shadow-green-900/10 sm:px-8 sm:py-9 lg:px-10">

            <div className="relative z-10 max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur">

                <span>
                  ✦
                </span>

                Personalized nutrition

              </div>


              <h2 className="max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">

                Your body deserves the right
                fuel.

              </h2>


              <p className="mt-3 max-w-xl text-sm leading-6 text-green-50/90 sm:text-base">

                CleanCRAVE combines your
                activity, goal, food preference
                and budget to help you make
                better food choices every day.

              </p>


              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-50"
                >

                  Explore foods

                  <span>
                    →
                  </span>

                </Link>


                <Link
                  to="/nutrition"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >

                  View nutrition

                </Link>

              </div>

            </div>


            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5" />

            <div className="pointer-events-none absolute -bottom-36 right-12 h-96 w-96 rounded-full border border-white/10 bg-white/5" />


            <div className="absolute right-8 top-8 hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md lg:block">

              <p className="text-[10px] font-bold uppercase tracking-wider text-green-100">
                Best match
              </p>

              <p className="mt-1 max-w-[170px] truncate text-sm font-bold">

                {
                  bestFood?.name ||
                  "Finding your best meal..."
                }

              </p>


              {bestFood && (

                <p className="mt-1 text-xs text-green-100">

                  {
                    Math.round(
                      bestFood
                        .nutrition
                        ?.protein ||
                      0
                    )
                  }
                  g protein · ₹
                  {
                    bestFood.price
                  }

                </p>

              )}

            </div>

          </section>


          {/* =====================================================
              DAILY TARGETS
          ====================================================== */}

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

            <StatCard
              icon="🔥"
              label="Daily Calories"
              value={
                Math.round(
                  calorieTarget
                )
              }
              unit="kcal"
            />

            <StatCard
              icon="💪"
              label="Protein Target"
              value={
                Math.round(
                  proteinTarget
                )
              }
              unit="g"
            />

            <StatCard
              icon="⚡"
              label="BMR"
              value={
                Math.round(
                  nutrition.bmr ||
                  0
                )
              }
              unit="kcal"
            />

            <StatCard
              icon="₹"
              label="Daily Budget"
              value={
                dailyBudget
              }
              unit=""
            />

          </section>


          {/* =====================================================
              NUTRITION SNAPSHOT
          ====================================================== */}

          <section className="mb-8 overflow-hidden rounded-[26px] border border-green-100 bg-white shadow-sm">

            <div className="bg-gradient-to-r from-green-50 via-white to-emerald-50 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="mb-1 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">
                      Nutrition snapshot
                    </p>

                  </div>


                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    Keep your nutrition on track
                  </h2>


                  <p className="mt-1 text-sm text-slate-500">
                    A quick look at today's
                    calories, protein and food
                    budget.
                  </p>

                </div>


                <Link
                  to="/nutrition"
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md"
                >

                  Full nutrition

                  <span>
                    →
                  </span>

                </Link>

              </div>


              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                <NutritionSnapshotCard
                  icon="🔥"
                  title="Calories"
                  consumed={
                    consumedCalories
                  }
                  target={
                    calorieTarget
                  }
                  remaining={
                    calorieRemaining
                  }
                  unit="kcal"
                />


                <NutritionSnapshotCard
                  icon="💪"
                  title="Protein"
                  consumed={
                    consumedProtein
                  }
                  target={
                    proteinTarget
                  }
                  remaining={
                    proteinRemaining
                  }
                  unit="g"
                />


                <NutritionSnapshotCard
                  icon="₹"
                  title="Food budget"
                  consumed={
                    spentBudget
                  }
                  target={
                    dailyBudget
                  }
                  remaining={
                    remainingBudget
                  }
                  unit="₹"
                />

              </div>

            </div>

          </section>


          {/* =====================================================
              WHAT SHOULD I EAT NEXT?
          ====================================================== */}

          {bestFood && (

            <section className="mb-8">

              <div className="overflow-hidden rounded-[26px] border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-5 sm:p-6 lg:p-7">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">
                      Smart food assistant
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      What should you eat next?
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Your recommendations are
                      ranked using your remaining
                      calories, protein, food
                      preference and budget.
                    </p>

                  </div>


                  <div className="flex w-fit items-center gap-3 rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                      🎯
                    </div>


                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Best match
                      </p>

                      <p className="max-w-[190px] truncate text-sm font-extrabold text-green-700">
                        {
                          bestFood.name
                        }
                      </p>

                    </div>

                  </div>

                </div>


                <div className="mt-6 grid gap-3 md:grid-cols-3">

                  {
                    foods
                      .slice(0, 3)
                      .map(
                        (
                          food,
                          index
                        ) => (

                          <Link
                            key={
                              food._id
                            }
                            to={`/foods/${food._id}`}
                            className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                          >

                            <div className="flex gap-3">

                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">

                                {food.image ? (

                                  <img
                                    src={
                                      food.image
                                    }
                                    alt={
                                      food.name
                                    }
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />

                                ) : (

                                  <div className="flex h-full w-full items-center justify-center text-2xl">
                                    🍽️
                                  </div>

                                )}

                              </div>


                              <div className="min-w-0 flex-1">

                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-green-600">

                                  #
                                  {
                                    index +
                                    1
                                  }{" "}
                                  best
                                  match

                                </span>


                                <h3 className="mt-1 truncate text-sm font-extrabold text-slate-900">
                                  {
                                    food.name
                                  }
                                </h3>


                                <p className="mt-1 text-xs text-slate-400">

                                  {
                                    Math.round(
                                      food
                                        .nutrition
                                        ?.calories ||
                                      0
                                    )
                                  }{" "}
                                  kcal ·{" "}

                                  {
                                    Math.round(
                                      food
                                        .nutrition
                                        ?.protein ||
                                      0
                                    )
                                  }
                                  g protein

                                </p>


                                <p className="mt-1 text-sm font-extrabold text-green-600">
                                  ₹
                                  {
                                    food.price
                                  }
                                </p>

                              </div>

                            </div>


                            {
                              food
                                .recommendationReasons
                                ?.[0] && (

                                <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">

                                  ✨{" "}
                                  {
                                    food
                                      .recommendationReasons[0]
                                  }

                                </p>

                              )
                            }

                          </Link>

                        )
                      )
                  }

                </div>

              </div>

            </section>

          )}


          {/* =====================================================
              RECOMMENDATIONS
          ====================================================== */}

          <section>

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">
                  CleanCRAVE picks
                </p>

                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                  Recommended for you
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Personalized choices based on
                  your current profile.
                </p>

              </div>


              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">

                {
                  [
                    "All",
                    "High Protein",
                    "Low Calorie",
                    "Budget",
                  ].map(
                    (item) => (

                      <button
                        key={
                          item
                        }
                        onClick={() =>
                          setCategory(
                            item
                          )
                        }
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                          category ===
                          item
                            ? "bg-green-600 text-white shadow-sm shadow-green-600/20"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:text-green-700"
                        }`}
                      >
                        {
                          item
                        }
                      </button>

                    )
                  )
                }

              </div>

            </div>


            {
              filteredFoods.length ===
              0 ? (

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                    🍽️
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                    No foods found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    You may have reached today's
                    budget or there are currently
                    no foods matching this filter.
                  </p>

                  <button
                    onClick={() =>
                      setCategory(
                        "All"
                      )
                    }
                    className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    Show all foods
                  </button>

                </div>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {
                    filteredFoods.map(
                      (food) => (

                        <FoodCard
                          key={
                            food._id
                          }
                          food={
                            food
                          }
                        />

                      )
                    )
                  }

                </div>

              )
            }

          </section>

        </div>

      </div>

    </AppLayout>

  );

};


// ==========================================
// PROGRESS PERCENTAGE
// ==========================================

const getProgressPercentage = (
  current,
  target
) => {

  if (
    !target ||
    target <= 0
  ) {

    return 0;

  }


  return Math.min(
    Math.round(
      (current / target) *
      100
    ),
    100
  );

};


// ==========================================
// NUTRITION SNAPSHOT CARD
// ==========================================

const NutritionSnapshotCard = ({
  icon,
  title,
  consumed,
  target,
  remaining,
  unit,
}) => {

  const progress =
    target > 0
      ? Math.min(
          Math.round(
            (consumed /
              target) *
            100
          ),
          100
        )
      : 0;


  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-sm">

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
            {
              icon
            }
          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-slate-900">
              {
                title
              }
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Today's progress
            </p>

          </div>

        </div>


        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-extrabold text-green-700">

          {
            progress
          }%

        </span>

      </div>


      <div className="mt-4 flex items-end justify-between gap-3">

        <p className="text-xl font-black text-slate-900">

          {
            unit ===
            "₹" &&
            "₹"
          }

          {
            Math.round(
              consumed
            )
          }

          <span className="ml-1 text-xs font-medium text-slate-400">

            {
              unit !==
              "₹" &&
              unit
            }

          </span>

        </p>


        <p className="text-right text-[11px] text-slate-400">

          {
            Math.round(
              remaining
            )
          }{" "}

          {
            unit ===
            "₹"
              ? "remaining"
              : `${unit} left`
          }

        </p>

      </div>


      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-green-500 transition-all duration-700"
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>

    </div>

  );

};


// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({
  icon,
  label,
  value,
  unit,
}) => {

  return (

    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-100 hover:shadow-md">

      <div className="flex justify-between items-center">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg transition group-hover:scale-105">

          {
            icon
          }

        </div>


        <span className="text-[10px] text-gray-400 font-medium">

          DAILY

        </span>

      </div>


      <p className="text-sm text-gray-500 mt-5">

        {
          label
        }

      </p>


      <p className="text-2xl font-bold text-gray-900 mt-1">

        {
          value
        }

        <span className="text-sm text-gray-400 ml-1">

          {
            unit
          }

        </span>

      </p>

    </div>

  );

};


export default Dashboard;