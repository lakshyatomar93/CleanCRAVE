import React, {
  useEffect,
  useState,
} from "react";

import {
  getNutritionNeeds,
  getNutritionHistory,
} from "../api/nutritionApi";


const NutritionManager = ({
  refreshKey = 0,
}) => {

  const [data, setData] =
    useState(null);

  const [historyData, setHistoryData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [historyError, setHistoryError] =
    useState("");


  // ==========================================
  // LOAD TODAY'S NUTRITION
  // ==========================================

  const loadNutrition = async () => {

    try {

      setLoading(true);

      setError("");

      const result =
        await getNutritionNeeds();

      setData(result);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load nutrition data"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD HISTORY
  // ==========================================

  const loadHistory = async () => {

    try {

      setHistoryLoading(true);

      setHistoryError("");

      const result =
        await getNutritionHistory(7);

      setHistoryData(result);

    } catch (err) {

      console.error(err);

      setHistoryError(
        err.response?.data?.message ||
        "Unable to load nutrition history"
      );

    } finally {

      setHistoryLoading(false);

    }

  };


  // ==========================================
  // LOAD EVERYTHING
  // ==========================================

  useEffect(() => {

    loadNutrition();

    loadHistory();

  }, [refreshKey]);


  // ==========================================
  // TODAY LOADING
  // ==========================================

  if (loading) {

    return (

      <section className="bg-white rounded-3xl border border-gray-100 p-6 mb-10">

        <p className="text-gray-500">
          Loading your nutrition...
        </p>

      </section>

    );

  }


  // ==========================================
  // TODAY ERROR
  // ==========================================

  if (error) {

    return (

      <section className="bg-white rounded-3xl border border-red-100 p-6 mb-10">

        <p className="text-red-500">
          {error}
        </p>

        <button
          onClick={loadNutrition}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl text-sm"
        >
          Try Again
        </button>

      </section>

    );

  }


  const targets =
    data?.targets || {};

  const consumed =
    data?.consumed || {};

  const remaining =
    data?.remaining || {};

  const budget =
    data?.budget || {};


  return (

    <section className="mb-10">


      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">

        <div>

          <p className="text-green-600 text-xs font-bold tracking-widest">
            NUTRITION MANAGER
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            Today's nutrition
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Track your food intake, nutrition and daily budget.
          </p>

        </div>


        <button
          onClick={() => {
            loadNutrition();
            loadHistory();
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition"
        >
          ↻ Refresh
        </button>

      </div>


      {/* ================================= */}
      {/* NUTRITION CARDS */}
      {/* ================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <NutritionCard
          icon="🔥"
          title="Calories"
          consumed={consumed.calories}
          target={targets.calories}
          remaining={remaining.calories}
          unit="kcal"
        />


        <NutritionCard
          icon="💪"
          title="Protein"
          consumed={consumed.protein}
          target={targets.protein}
          remaining={remaining.protein}
          unit="g"
        />


        <NutritionCard
          icon="🍚"
          title="Carbohydrates"
          consumed={consumed.carbohydrates}
          target={targets.carbohydrates}
          remaining={remaining.carbohydrates}
          unit="g"
        />


        <NutritionCard
          icon="🥑"
          title="Fat"
          consumed={consumed.fat}
          target={targets.fat}
          remaining={remaining.fat}
          unit="g"
        />

      </div>


      {/* ================================= */}
      {/* FIBER + BUDGET */}
      {/* ================================= */}

      <div className="grid md:grid-cols-2 gap-4 mt-4">

        <SmallProgressCard
          icon="🌾"
          title="Fiber"
          consumed={consumed.fiber}
          target={targets.fiber}
          unit="g"
        />


        <SmallProgressCard
          icon="💰"
          title="Food Budget"
          consumed={budget.spent}
          target={budget.daily}
          unit="₹"
          reverseLabel
        />

      </div>


      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 mt-4">

        <div className="flex items-start gap-3">

          <div className="text-2xl">
            🎯
          </div>

          <div className="flex-1">

            <h3 className="font-bold text-gray-900">
              Your remaining nutrition
            </h3>

            <p className="text-sm text-gray-600 mt-1 leading-6">

              You have approximately{" "}

              <strong>
                {Math.round(
                  remaining.calories || 0
                )}
              </strong>{" "}
              kcal and{" "}

              <strong>
                {Math.round(
                  remaining.protein || 0
                )}g
              </strong>{" "}

              protein remaining today.

            </p>


            <p className="text-sm text-gray-600 mt-1">

              Remaining food budget:{" "}

              <strong className="text-green-700">
                ₹
                {Math.round(
                  budget.remaining || 0
                )}
              </strong>

            </p>

          </div>

        </div>

      </div>


      {/* ================================= */}
      {/* 7 DAY HISTORY */}
      {/* ================================= */}

      <NutritionHistory
        historyData={historyData}
        loading={historyLoading}
        error={historyError}
        onRetry={loadHistory}
      />

    </section>

  );

};


// ==========================================
// 7 DAY NUTRITION HISTORY
// ==========================================

const NutritionHistory = ({
  historyData,
  loading,
  error,
  onRetry,
}) => {

  if (loading) {

    return (

      <div className="bg-white border border-gray-100 rounded-3xl p-6 mt-6">

        <p className="text-gray-500 text-sm">
          Loading nutrition history...
        </p>

      </div>

    );

  }


  if (error) {

    return (

      <div className="bg-white border border-red-100 rounded-3xl p-6 mt-6">

        <p className="text-red-500 text-sm">
          {error}
        </p>

        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold"
        >
          Try Again
        </button>

      </div>

    );

  }


  const history =
    historyData?.history || [];

  const targets =
    historyData?.targets || {};

  const summary =
    historyData?.summary || {};


  const maxCalories =
    Math.max(
      targets.calories || 0,
      ...history.map(
        (day) =>
          day.calories || 0
      ),
      1
    );


  const maxProtein =
    Math.max(
      targets.protein || 0,
      ...history.map(
        (day) =>
          day.protein || 0
      ),
      1
    );


  return (

    <div className="bg-white border border-gray-100 rounded-3xl p-6 mt-6">


      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <p className="text-green-600 text-xs font-bold tracking-widest">
            PROGRESS
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            Last 7 days
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            See how your nutrition and spending have changed.
          </p>

        </div>


        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-3 gap-2 sm:gap-3">

          <HistorySummary
            label="Avg kcal"
            value={
              summary.averageCalories || 0
            }
            unit=""
          />

          <HistorySummary
            label="Avg protein"
            value={
              summary.averageProtein || 0
            }
            unit="g"
          />

          <HistorySummary
            label="Spent"
            value={
              Math.round(
                summary.totalSpent || 0
              )
            }
            unit="₹"
          />

        </div>

      </div>


      {/* ==================================
          TRACKED DAYS
      ================================== */}

      <div className="mt-5 px-4 py-3 bg-gray-50 rounded-xl">

        <p className="text-sm text-gray-600">

          You have tracked{" "}

          <strong className="text-gray-900">
            {summary.trackedDays || 0}
          </strong>{" "}

          of the last{" "}

          <strong className="text-gray-900">
            7
          </strong>{" "}

          days.

        </p>

      </div>


      {/* ==================================
          CALORIE CHART
      ================================== */}

      <div className="mt-7">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h3 className="font-bold text-gray-900">
              Calories
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Target:{" "}
              {Math.round(
                targets.calories || 0
              )} kcal/day
            </p>

          </div>

          <span className="text-xs text-gray-400">
            kcal
          </span>

        </div>


        <div className="flex items-end gap-2 sm:gap-4 h-52">

          {history.map(
            (day) => {

              const value =
                Number(
                  day.calories || 0
                );


              const height =
                value > 0
                  ? Math.max(
                      (value /
                        maxCalories) *
                        100,
                      4
                    )
                  : 2;


              const targetPosition =
                targets.calories > 0
                  ? Math.min(
                      (targets.calories /
                        maxCalories) *
                        100,
                      100
                    )
                  : 0;


              return (

                <div
                  key={day.date}
                  className="flex-1 h-full flex flex-col justify-end items-center min-w-0"
                >

                  <div className="relative w-full max-w-12 h-full flex items-end justify-center">

                    {/* Target indicator */}

                    {targetPosition > 0 && (
                      <div
                        className="absolute left-0 right-0 border-t border-dashed border-green-300"
                        style={{
                          bottom: `${targetPosition}%`,
                        }}
                      />
                    )}


                    {/* Bar */}

                    <div
                      className={`relative w-full max-w-10 rounded-t-xl transition-all duration-500 ${
                        value === 0
                          ? "bg-gray-100"
                          : value >
                            targets.calories
                          ? "bg-orange-400"
                          : "bg-green-500"
                      }`}
                      style={{
                        height:
                          `${height}%`,
                        minHeight:
                          value > 0
                            ? "8px"
                            : "3px",
                      }}
                      title={`${value} kcal`}
                    >

                      {value > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                          {Math.round(value)}
                        </span>
                      )}

                    </div>

                  </div>


                  <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                    {formatDay(
                      day.date
                    )}
                  </p>

                </div>

              );

            }
          )}

        </div>

      </div>


      {/* ==================================
          PROTEIN CHART
      ================================== */}

      <div className="mt-10">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h3 className="font-bold text-gray-900">
              Protein
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Target:{" "}
              {Math.round(
                targets.protein || 0
              )} g/day
            </p>

          </div>

          <span className="text-xs text-gray-400">
            grams
          </span>

        </div>


        <div className="flex items-end gap-2 sm:gap-4 h-44">

          {history.map(
            (day) => {

              const value =
                Number(
                  day.protein || 0
                );


              const height =
                value > 0
                  ? Math.max(
                      (value /
                        maxProtein) *
                        100,
                      4
                    )
                  : 2;


              return (

                <div
                  key={day.date}
                  className="flex-1 h-full flex flex-col justify-end items-center min-w-0"
                >

                  <div className="relative w-full max-w-12 h-full flex items-end justify-center">

                    <div
                      className={`w-full max-w-10 rounded-t-xl ${
                        value === 0
                          ? "bg-gray-100"
                          : value >=
                            targets.protein
                          ? "bg-green-500"
                          : "bg-blue-400"
                      }`}
                      style={{
                        height:
                          `${height}%`,
                        minHeight:
                          value > 0
                            ? "8px"
                            : "3px",
                      }}
                      title={`${Math.round(value)}g protein`}
                    >

                      {value > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                          {Math.round(value)}g
                        </span>
                      )}

                    </div>

                  </div>


                  <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                    {formatDay(
                      day.date
                    )}
                  </p>

                </div>

              );

            }
          )}

        </div>

      </div>


      {/* ==================================
          SPENDING
      ================================== */}

      <div className="mt-8 pt-6 border-t border-gray-100">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

          <div>

            <h3 className="font-bold text-gray-900">
              Food spending
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Total spent across tracked days.
            </p>

          </div>


          <p className="text-xl font-bold text-green-600">
            ₹
            {Math.round(
              summary.totalSpent || 0
            )}
          </p>

        </div>

      </div>

    </div>

  );

};


// ==========================================
// HISTORY SUMMARY
// ==========================================

const HistorySummary = ({
  label,
  value,
  unit,
}) => {

  return (

    <div className="bg-green-50 rounded-xl px-3 py-2 min-w-[80px]">

      <p className="text-[10px] text-gray-500">
        {label}
      </p>

      <p className="font-bold text-green-700 text-sm">

        {unit === "₹" && "₹"}

        {Math.round(
          Number(value || 0)
        )}

        {unit === "g" && "g"}

      </p>

    </div>

  );

};


// ==========================================
// FORMAT DATE
// ==========================================

const formatDay = (
  dateString
) => {

  if (!dateString) {
    return "";
  }


  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
    }
  );

};


// ==========================================
// LARGE NUTRITION CARD
// ==========================================

const NutritionCard = ({
  icon,
  title,
  consumed = 0,
  target = 0,
  remaining = 0,
  unit,
}) => {

  const percentage =
    target > 0
      ? Math.min(
          Math.round(
            (consumed / target) *
              100
          ),
          100
        )
      : 0;


  return (

    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            {icon}
          </div>

          <p className="font-semibold text-gray-900">
            {title}
          </p>

        </div>


        <span className="text-xs font-bold text-green-600">
          {percentage}%
        </span>

      </div>


      <div className="mt-5">

        <p className="text-2xl font-bold text-gray-900">

          {Math.round(
            consumed || 0
          )}

          <span className="text-sm font-medium text-gray-400 ml-1">
            {unit}
          </span>

        </p>


        <p className="text-xs text-gray-500 mt-1">
          of {Math.round(
            target || 0
          )} {unit}
        </p>

      </div>


      <ProgressBar
        consumed={consumed}
        target={target}
      />


      <p className="text-xs text-gray-400 mt-3">
        {Math.round(
          remaining || 0
        )} {unit} remaining
      </p>

    </div>

  );

};


// ==========================================
// SMALL PROGRESS CARD
// ==========================================

const SmallProgressCard = ({
  icon,
  title,
  consumed = 0,
  target = 0,
  unit,
  reverseLabel = false,
}) => {

  const percentage =
    target > 0
      ? Math.min(
          Math.round(
            (consumed / target) *
              100
          ),
          100
        )
      : 0;


  return (

    <div className="bg-white border border-gray-100 rounded-2xl p-5">

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            {icon}
          </div>

          <div>

            <p className="font-semibold text-gray-900">
              {title}
            </p>

            <p className="text-xs text-gray-500">

              {reverseLabel
                ? `₹${Math.round(
                    consumed
                  )} spent today`
                : `${Math.round(
                    consumed
                  )}${unit} consumed`}

            </p>

          </div>

        </div>


        <div className="text-right">

          <p className="font-bold text-gray-900">

            {reverseLabel
              ? `₹${Math.round(
                  target
                )}`
              : `${Math.round(
                  target
                )}${unit}`}

          </p>

          <p className="text-xs text-gray-400">
            daily target
          </p>

        </div>

      </div>


      <ProgressBar
        consumed={consumed}
        target={target}
      />


      {reverseLabel && (

        <p className="text-xs text-green-600 mt-3 font-medium">

          ₹
          {Math.max(
            Math.round(
              target - consumed
            ),
            0
          )}{" "}
          remaining

        </p>

      )}

    </div>

  );

};


// ==========================================
// PROGRESS BAR
// ==========================================

const ProgressBar = ({
  consumed = 0,
  target = 0,
}) => {

  const percentage =
    target > 0
      ? Math.min(
          (consumed / target) *
            100,
          100
        )
      : 0;


  return (

    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">

      <div
        className="h-full bg-green-500 rounded-full transition-all duration-500"
        style={{
          width: `${percentage}%`,
        }}
      />

    </div>

  );

};


export default NutritionManager;