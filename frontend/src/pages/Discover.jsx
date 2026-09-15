import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from "../components/AppLayout";
import FoodCard from "../components/FoodCard";

import { getFoods } from "../api/foodApi";

const Discover = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preference, setPreference] = useState("");

  useEffect(() => {
    loadFoods();
  }, [preference]);

  const loadFoods = async () => {
    try {
      setLoading(true);

      const data = await getFoods({
        available: true,
        ...(preference ? { preference } : {}),
      });

      setFoods(data.foods || []);
    } catch (error) {
      console.error("Failed to load foods:", error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return foods;
    }

    return foods.filter((food) => {
      const name = food.name?.toLowerCase() || "";
      const category = food.category?.toLowerCase() || "";
      const description =
        food.description?.toLowerCase() || "";

      return (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      );
    });
  }, [foods, search]);

  const filters = [
    {
      value: "",
      label: "All Foods",
      icon: "🍽️",
    },
    {
      value: "Vegetarian",
      label: "Vegetarian",
      icon: "🥗",
    },
    {
      value: "Vegan",
      label: "Vegan",
      icon: "🌱",
    },
    {
      value: "Eggitarian",
      label: "Eggitarian",
      icon: "🥚",
    },
    {
      value: "Non-Vegetarian",
      label: "Non-Veg",
      icon: "🍗",
    },
  ];

  return (
    <AppLayout>
      <div className="w-full">

        {/* =========================================
            HERO / PAGE INTRO
        ========================================== */}

        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 px-5 py-7 text-white shadow-lg shadow-green-100 sm:px-8 sm:py-9 lg:px-10">

          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
              <span>🥗</span>
              Food Discovery
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Discover food that
              <span className="text-green-100">
                {" "}fits you.
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Find meals that match your taste, nutrition goals,
              and budget.
            </p>

          </div>
        </section>

        {/* =========================================
            SEARCH
        ========================================== */}

        <section className="mb-5">

          <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm transition-all duration-200 focus-within:border-green-300 focus-within:ring-4 focus-within:ring-green-50">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-focus-within:text-green-600"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path
                strokeLinecap="round"
                d="m16 16 4.5 4.5"
              />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search paneer, rice, chicken..."
              className="min-w-0 flex-1 bg-transparent py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    d="M6 6l12 12M18 6 6 18"
                  />
                </svg>
              </button>
            )}

          </div>

        </section>

        {/* =========================================
            FILTERS
        ========================================== */}

        <section className="mb-8">

          <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
            <div className="flex min-w-max gap-2">

              {filters.map((filter) => {
                const isActive =
                  preference === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setPreference(filter.value)
                    }
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                      isActive
                        ? "bg-green-600 text-white shadow-md shadow-green-100"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    <span>{filter.icon}</span>
                    {filter.label}
                  </button>
                );
              })}

            </div>
          </div>

        </section>

        {/* =========================================
            RESULTS HEADER
        ========================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="flex items-center gap-2">

              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {preference || search
                  ? "Your results"
                  : "All foods"}
              </h2>

              {!loading && (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                  {filteredFoods.length}
                </span>
              )}

            </div>

            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              {loading
                ? "Finding meals for you..."
                : search
                ? `Showing results for "${search}"`
                : `${filteredFoods.length} meals available`}
            </p>
          </div>

          {/* Refresh */}

          <button
            type="button"
            onClick={loadFoods}
            disabled={loading}
            className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 11a8 8 0 0 0-14.9-4M4 13a8 8 0 0 0 14.9 4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 5v6h-6M4 19v-6h6"
              />
            </svg>

            Refresh
          </button>

        </div>

        {/* =========================================
            LOADING SKELETONS
        ========================================== */}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <FoodSkeleton key={item} />
              )
            )}

          </div>
        ) : filteredFoods.length === 0 ? (

          /* =======================================
             EMPTY STATE
          ======================================== */

          <div className="rounded-3xl border border-gray-100 bg-white px-5 py-14 text-center shadow-sm sm:px-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50">
              <span className="text-4xl">
                🔎
              </span>
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900 sm:text-xl">
              No foods found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              We couldn't find meals matching your search
              or selected preference. Try another search or
              filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPreference("");
              }}
              className="mt-6 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md"
            >
              Clear filters
            </button>

          </div>
        ) : (

          /* =======================================
             FOOD GRID
          ======================================== */

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

            {filteredFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
              />
            ))}

          </div>
        )}

      </div>
    </AppLayout>
  );
};

/* ==========================================
   FOOD CARD SKELETON
========================================== */

const FoodSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

      {/* Image */}

      <div className="aspect-[4/3] animate-pulse bg-gray-200" />

      {/* Content */}

      <div className="space-y-4 p-4 sm:p-5">

        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />
        </div>

        <div className="grid grid-cols-3 gap-2">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}

        </div>

        <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">

          <div className="h-8 w-14 animate-pulse rounded-lg bg-gray-100" />

          <div className="h-10 w-20 animate-pulse rounded-xl bg-gray-200" />

        </div>

      </div>
    </div>
  );
};

export default Discover;