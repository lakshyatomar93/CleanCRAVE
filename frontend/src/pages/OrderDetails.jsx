import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";

import {
  getOrderById,
} from "../api/orderApi";


// ==========================================
// ORDER STATUSES
// ==========================================

const statuses = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];


// ==========================================
// STATUS CONFIG
// ==========================================

const getStatusConfig = (status) => {
  switch (status) {
    case "Placed":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-100",
        dot: "bg-blue-500",
      };

    case "Confirmed":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-100",
        dot: "bg-indigo-500",
      };

    case "Preparing":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-100",
        dot: "bg-orange-500",
      };

    case "Out for Delivery":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-100",
        dot: "bg-purple-500",
      };

    case "Delivered":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-100",
        dot: "bg-green-500",
      };

    case "Cancelled":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-100",
        dot: "bg-red-500",
      };

    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-100",
        dot: "bg-gray-400",
      };
  }
};


// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleString(
    [],
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


// ==========================================
// FORMAT TIME
// ==========================================

const formatTime = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


// ==========================================
// CALCULATE ORDER NUTRITION
// ==========================================

const calculateNutrition = (
  items = []
) => {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
  };

  items.forEach((item) => {
    const itemNutrition =
      item.nutrition || {};

    const quantity =
      Number(item.quantity || 0);

    nutrition.calories +=
      Number(
        itemNutrition.calories || 0
      ) * quantity;

    nutrition.protein +=
      Number(
        itemNutrition.protein || 0
      ) * quantity;

    nutrition.carbohydrates +=
      Number(
        itemNutrition.carbohydrates || 0
      ) * quantity;

    nutrition.fat +=
      Number(
        itemNutrition.fat || 0
      ) * quantity;

    nutrition.fiber +=
      Number(
        itemNutrition.fiber || 0
      ) * quantity;
  });

  return {
    calories: Math.round(
      nutrition.calories
    ),
    protein: Math.round(
      nutrition.protein
    ),
    carbohydrates: Math.round(
      nutrition.carbohydrates
    ),
    fat: Math.round(
      nutrition.fat
    ),
    fiber: Math.round(
      nutrition.fiber
    ),
  };
};


