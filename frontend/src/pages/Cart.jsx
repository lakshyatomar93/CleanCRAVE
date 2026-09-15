import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";

import {
  getCart,
  updateCartItem,
  removeFromCart,
} from "../api/cartApi";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  /* ==========================================
     LOAD CART
  ========================================== */

  const loadCart = async () => {
    try {
      setLoading(true);

      const data = await getCart();

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  /* ==========================================
     UPDATE QUANTITY
  ========================================== */

  const updateQuantity = async (foodId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingItem(foodId);

      const data = await updateCartItem(
        foodId,
        quantity
      );

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to update quantity:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update quantity"
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  /* ==========================================
     REMOVE ITEM
  ========================================== */

  const removeItem = async (foodId) => {
    try {
      setRemovingItem(foodId);

      const data = await removeFromCart(foodId);

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to remove item:", error);

      alert(
        error.response?.data?.message ||
          "Unable to remove item"
      );
    } finally {
      setRemovingItem(null);
    }
  };

  /* ==========================================
     IMAGE ERROR
  ========================================== */

  const handleImageError = (foodId) => {
    setImageErrors((previous) => ({
      ...previous,
      [foodId]: true,
    }));
  };

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <AppLayout>
        <CartSkeleton />
      </AppLayout>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary || {};

  const subtotal = Number(summary.subtotal) || 0;

  const deliveryFee =
    subtotal >= 300 ? 0 : 30;

  const total = subtotal + deliveryFee;

  /* ==========================================
     EMPTY CART
  ========================================== */

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-14">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-green-50">
              <span className="text-5xl">
                🛒
              </span>
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              You haven't added anything yet. Discover
              something delicious that fits your goals.
            </p>

            <Link
              to="/discover"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-green-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg"
            >
              Discover Food

              <span>→</span>
            </Link>

          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full">

        {/* ======================================
            PAGE HEADER
        ======================================= */}

        <div className="mb-7">

          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-green-700">
            <span>🛒</span>
            Your Selection
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                My Cart
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review your food before placing the order.
              </p>
            </div>

            <Link
              to="/discover"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-green-600 transition hover:text-green-700"
            >
              ← Continue shopping
            </Link>

          </div>
        </div>

        {/* ======================================
            MAIN CONTENT
        ======================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">

          {/* ==================================
              CART ITEMS
          =================================== */}

          <section className="min-w-0">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Selected meals
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  {summary.itemCount || items.length}{" "}
                  item
                  {(summary.itemCount || items.length) !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="hidden rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 sm:block">
                {items.length} meal
                {items.length !== 1 ? "s" : ""}
              </div>

            </div>

            <div className="space-y-4">

              {items.map((item) => {
                const food = item.food;

                if (!food) return null;

                const nutrition =
                  food.nutrition || {};

                const foodId = food._id;

                const itemTotal =
                  (Number(food.price) || 0) *
                  item.quantity;

                const isUpdating =
                  updatingItem === foodId;

                const isRemoving =
                  removingItem === foodId;

                return (
                  <article
                    key={foodId}
                    className={`overflow-hidden rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all duration-200 sm:p-4 ${
                      isRemoving
                        ? "opacity-50"
                        : "hover:border-green-100 hover:shadow-md"
                    }`}
                  >

                    <div className="flex gap-3 sm:gap-5">

                      {/* ==========================
                          IMAGE
                      =========================== */}

                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-32 sm:w-32">

                        {imageErrors[foodId] ||
                        !food.image ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-3xl">
                              🍽️
                            </span>
                          </div>
                        ) : (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="h-full w-full object-cover"
                            onError={() =>
                              handleImageError(foodId)
                            }
                          />
                        )}

                      </div>

                      {/* ==========================
                          DETAILS
                      =========================== */}

                      <div className="min-w-0 flex-1">

                        {/* Top row */}

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                              {food.name}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">

                              {food.foodPreference && (
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                  {food.foodPreference}
                                </span>
                              )}

                              <span className="text-[10px] text-gray-400">
                                {food.servingSize || 100}
                                {food.servingUnit || "g"}
                              </span>

                            </div>

                          </div>

                          {/* Remove */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(foodId)
                            }
                            disabled={
                              isRemoving ||
                              isUpdating
                            }
                            aria-label={`Remove ${food.name}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isRemoving ? (
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
                                  strokeWidth="2.5"
                                  className="opacity-30"
                                />

                                <path
                                  d="M21 12a9 9 0 0 1-9 9"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  d="M6 6l12 12M18 6 6 18"
                                />
                              </svg>
                            )}
                          </button>

                        </div>

                        {/* Nutrition */}

                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-gray-500 sm:text-xs">

                          <span className="flex items-center gap-1">
                            <span>🔥</span>
                            {Math.round(
                              Number(
                                nutrition.calories
                              ) || 0
                            )}{" "}
                            kcal
                          </span>

                          <span className="flex items-center gap-1">
                            <span>💪</span>
                            {Math.round(
                              Number(
                                nutrition.protein
                              ) || 0
                            )}{" "}
                            g protein
                          </span>

                        </div>

                        {/* Bottom row */}

                        <div className="mt-4 flex items-center justify-between gap-3">

                          {/* Quantity */}

                          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  foodId,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                isUpdating ||
                                isRemoving
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-white hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              −
                            </button>

                            <div className="flex h-9 min-w-8 items-center justify-center border-x border-gray-200 bg-white px-2 text-sm font-bold text-gray-800">
                              {isUpdating ? (
                                <svg
                                  className="h-4 w-4 animate-spin text-green-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="opacity-30"
                                  />

                                  <path
                                    d="M21 12a9 9 0 0 1-9 9"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              ) : (
                                item.quantity
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  foodId,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                isUpdating ||
                                isRemoving
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-white hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              +
                            </button>

                          </div>

                          {/* Price */}

                          <div className="text-right">

                            <p className="text-[10px] text-gray-400">
                              ₹{food.price} ×{" "}
                              {item.quantity}
                            </p>

                            <p className="text-base font-extrabold text-green-600 sm:text-lg">
                              ₹{itemTotal}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          </section>

          {/* ==================================
              ORDER SUMMARY
          =================================== */}

          <aside className="min-w-0">

            <div className="sticky top-24 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

              {/* Summary Header */}

              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    <span>🧾</span>
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Order Summary
                    </h2>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Your CleanCRAVE selection
                    </p>
                  </div>

                </div>

              </div>

              {/* Price Details */}

              <div className="px-5 py-5 sm:px-6">

                <div className="space-y-4 text-sm">

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      Items
                    </span>

                    <span className="font-semibold text-gray-800">
                      {summary.itemCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-gray-800">
                      ₹{subtotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      Delivery
                    </span>

                    {deliveryFee === 0 ? (
                      <span className="font-bold text-green-600">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-800">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>

                </div>

                {/* Free delivery message */}

                {subtotal < 300 && (
                  <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-3">

                    <div className="flex items-start gap-2">

                      <span className="text-sm">
                        🚚
                      </span>

                      <p className="text-[11px] leading-5 text-green-700">
                        Add{" "}
                        <strong>
                          ₹{300 - subtotal}
                        </strong>{" "}
                        more to your cart to unlock
                        free delivery.
                      </p>

                    </div>

                  </div>
                )}

                {/* Total */}

                <div className="mt-6 flex items-end justify-between border-t border-gray-100 pt-5">

                  <div>
                    <p className="text-xs text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      Including delivery
                    </p>
                  </div>

                  <span className="text-2xl font-extrabold tracking-tight text-green-600">
                    ₹{total}
                  </span>

                </div>

              </div>

              {/* ==================================
                  NUTRITION SUMMARY
              =================================== */}

              <div className="mx-5 mb-5 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:mx-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-700">
                      Cart Nutrition
                    </p>

                    <p className="mt-1 text-[11px] text-green-700/60">
                      Total for selected meals
                    </p>
                  </div>

                  <span className="text-lg">
                    🥗
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">

                  <NutritionStat
                    icon="🔥"
                    value={summary.totalCalories}
                    unit="kcal"
                    label="Calories"
                  />

                  <NutritionStat
                    icon="💪"
                    value={summary.totalProtein}
                    unit="g"
                    label="Protein"
                  />

                  <NutritionStat
                    icon="🌾"
                    value={summary.totalCarbohydrates}
                    unit="g"
                    label="Carbs"
                  />

                  <NutritionStat
                    icon="🥑"
                    value={summary.totalFat}
                    unit="g"
                    label="Fat"
                  />

                </div>

              </div>

              {/* Checkout */}

              <div className="px-5 pb-5 sm:px-6 sm:pb-6">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/checkout")
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl hover:shadow-green-200"
                >
                  Proceed to Checkout

                  <span>→</span>
                </button>

                <p className="mt-3 text-center text-[10px] leading-4 text-gray-400">
                  You can review your delivery details
                  and payment method next.
                </p>

              </div>

            </div>

          </aside>

        </div>
      </div>
    </AppLayout>
  );
};

/* ==========================================
   NUTRITION STAT
========================================== */

const NutritionStat = ({
  icon,
  value,
  unit,
  label,
}) => {
  return (
    <div className="rounded-xl bg-white/70 p-3">

      <div className="flex items-center gap-1.5">
        <span className="text-xs">
          {icon}
        </span>

        <span className="text-[10px] font-medium text-green-700/70">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-sm font-extrabold text-green-800">
        {Math.round(Number(value) || 0)}

        <span className="ml-0.5 text-[9px] font-medium text-green-600">
          {unit}
        </span>
      </p>

    </div>
  );
};

/* ==========================================
   CART SKELETON
========================================== */

const CartSkeleton = () => {
  return (
    <div className="w-full">

      {/* Header */}

      <div className="mb-7 space-y-3">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-gray-200" />

        <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

        {/* Items */}

        <div className="space-y-4">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="flex gap-4">

                <div className="h-28 w-28 shrink-0 animate-pulse rounded-2xl bg-gray-200" />

                <div className="flex-1 space-y-4">

                  <div className="h-5 w-2/3 animate-pulse rounded-lg bg-gray-200" />

                  <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />

                  <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />

                  <div className="flex justify-between">
                    <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-100" />
                    <div className="h-6 w-16 animate-pulse rounded-lg bg-gray-200" />
                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Summary */}

        <div className="h-[500px] animate-pulse rounded-3xl bg-white" />

      </div>
    </div>
  );
};

export default Cart;