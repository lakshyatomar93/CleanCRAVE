import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";

import {
  getOrders,
} from "../api/orderApi";


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
        icon: "clock",
      };

    case "Confirmed":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-100",
        dot: "bg-indigo-500",
        icon: "check",
      };

    case "Preparing":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-100",
        dot: "bg-orange-500",
        icon: "fire",
      };

    case "Out for Delivery":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-100",
        dot: "bg-purple-500",
        icon: "truck",
      };

    case "Delivered":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-100",
        dot: "bg-green-500",
        icon: "check",
      };

    case "Cancelled":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-100",
        dot: "bg-red-500",
        icon: "close",
      };

    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-100",
        dot: "bg-gray-400",
        icon: "clock",
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
// GET TOTAL ITEMS
// ==========================================

const getTotalItems = (items = []) => {
  return items.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );
};


// ==========================================
// ORDERS PAGE
// ==========================================

const Orders = () => {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  const loadOrders = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        await getOrders();

      setOrders(
        data.orders || []
      );

    } catch (err) {
      console.error(
        "Failed to load orders:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load your orders."
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
    loadOrders();
  }, []);


  // ==========================================
  // LOADING SKELETON
  // ==========================================

  if (loading) {
    return (
      <AppLayout>

        <div className="mx-auto w-full max-w-5xl animate-pulse">

          {/* Header */}

          <div className="mb-8">

            <div className="h-3 w-16 rounded bg-gray-200" />

            <div className="mt-3 h-9 w-40 rounded-lg bg-gray-200" />

            <div className="mt-3 h-4 w-72 max-w-full rounded bg-gray-100" />

          </div>


          {/* Cards */}

          <div className="space-y-5">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white"
              >

                <div className="border-b border-gray-100 p-5 sm:p-6">

                  <div className="flex justify-between gap-4">

                    <div className="space-y-3">

                      <div className="h-5 w-32 rounded bg-gray-200" />

                      <div className="h-3 w-36 rounded bg-gray-100" />

                    </div>

                    <div className="h-7 w-20 rounded-full bg-gray-100" />

                  </div>

                </div>


                <div className="p-5 sm:p-6">

                  <div className="space-y-3">

                    <div className="h-4 w-40 rounded bg-gray-100" />

                    <div className="h-4 w-56 rounded bg-gray-100" />

                    <div className="h-4 w-44 rounded bg-gray-100" />

                  </div>


                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    {[1, 2, 3, 4].map(
                      (box) => (
                        <div
                          key={box}
                          className="h-20 rounded-2xl bg-gray-50"
                        />
                      )
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </AppLayout>
    );
  }


  return (
    <AppLayout>

      <div className="mx-auto w-full max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-600">

              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              CleanCRAVE

            </div>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              My Orders
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Track your orders and see the nutrition
              contributed by your meals.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              loadOrders(true)
            }
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-300 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >

            {refreshing ? (
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
                    opacity="0.25"
                  />

                  <path
                    d="M21 12a9 9 0 00-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

                Refreshing...

              </>
            ) : (
              <>
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

                Refresh
              </>
            )}

          </button>

        </div>


        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:p-5">

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
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />
              </svg>

            </div>

            <div className="min-w-0">

              <p className="font-semibold text-red-700">
                Unable to load orders
              </p>

              <p className="mt-1 text-sm leading-5 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadOrders()
                }
                className="mt-3 text-sm font-bold text-red-700 underline underline-offset-2"
              >
                Try again
              </button>

            </div>

          </div>
        )}


        {/* ======================================
            EMPTY STATE
        ====================================== */}

        {!error &&
          orders.length === 0 && (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-16">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">

                <svg
                  className="h-9 w-9"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 4h12v16H6z"
                  />

                  <path
                    strokeLinecap="round"
                    d="M9 8h6M9 12h6M9 16h4"
                  />

                </svg>

              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Your ordered meals will appear here.
                Discover healthy food and place your
                first order.
              </p>

              <Link
                to="/discover"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Discover Food

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
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>

              </Link>

            </div>
          )}


        {/* ======================================
            ORDER LIST
        ====================================== */}

        <div className="space-y-5">

          {orders.map((order) => {

            const nutrition =
              calculateNutrition(
                order.items
              );

            const isDelivered =
              order.orderStatus ===
              "Delivered";

            const isCancelled =
              order.orderStatus ===
              "Cancelled";

            const nutritionLogged =
              order.nutritionLogged ===
              true;

            const status =
              getStatusConfig(
                order.orderStatus
              );

            const totalItems =
              getTotalItems(
                order.items
              );

            return (
              <article
                key={order._id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* =================================
                    ORDER HEADER
                ================================== */}

                <div className="border-b border-gray-100 p-5 sm:p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2.5">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">

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
                                d="M6 4h12v16H6z"
                              />

                              <path
                                strokeLinecap="round"
                                d="M9 8h6"
                              />

                            </svg>

                          </div>

                          <h2 className="text-base font-extrabold text-gray-900 sm:text-lg">

                            #
                            {order._id
                              ?.slice(-8)
                              .toUpperCase()}

                          </h2>

                        </div>


                        {/* STATUS */}

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.bg} ${status.text} ${status.border}`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />

                          {order.orderStatus}

                        </span>

                      </div>


                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">

                        <span>
                          {formatDate(
                            order.createdAt
                          )}
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

                        <span>
                          {totalItems}{" "}
                          {totalItems === 1
                            ? "item"
                            : "items"}
                        </span>

                      </div>

                    </div>


                    {/* TOTAL */}

                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-green-50/70 px-4 py-3 sm:block sm:min-w-[130px] sm:bg-transparent sm:p-0 sm:text-right">

                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Total
                      </p>

                      <p className="text-xl font-extrabold text-green-600">
                        ₹{order.total || 0}
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================
                    ORDER CONTENT
                ================================== */}

                <div className="p-5 sm:p-6">

                  {/* FOOD ITEMS */}

                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <p className="text-sm font-bold text-gray-900">
                        Ordered Food
                      </p>

                      <span className="text-xs text-gray-400">
                        {totalItems}{" "}
                        {totalItems === 1
                          ? "item"
                          : "items"}
                      </span>

                    </div>


                    <div className="space-y-2.5">

                      {order.items
                        ?.slice(0, 3)
                        .map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={
                                item.food ||
                                index
                              }
                              className="flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-3"
                            >

                              {/* IMAGE */}

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-100">

                                {item.image ? (
                                  <img
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.name ||
                                      "Food"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <svg
                                    className="h-5 w-5 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4 15c1.5-4 4.2-6 8-6s6.5 2 8 6"
                                    />

                                    <path
                                      strokeLinecap="round"
                                      d="M5 15h14"
                                    />

                                    <path
                                      strokeLinecap="round"
                                      d="M7 18h10"
                                    />

                                  </svg>
                                )}

                              </div>


                              {/* NAME */}

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-sm font-semibold text-gray-800">
                                  {item.name}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                  ₹
                                  {item.price ||
                                    0}{" "}
                                  each
                                </p>

                              </div>


                              {/* QUANTITY */}

                              <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-gray-500 shadow-sm">
                                ×
                                {item.quantity}
                              </span>

                            </div>

                          )
                        )}


                      {order.items?.length >
                        3 && (
                        <p className="px-2 text-xs font-medium text-gray-400">
                          +
                          {order.items.length -
                            3}{" "}
                          more{" "}
                          {order.items.length -
                            3 ===
                          1
                            ? "item"
                            : "items"}
                        </p>
                      )}

                    </div>

                  </div>


                  {/* =================================
                      SUMMARY BOXES
                  ================================== */}

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <SummaryBox
                      label="Items"
                      value={
                        totalItems
                      }
                      icon="cart"
                    />

                    <SummaryBox
                      label="Calories"
                      value={`${nutrition.calories} kcal`}
                      icon="calories"
                    />

                    <SummaryBox
                      label="Protein"
                      value={`${nutrition.protein} g`}
                      icon="protein"
                      highlight
                    />

                    <SummaryBox
                      label="Food Cost"
                      value={`₹${
                        order.subtotal ||
                        0
                      }`}
                      icon="money"
                    />

                  </div>


                  {/* =================================
                      NUTRITION STATUS
                  ================================== */}

                  <div
                    className={`mt-5 rounded-2xl border p-4 sm:p-5 ${
                      isDelivered &&
                      nutritionLogged
                        ? "border-green-100 bg-green-50"
                        : isCancelled
                        ? "border-gray-100 bg-gray-50"
                        : "border-orange-100 bg-orange-50"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isDelivered &&
                          nutritionLogged
                            ? "bg-green-100 text-green-600"
                            : isCancelled
                            ? "bg-gray-100 text-gray-500"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >

                        {isDelivered &&
                        nutritionLogged ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12l4 4L19 6"
                            />
                          </svg>
                        ) : isCancelled ? (
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
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
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


                      <div className="min-w-0 flex-1">

                        <p
                          className={`text-sm font-bold ${
                            isDelivered &&
                            nutritionLogged
                              ? "text-green-700"
                              : isCancelled
                              ? "text-gray-600"
                              : "text-orange-700"
                          }`}
                        >

                          {isDelivered &&
                          nutritionLogged
                            ? "Nutrition added to today's log"
                            : isCancelled
                            ? "Nutrition was not added"
                            : "Nutrition will be tracked after delivery"}

                        </p>


                        <p className="mt-1 text-xs leading-5 text-gray-500">

                          {isDelivered &&
                          nutritionLogged
                            ? `+${nutrition.calories} kcal and +${nutrition.protein}g protein were added from this order.`
                            : isCancelled
                            ? "Cancelled orders are not counted in your daily nutrition."
                            : "Once the order is delivered, its nutrition will automatically be added to your daily tracking."}

                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================
                      ACTIONS
                  ================================== */}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                    >

                      View Order Details

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
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>

                    </Link>


                    {!isDelivered &&
                      !isCancelled && (
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-green-300 hover:text-green-600"
                        >

                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
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

                          Track Order

                        </Link>
                      )}

                  </div>

                </div>

              </article>
            );
          })}

        </div>

      </div>

    </AppLayout>
  );
};