// ==========================================
// ORDER DETAILS
// ==========================================

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD ORDER
  // ==========================================

  const loadOrder = async (
    showLoader = false
  ) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      setError("");

      const data =
        await getOrderById(id);

      setOrder(data.order);

      setLastUpdated(
        new Date()
      );

    } catch (err) {
      console.error(
        "Failed to load order:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load this order."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadOrder();
  }, [id]);


  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {
    if (!order) {
      return;
    }

    if (
      order.orderStatus ===
        "Delivered" ||
      order.orderStatus ===
        "Cancelled"
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        loadOrder();
      }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [
    order?.orderStatus,
    id,
  ]);


  // ==========================================
  // MANUAL REFRESH
  // ==========================================

  const handleRefresh = () => {
    loadOrder(true);
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <AppLayout>

        <div className="mx-auto w-full max-w-5xl animate-pulse">

          <div className="h-4 w-28 rounded bg-gray-200" />

          <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 sm:p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">

              <div>
                <div className="h-3 w-12 rounded bg-gray-200" />

                <div className="mt-3 h-8 w-44 rounded-lg bg-gray-200" />

                <div className="mt-3 h-3 w-48 rounded bg-gray-100" />
              </div>

              <div className="h-10 w-32 rounded-xl bg-gray-100" />

            </div>

            <div className="mt-10 h-24 rounded-2xl bg-gray-50" />

            <div className="mt-6 h-20 rounded-2xl bg-green-50" />

          </div>

          <div className="mt-5 h-64 rounded-3xl bg-white" />

        </div>

      </AppLayout>
    );
  }


  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!order) {
    return (
      <AppLayout>

        <div className="flex min-h-[65vh] items-center justify-center">

          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">

              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path
                  strokeLinecap="round"
                  d="M9 9l6 6M15 9l-6 6"
                />

              </svg>

            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Order not found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "We couldn't find the order you're looking for."}
            </p>

            <Link
              to="/orders"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 12H5m6 6l-6-6 6-6"
                />
              </svg>

              Back to Orders
            </Link>

          </div>

        </div>

      </AppLayout>
    );
  }


  // ==========================================
  // ORDER DATA
  // ==========================================

  const currentIndex =
    statuses.indexOf(
      order.orderStatus
    );

  const isDelivered =
    order.orderStatus ===
    "Delivered";

  const isCancelled =
    order.orderStatus ===
    "Cancelled";

  const status =
    getStatusConfig(
      order.orderStatus
    );

  const nutrition =
    calculateNutrition(
      order.items
    );

  const totalItems =
    order.items?.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    ) || 0;

  const progress =
    currentIndex >= 0
      ? (currentIndex /
          (statuses.length - 1)) *
        100
      : 0;


  return (
    <AppLayout>

      <div className="mx-auto w-full max-w-5xl">

        {/* ======================================
            BACK
        ====================================== */}

        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-green-600"
        >

          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 12H5m6 6l-6-6 6-6"
            />
          </svg>

          Back to Orders

        </Link>


        {/* ======================================
            ORDER HEADER + TRACKING
        ====================================== */}

        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-gray-100 p-5 sm:p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Order
                </p>

                <h1 className="mt-2 break-all text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  #
                  {order._id
                    ?.slice(-8)
                    .toUpperCase()}
                </h1>

                <p className="mt-2 text-xs text-gray-400">
                  Placed{" "}
                  {formatDate(
                    order.createdAt
                  )}
                </p>

              </div>


              <div className="flex flex-col gap-2 sm:items-end">

                <div className="flex flex-wrap gap-2 sm:justify-end">

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {refreshing ? (
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
                          opacity="0.25"
                        />

                        <path
                          d="M21 12a9 9 0 00-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 11a8.1 8.1 0 00-14.7-4.7L4 8"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v4h4"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 13a8.1 8.1 0 0014.7 4.7L20 16"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 20v-4h-4"
                        />
                      </svg>
                    )}

                    {refreshing
                      ? "Refreshing..."
                      : "Refresh"}

                  </button>


                  <span
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold ${status.bg} ${status.text} ${status.border}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${status.dot}`}
                    />

                    {order.orderStatus}

                  </span>

                </div>

                {!isDelivered &&
                  !isCancelled && (
                    <p className="text-right text-[11px] text-gray-400">
                      Status updates automatically
                    </p>
                  )}

              </div>

            </div>


            {/* ==================================
                TRACKING
            ================================== */}

            {!isCancelled && (
              <div className="mt-9">

                {/* DESKTOP TRACKER */}

                <div className="hidden sm:block">

                  <div className="relative">

                    {/* BASE LINE */}

                    <div className="absolute left-[8%] right-[8%] top-5 h-1 rounded-full bg-gray-100" />

                    {/* PROGRESS */}

                    <div
                      className="absolute left-[8%] top-5 h-1 rounded-full bg-green-500 transition-all duration-700"
                      style={{
                        width: `calc(${progress * 0.84}%)`,
                      }}
                    />


                    {/* STEPS */}

                    <div className="relative flex justify-between">

                      {statuses.map(
                        (
                          step,
                          index
                        ) => {

                          const completed =
                            index <=
                            currentIndex;

                          const current =
                            index ===
                            currentIndex;

                          return (
                            <div
                              key={step}
                              className="flex w-24 flex-col items-center"
                            >

                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-sm transition ${
                                  completed
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-400"
                                } ${
                                  current
                                    ? "ring-4 ring-green-100"
                                    : ""
                                }`}
                              >

                                {completed ? (
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 12l4 4L19 6"
                                    />
                                  </svg>
                                ) : (
                                  index + 1
                                )}

                              </div>

                              <p
                                className={`mt-3 text-center text-[10px] font-semibold leading-4 lg:text-xs ${
                                  completed
                                    ? "text-green-700"
                                    : "text-gray-400"
                                }`}
                              >
                                {step}
                              </p>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>


                {/* MOBILE TRACKER */}

                <div className="sm:hidden">

                  <div className="space-y-0">

                    {statuses.map(
                      (
                        step,
                        index
                      ) => {

                        const completed =
                          index <=
                          currentIndex;

                        const current =
                          index ===
                          currentIndex;

                        const last =
                          index ===
                          statuses.length -
                            1;

                        return (
                          <div
                            key={step}
                            className="relative flex gap-4"
                          >

                            {!last && (
                              <div
                                className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 ${
                                  index <
                                  currentIndex
                                    ? "bg-green-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                completed
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              } ${
                                current
                                  ? "ring-4 ring-green-100"
                                  : ""
                              }`}
                            >
                              {completed ? (
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 12l4 4L19 6"
                                  />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>

                            <div className="pb-6">

                              <p
                                className={`text-sm font-semibold ${
                                  completed
                                    ? "text-green-700"
                                    : "text-gray-400"
                                }`}
                              >
                                {step}
                              </p>

                              {current && (
                                <p className="mt-1 text-xs text-gray-400">
                                  Current status
                                </p>
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>
            )}


            {/* ==================================
                CANCELLED
            ================================== */}

            {isCancelled && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:p-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      d="M7 7l10 10M17 7L7 17"
                    />
                  </svg>

                </div>

                <div>

                  <p className="font-bold text-red-700">
                    Order Cancelled
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-600">
                    This order has been cancelled and
                    will not be delivered.
                  </p>

                </div>

              </div>
            )}


            {/* ==================================
                DELIVERY
            ================================== */}

            {!isCancelled && (
              <div className="mt-8 rounded-2xl bg-green-50 p-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">

                    {isDelivered ? (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12l4 4L19 6"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          d="M7 10h10M7 14h6"
                        />
                      </svg>
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">
                      {isDelivered
                        ? "Delivered"
                        : "Estimated Delivery"}
                    </p>

                    <p className="mt-1 text-base font-extrabold text-green-900 sm:text-lg">

                      {isDelivered
                        ? "Your food has been delivered!"
                        : formatTime(
                            order.estimatedDelivery
                          )}

                    </p>

                    {!isDelivered && (
                      <p className="mt-1 text-xs text-green-700">
                        We'll keep updating your order status.
                      </p>
                    )}

                  </div>

                </div>

              </div>
            )}


            {/* LAST UPDATED */}

            {lastUpdated && (
              <div className="mt-4 text-right text-[11px] text-gray-400">

                Last updated{" "}
                {lastUpdated.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}

              </div>
            )}

          </div>


        </section>


        {/* ======================================
            NUTRITION
        ====================================== */}

        <section
          className={`mt-5 overflow-hidden rounded-3xl border p-5 shadow-sm sm:p-7 ${
            isDelivered
              ? "border-green-100 bg-green-50"
              : "border-orange-100 bg-orange-50"
          }`}
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isDelivered
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                />

                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                    isDelivered
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  Nutrition Tracking
                </p>

              </div>

              <h2 className="mt-2 text-xl font-extrabold text-gray-900">
                {isDelivered
                  ? "Nutrition Added to Today's Log"
                  : "Nutrition Will Be Tracked After Delivery"}
              </h2>

              <p
                className={`mt-2 max-w-2xl text-sm leading-6 ${
                  isDelivered
                    ? "text-green-700"
                    : "text-orange-700"
                }`}
              >
                {isDelivered
                  ? "The nutrition from this order has been added to your daily nutrition tracking."
                  : "Once your order is marked as delivered, its nutrition will automatically be added to your daily nutrition log."}
              </p>

            </div>


            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isDelivered
                  ? "bg-white text-green-600"
                  : "bg-white text-orange-500"
              }`}
            >

              {isDelivered ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12l4 4L19 6"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8.5"
                  />

                  <path
                    strokeLinecap="round"
                    d="M12 7v5l3 2"
                  />
                </svg>
              )}

            </div>

          </div>


          {/* NUTRITION VALUES */}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            <NutritionBox
              label="Calories"
              value={nutrition.calories}
              unit="kcal"
            />

            <NutritionBox
              label="Protein"
              value={nutrition.protein}
              unit="g"
              highlight
            />

            <NutritionBox
              label="Carbs"
              value={nutrition.carbohydrates}
              unit="g"
            />

            <NutritionBox
              label="Fat"
              value={nutrition.fat}
              unit="g"
            />

            <NutritionBox
              label="Fiber"
              value={nutrition.fiber}
              unit="g"
            />

          </div>


          {/* SPENDING */}

          <div className="mt-6 border-t border-black/5 pt-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-sm font-bold text-gray-900">
                  Daily Spending
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {isDelivered
                    ? "This order has been added to today's nutrition spending."
                    : "This order will be counted when it is delivered."}
                </p>

              </div>

              <p className="shrink-0 text-xl font-extrabold text-gray-900">
                ₹{order.subtotal || 0}
              </p>

            </div>

          </div>

        </section>


        {/* ======================================
            FOOD ITEMS
        ====================================== */}

        <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">
                Order Items
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                Your Food
              </h2>

            </div>

            <span className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}
            </span>

          </div>


          <div className="mt-6 divide-y divide-gray-100">

            {order.items?.map(
              (item, index) => {

                const itemTotal =
                  Number(item.price || 0) *
                  Number(
                    item.quantity || 0
                  );

                return (
                  <div
                    key={
                      item.food ||
                      index
                    }
                    className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                  >

                    {/* IMAGE */}

                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-24 sm:w-24">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={
                            item.name ||
                            "Food"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">

                          <svg
                            className="h-7 w-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 15c1.5-4 4.2-6 8-6s6.5 2 8 6"
                            />

                            <path
                              strokeLinecap="round"
                              d="M5 15h14M7 18h10"
                            />

                          </svg>

                        </div>
                      )}

                    </div>


                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <h3 className="line-clamp-2 text-sm font-bold text-gray-900 sm:text-base">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                        ₹{item.price || 0} each
                        {" "}×{" "}
                        {item.quantity || 0}
                      </p>


                      {item.nutrition && (
                        <div className="mt-3 flex flex-wrap gap-1.5">

                          {item.nutrition.calories != null && (
                            <span className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-500">
                              {Math.round(
                                Number(
                                  item.nutrition.calories
                                ) *
                                  Number(
                                    item.quantity ||
                                      0
                                  )
                              )}{" "}
                              kcal
                            </span>
                          )}

                          {item.nutrition.protein != null && (
                            <span className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                              {Math.round(
                                Number(
                                  item.nutrition.protein
                                ) *
                                  Number(
                                    item.quantity ||
                                      0
                                  )
                              )}{" "}
                              g protein
                            </span>
                          )}

                        </div>
                      )}

                    </div>


                    {/* TOTAL */}

                    <div className="shrink-0 text-right">

                      <p className="text-sm font-extrabold text-green-600 sm:text-base">
                        ₹{itemTotal}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>


          {/* ====================================
              PRICE SUMMARY
          ==================================== */}

          <div className="mt-7 border-t border-gray-100 pt-6">

            <div className="ml-auto w-full max-w-sm space-y-3">

              <PriceRow
                label="Subtotal"
                value={`₹${
                  order.subtotal || 0
                }`}
              />

              <PriceRow
                label="Delivery"
                value={
                  Number(
                    order.deliveryFee || 0
                  ) === 0
                    ? "FREE"
                    : `₹${order.deliveryFee}`
                }
                valueClass={
                  Number(
                    order.deliveryFee || 0
                  ) === 0
                    ? "text-green-600"
                    : ""
                }
              />

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">

                <span className="font-bold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-green-600">
                  ₹{order.total || 0}
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            PAYMENT
        ====================================== */}

        <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />

                <path d="M3 10h18" />

                <path
                  strokeLinecap="round"
                  d="M7 15h4"
                />

              </svg>

            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Payment
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                Payment Details
              </h2>

            </div>

          </div>


          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <PaymentBox
              label="Payment Method"
              value={
                order.paymentMethod ||
                "Not specified"
              }
            />

            <PaymentBox
              label="Payment Status"
              value={
                order.paymentStatus ||
                "Pending"
              }
              status
            />

          </div>

        </section>


        {/* ======================================
            BOTTOM ACTION
        ====================================== */}

        <div className="mt-6 flex justify-center pb-2">

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-green-300 hover:text-green-600"
          >

            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 12H5m6 6l-6-6 6-6"
              />
            </svg>

            Back to All Orders

          </Link>

        </div>

      </div>

    </AppLayout>
  );
};


// ==========================================
// NUTRITION BOX
// ==========================================

const NutritionBox = ({
  label,
  value,
  unit,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        highlight
          ? "border-green-100 bg-white"
          : "border-black/5 bg-white/70"
      }`}
    >

      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-extrabold ${
          highlight
            ? "text-green-600"
            : "text-gray-900"
        }`}
      >
        {value}

        <span className="ml-1 text-[10px] font-semibold text-gray-400">
          {unit}
        </span>
      </p>

    </div>
  );
};


// ==========================================
// PRICE ROW
// ==========================================

const PriceRow = ({
  label,
  value,
  valueClass = "",
}) => {
  return (
    <div className="flex items-center justify-between text-sm">

      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={`font-semibold text-gray-900 ${valueClass}`}
      >
        {value}
      </span>

    </div>
  );
};


// ==========================================
// PAYMENT BOX
// ==========================================

const PaymentBox = ({
  label,
  value,
  status = false,
}) => {
  const isPaid =
    value === "Paid";

  return (
    <div className="rounded-2xl bg-gray-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {status && (
          <span
            className={`h-2 w-2 rounded-full ${
              isPaid
                ? "bg-green-500"
                : "bg-orange-500"
            }`}
          />
        )}

        <p
          className={`text-sm font-bold ${
            status && isPaid
              ? "text-green-600"
              : status
              ? "text-orange-600"
              : "text-gray-900"
          }`}
        >
          {value}
        </p>

      </div>

    </div>
  );
};


export default OrderDetails;