// ==========================================
// SUMMARY BOX
// ==========================================

const SummaryBox = ({
  label,
  value,
  icon,
  highlight = false,
}) => {

  const getIcon = () => {

    if (icon === "cart") {
      return (
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
            d="M3 4h2l1.5 11h11L19 8H6"
          />

          <circle
            cx="9"
            cy="19"
            r="1"
          />

          <circle
            cx="17"
            cy="19"
            r="1"
          />
        </svg>
      );
    }


    if (icon === "calories") {
      return (
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
            d="M12 3c1.5 3 4.5 4.3 4.5 8.2A4.5 4.5 0 0112 16a4.5 4.5 0 01-4.5-4.5c0-2.4 1.5-4.1 3-5.5"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 12c.8-1.2 1-2.3.7-3.5 1.5 1.2 2.3 2.6 2.3 4.2A3 3 0 0112 16a3 3 0 01-3-3c0-1.1.4-2.1 1.2-3"
          />

        </svg>
      );
    }


    if (icon === "protein") {
      return (
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
            d="M12 3l7 4v6c0 4.5-3 7-7 8-4-1-7-3.5-7-8V7l7-4z"
          />

          <path
            strokeLinecap="round"
            d="M9 12h6M12 9v6"
          />

        </svg>
      );
    }


    return (
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
          d="M12 2v20M17 5.5c0-1.7-2.2-3-5-3S7 3.8 7 5.5 9.2 8.5 12 8.5s5 1.3 5 3-2.2 3-5 3-5-1.3-5-3"
        />
      </svg>
    );
  };


  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight
          ? "bg-green-50"
          : "bg-gray-50"
      }`}
    >

      <div className="flex items-center gap-2">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            highlight
              ? "bg-green-100 text-green-600"
              : "bg-white text-gray-400"
          }`}
        >
          {getIcon()}
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>

      </div>


      <p
        className={`mt-2 text-sm font-extrabold ${
          highlight
            ? "text-green-700"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>

    </div>
  );
};


export default Orders;