import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getAdminFoods,
  deleteFood,
  toggleFoodAvailability,
} from "../api/adminApi";


// ==========================================
// ADMIN DASHBOARD
// ==========================================

const AdminDashboard = () => {

  const navigate = useNavigate();


  // ==========================================
  // STATE
  // ==========================================

  const [foods, setFoods] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [preferenceFilter, setPreferenceFilter] =
    useState("All");

  const [availabilityFilter, setAvailabilityFilter] =
    useState("All");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);


  // ==========================================
  // LOAD FOODS
  // ==========================================

  const loadFoods = async () => {

    try {

      setLoading(true);

      const data =
        await getAdminFoods();

      setFoods(
        data.foods || []
      );

    } catch (error) {

      console.error(
        "Error loading foods:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to load foods"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadFoods();
  }, []);


  // ==========================================
  // DELETE FOOD
  // ==========================================

  const handleDelete = async (
    id,
    foodName
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${foodName}"?`
      );

    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(id);

      await deleteFood(id);

      setFoods(
        (prevFoods) =>
          prevFoods.filter(
            (food) =>
              food._id !== id
          )
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete food"
      );

    } finally {

      setDeletingId(null);

    }

  };


  // ==========================================
  // TOGGLE AVAILABILITY
  // ==========================================

  const handleAvailability = async (
    id
  ) => {

    try {

      setUpdatingId(id);

      const data =
        await toggleFoodAvailability(
          id
        );

      setFoods(
        (prevFoods) =>
          prevFoods.map(
            (food) =>
              food._id === id
                ? data.food
                : food
          )
      );

    } catch (error) {

      console.error(
        "Error changing availability:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to update availability"
      );

    } finally {

      setUpdatingId(null);

    }

  };


  // ==========================================
  // STATISTICS
  // ==========================================

  const totalFoods =
    foods.length;

  const availableCount =
    foods.filter(
      (food) =>
        food.isAvailable
    ).length;

  const unavailableCount =
    totalFoods -
    availableCount;

  const categoryCount =
    new Set(
      foods
        .map(
          (food) =>
            food.category
        )
        .filter(Boolean)
    ).size;

  const preferenceCount =
    new Set(
      foods
        .map(
          (food) =>
            food.foodPreference
        )
        .filter(Boolean)
    ).size;


  // ==========================================
  // UNIQUE CATEGORIES
  // ==========================================

  const categories =
    useMemo(() => {

      return [
        ...new Set(
          foods
            .map(
              (food) =>
                food.category
            )
            .filter(Boolean)
        ),
      ].sort();

    }, [foods]);


  // ==========================================
  // FILTER FOODS
  // ==========================================

  const filteredFoods =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return foods.filter(
        (food) => {

          const matchesSearch =
            !search ||
            food.name
              ?.toLowerCase()
              .includes(search) ||
            food.description
              ?.toLowerCase()
              .includes(search) ||
            food.category
              ?.toLowerCase()
              .includes(search);


          const matchesCategory =
            categoryFilter === "All" ||
            food.category ===
              categoryFilter;


          const matchesPreference =
            preferenceFilter === "All" ||
            food.foodPreference ===
              preferenceFilter;


          const matchesAvailability =
            availabilityFilter === "All" ||
            (
              availabilityFilter ===
                "Available" &&
              food.isAvailable
            ) ||
            (
              availabilityFilter ===
                "Unavailable" &&
              !food.isAvailable
            );


          return (
            matchesSearch &&
            matchesCategory &&
            matchesPreference &&
            matchesAvailability
          );

        }
      );

    }, [
      foods,
      searchTerm,
      categoryFilter,
      preferenceFilter,
      availabilityFilter,
    ]);


  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {

    setSearchTerm("");
    setCategoryFilter("All");
    setPreferenceFilter("All");
    setAvailabilityFilter("All");

  };


  const hasFilters =
    Boolean(
      searchTerm ||
      categoryFilter !== "All" ||
      preferenceFilter !== "All" ||
      availabilityFilter !== "All"
    );


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="min-h-screen bg-[#f7f8f5] text-gray-900">

      {/* ======================================
          ADMIN HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex min-h-[72px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* BRAND */}

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-sm">

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
                  d="M7 3c2.5 1.2 4 3.4 4 6.2V21M7 3c-1.8 1.8-3 4.2-3 6.8M7 3l4 4M17 3v18M17 3c2.2 2 3 4.7 3 7.2 0 2.1-.8 3.6-3 3.6"
                />
              </svg>

            </div>


            <div className="min-w-0">

              <h1 className="truncate text-base font-extrabold sm:text-lg">
                CleanCRAVE Admin
              </h1>

              <p className="hidden text-xs text-gray-400 sm:block">
                Management Dashboard
              </p>

            </div>

          </div>


          {/* USER DASHBOARD */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-600 transition hover:border-green-300 hover:text-green-600 sm:px-4 sm:text-sm"
          >

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
                d="M19 12H5m6 6l-6-6 6-6"
              />
            </svg>

            <span className="hidden sm:inline">
              User Dashboard
            </span>

            <span className="sm:hidden">
              Dashboard
            </span>

          </button>

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">

        {/* ====================================
            TITLE + ACTIONS
        ==================================== */}

        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

          <div>

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">

              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              Administration

            </div>


            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Food Catalog
            </h1>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage CleanCRAVE's food items,
              prices, nutrition and availability.
            </p>

          </div>


          {/* ACTIONS */}

          <div className="grid grid-cols-2 gap-3 sm:flex">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:px-5 sm:text-sm"
            >

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
                  d="M4 6h16M4 10h16M7 14h10M7 18h7"
                />
              </svg>

              Manage Orders

            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/foods/new"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md sm:px-5 sm:text-sm"
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
                  d="M12 5v14M5 12h14"
                />
              </svg>

              Add New Food

            </button>

          </div>

        </div>


        {/* ====================================
            STATS
        ==================================== */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">

          <AdminStat
            label="Total Foods"
            value={totalFoods}
            type="total"
          />

          <AdminStat
            label="Available"
            value={availableCount}
            type="available"
          />

          <AdminStat
            label="Unavailable"
            value={unavailableCount}
            type="unavailable"
          />

          <AdminStat
            label="Categories"
            value={categoryCount}
            type="category"
          />

          <AdminStat
            label="Preferences"
            value={preferenceCount}
            type="preference"
          />

        </div>


        {/* ====================================
            CATALOG CARD
        ==================================== */}

        <section className="mt-7 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          {/* CATALOG HEADER */}

          <div className="border-b border-gray-100 p-5 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <h2 className="text-lg font-extrabold text-gray-900">
                    Food Items
                  </h2>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                    {filteredFoods.length}
                  </span>

                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Search, filter and manage your food catalog.
                </p>

              </div>


              <button
                type="button"
                onClick={loadFoods}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-green-300 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
              >

                <svg
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
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
                    d="M4 13a8.1 8.1 0 0014.7 4.7L20 16"
                  />
                </svg>

                {loading
                  ? "Refreshing..."
                  : "Refresh"}

              </button>

            </div>


            {/* FILTERS */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* SEARCH */}

              <FilterField label="Search">

                <div className="relative">

                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />

                    <path
                      strokeLinecap="round"
                      d="M16.5 16.5L21 21"
                    />

                  </svg>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    placeholder="Search food..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
                  />

                </div>

              </FilterField>


              {/* CATEGORY */}

              <FilterField label="Category">

                <Select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </Select>

              </FilterField>


              {/* PREFERENCE */}

              <FilterField label="Preference">

                <Select
                  value={preferenceFilter}
                  onChange={(e) =>
                    setPreferenceFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    All Preferences
                  </option>

                  <option value="Vegetarian">
                    Vegetarian
                  </option>

                  <option value="Non-Vegetarian">
                    Non-Vegetarian
                  </option>

                  <option value="Vegan">
                    Vegan
                  </option>

                  <option value="Eggitarian">
                    Eggitarian
                  </option>

                  <option value="Unknown">
                    Unknown
                  </option>

                </Select>

              </FilterField>


              {/* AVAILABILITY */}

              <FilterField label="Availability">

                <Select
                  value={availabilityFilter}
                  onChange={(e) =>
                    setAvailabilityFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    All Foods
                  </option>

                  <option value="Available">
                    Available
                  </option>

                  <option value="Unavailable">
                    Unavailable
                  </option>

                </Select>

              </FilterField>

            </div>


            {/* FILTER SUMMARY */}

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-gray-500 sm:text-sm">

                Showing{" "}

                <span className="font-bold text-gray-900">
                  {filteredFoods.length}
                </span>

                {" "}of{" "}

                <span className="font-bold text-gray-900">
                  {foods.length}
                </span>

                {" "}foods

              </p>


              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start text-xs font-bold text-green-600 transition hover:text-green-700 sm:self-auto sm:text-sm"
                >
                  Clear Filters
                </button>
              )}

            </div>

          </div>


          {/* ==================================
              CONTENT
          ================================== */}

          {loading ? (

            <LoadingState />

          ) : foods.length === 0 ? (

            <EmptyState
              type="foods"
              onAction={() =>
                navigate(
                  "/admin/foods/new"
                )
              }
            />

          ) : filteredFoods.length === 0 ? (

            <EmptyState
              type="search"
              onAction={
                clearFilters
              }
            />

          ) : (

            <>

              {/* =================================
                  DESKTOP TABLE
              ================================= */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[950px]">

                  <thead>

                    <tr className="border-b border-gray-100 bg-gray-50/80">

                      <TableHead>
                        Food
                      </TableHead>

                      <TableHead>
                        Category
                      </TableHead>

                      <TableHead>
                        Preference
                      </TableHead>

                      <TableHead>
                        Nutrition
                      </TableHead>

                      <TableHead>
                        Price
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Actions
                      </TableHead>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredFoods.map(
                      (food) => (

                        <FoodTableRow
                          key={food._id}
                          food={food}
                          updatingId={
                            updatingId
                          }
                          deletingId={
                            deletingId
                          }
                          onAvailability={
                            handleAvailability
                          }
                          onEdit={(id) =>
                            navigate(
                              `/admin/foods/edit/${id}`
                            )
                          }
                          onDelete={
                            handleDelete
                          }
                        />

                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* =================================
                  MOBILE / TABLET CARDS
              ================================= */}

              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:hidden">

                {filteredFoods.map(
                  (food) => (

                    <FoodMobileCard
                      key={food._id}
                      food={food}
                      updatingId={
                        updatingId
                      }
                      deletingId={
                        deletingId
                      }
                      onAvailability={
                        handleAvailability
                      }
                      onEdit={(id) =>
                        navigate(
                          `/admin/foods/edit/${id}`
                        )
                      }
                      onDelete={
                        handleDelete
                      }
                    />

                  )
                )}

              </div>

            </>

          )}

        </section>

      </main>

    </div>
  );
};


// ==========================================
// STAT CARD
// ==========================================

const AdminStat = ({
  label,
  value,
  type,
}) => {

  const config = {
    total: {
      icon: "food",
      bg: "bg-green-50",
      text: "text-green-600",
    },

    available: {
      icon: "check",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },

    unavailable: {
      icon: "pause",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },

    category: {
      icon: "category",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    preference: {
      icon: "leaf",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  }[type];


  return (

    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
      >

        {config.icon === "food" && (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 3v18M6 3c3 1.5 4 3.8 4 6M6 3c-2 1.5-3 3.8-3 6M18 3v18M18 3c2 2 3 4.5 3 7"
            />
          </svg>
        )}


        {config.icon === "check" && (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12l4 4L19 6"
            />
          </svg>
        )}


        {config.icon === "pause" && (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              d="M9 6v12M15 6v12"
            />
          </svg>
        )}


        {config.icon === "category" && (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <rect
              x="4"
              y="4"
              width="6"
              height="6"
              rx="1"
            />

            <rect
              x="14"
              y="4"
              width="6"
              height="6"
              rx="1"
            />

            <rect
              x="4"
              y="14"
              width="6"
              height="6"
              rx="1"
            />

            <rect
              x="14"
              y="14"
              width="6"
              height="6"
              rx="1"
            />
          </svg>
        )}


        {config.icon === "leaf" && (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 4C10 4 5 8 5 14c0 3.3 2.4 6 5.5 6C16 20 20 13 20 4z"
            />

            <path
              strokeLinecap="round"
              d="M4 20c3-5 7-7 12-9"
            />
          </svg>
        )}

      </div>


      <p className="mt-4 text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-gray-900">
        {value}
      </p>

    </div>

  );
};


// ==========================================
// FILTER FIELD
// ==========================================

const FilterField = ({
  label,
  children,
}) => {

  return (

    <div>

      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </label>

      {children}

    </div>

  );
};


// ==========================================
// SELECT
// ==========================================

const Select = ({
  children,
  ...props
}) => {

  return (

    <div className="relative">

      <select
        {...props}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
      >
        {children}
      </select>


      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 9l6 6 6-6"
        />
      </svg>

    </div>

  );
};


// ==========================================
// TABLE HEAD
// ==========================================

const TableHead = ({
  children,
}) => {

  return (
    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {children}
    </th>
  );
};


// ==========================================
// FOOD TABLE ROW
// ==========================================

const FoodTableRow = ({
  food,
  updatingId,
  deletingId,
  onAvailability,
  onEdit,
  onDelete,
}) => {

  return (

    <tr className="border-b border-gray-100 transition hover:bg-gray-50/70">

      {/* FOOD */}

      <td className="px-5 py-4">

        <div className="flex min-w-[230px] items-center gap-3">

          <FoodImage
            src={food.image}
            alt={food.name}
          />


          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-gray-900">
              {food.name}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {food.servingSize
                ? `${food.servingSize}${food.servingUnit || "g"} serving`
                : "Serving not specified"}
            </p>

          </div>

        </div>

      </td>


      {/* CATEGORY */}

      <td className="px-5 py-4 text-sm text-gray-500">
        {food.category || "—"}
      </td>


      {/* PREFERENCE */}

      <td className="px-5 py-4">

        <PreferenceBadge
          preference={
            food.foodPreference
          }
        />

      </td>


      {/* NUTRITION */}

      <td className="px-5 py-4">

        <div>

          <p className="text-sm font-bold text-gray-800">
            {Math.round(
              Number(
                food.nutrition
                  ?.calories || 0
              )
            )}{" "}
            kcal
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Protein{" "}
            {Number(
              food.nutrition
                ?.protein || 0
            ).toFixed(1)}
            g
          </p>

        </div>

      </td>


      {/* PRICE */}

      <td className="whitespace-nowrap px-5 py-4 text-sm font-extrabold text-gray-900">
        ₹
        {Number(
          food.price || 0
        ).toFixed(2)}
      </td>


      {/* STATUS */}

      <td className="px-5 py-4">

        <AvailabilityButton
          food={food}
          updatingId={updatingId}
          onClick={onAvailability}
        />

      </td>


      {/* ACTIONS */}

      <td className="px-5 py-4">

        <ActionButtons
          food={food}
          deletingId={deletingId}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      </td>

    </tr>

  );
};


// ==========================================
// MOBILE FOOD CARD
// ==========================================

const FoodMobileCard = ({
  food,
  updatingId,
  deletingId,
  onAvailability,
  onEdit,
  onDelete,
}) => {

  return (

    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

      <div className="flex gap-3">

        <FoodImage
          src={food.image}
          alt={food.name}
          large
        />


        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <h3 className="truncate text-sm font-extrabold text-gray-900">
                {food.name}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                {food.category ||
                  "Uncategorized"}
              </p>

            </div>


            <p className="shrink-0 text-sm font-extrabold text-green-600">
              ₹
              {Number(
                food.price || 0
              ).toFixed(0)}
            </p>

          </div>


          <div className="mt-3 flex flex-wrap gap-2">

            <PreferenceBadge
              preference={
                food.foodPreference
              }
            />

            <AvailabilityButton
              food={food}
              updatingId={updatingId}
              onClick={onAvailability}
              compact
            />

          </div>

        </div>

      </div>


      {/* NUTRITION */}

      <div className="mt-4 grid grid-cols-3 gap-2">

        <MiniInfo
          label="Calories"
          value={`${Math.round(
            Number(
              food.nutrition
                ?.calories || 0
            )
          )} kcal`}
        />

        <MiniInfo
          label="Protein"
          value={`${Number(
            food.nutrition
              ?.protein || 0
          ).toFixed(1)} g`}
        />

        <MiniInfo
          label="Serving"
          value={
            food.servingSize
              ? `${food.servingSize}${
                  food.servingUnit ||
                  "g"
                }`
              : "—"
          }
        />

      </div>


      {/* ACTIONS */}

      <ActionButtons
        food={food}
        deletingId={deletingId}
        onEdit={onEdit}
        onDelete={onDelete}
        fullWidth
      />

    </article>

  );
};


// ==========================================
// FOOD IMAGE
// ==========================================

const FoodImage = ({
  src,
  alt,
  large = false,
}) => {

  const [imageError, setImageError] =
    useState(false);


  if (!src || imageError) {

    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 ${
          large
            ? "h-20 w-20"
            : "h-12 w-12"
        }`}
      >

        <svg
          className={
            large
              ? "h-8 w-8"
              : "h-6 w-6"
          }
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4-5 3 3 3-4 6 7"
          />

          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
          />

        </svg>

      </div>
    );

  }


  return (
    <img
      src={src}
      alt={alt || "Food"}
      onError={() =>
        setImageError(true)
      }
      loading="lazy"
      className={`shrink-0 rounded-xl object-cover ${
        large
          ? "h-20 w-20"
          : "h-12 w-12"
      }`}
    />
  );
};


// ==========================================
// PREFERENCE BADGE
// ==========================================

const PreferenceBadge = ({
  preference,
}) => {

  const config = {
    "Non-Vegetarian": {
      className:
        "bg-red-50 text-red-600",
    },

    Vegan: {
      className:
        "bg-green-50 text-green-700",
    },

    Eggitarian: {
      className:
        "bg-yellow-50 text-yellow-700",
    },

    Vegetarian: {
      className:
        "bg-blue-50 text-blue-700",
    },

    Unknown: {
      className:
        "bg-gray-100 text-gray-500",
    },
  };


  const style =
    config[
      preference
    ] || config.Unknown;


  return (

    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${style.className}`}
    >
      {preference || "Unknown"}
    </span>

  );
};


// ==========================================
// AVAILABILITY BUTTON
// ==========================================

const AvailabilityButton = ({
  food,
  updatingId,
  onClick,
  compact = false,
}) => {

  const updating =
    updatingId === food._id;


  return (

    <button
      type="button"
      onClick={() =>
        onClick(food._id)
      }
      disabled={updating}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        food.isAvailable
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-red-50 text-red-600 hover:bg-red-100"
      } ${
        compact
          ? "px-2.5"
          : ""
      }`}
    >

      {updating ? (
        <svg
          className="h-3 w-3 animate-spin"
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
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            food.isAvailable
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
      )}

      {food.isAvailable
        ? "Available"
        : "Unavailable"}

    </button>

  );
};


// ==========================================
// ACTION BUTTONS
// ==========================================

const ActionButtons = ({
  food,
  deletingId,
  onEdit,
  onDelete,
  fullWidth = false,
}) => {

  const deleting =
    deletingId === food._id;


  return (

    <div
      className={`mt-4 flex gap-2 ${
        fullWidth
          ? "border-t border-gray-100 pt-4"
          : ""
      }`}
    >

      <button
        type="button"
        onClick={() =>
          onEdit(food._id)
        }
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
      >

        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z"
          />

          <path
            strokeLinecap="round"
            d="M14.5 7.5l2 2"
          />

        </svg>

        Edit

      </button>


      <button
        type="button"
        onClick={() =>
          onDelete(
            food._id,
            food.name
          )
        }
        disabled={deleting}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {deleting ? (
          <svg
            className="h-3.5 w-3.5 animate-spin"
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
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 7h14M10 11v6M14 11v6M8 7l1 13h6l1-13M9 7l1-3h4l1 3"
            />
          </svg>
        )}

        {deleting
          ? "Deleting..."
          : "Delete"}

      </button>

    </div>

  );
};


// ==========================================
// MINI INFO
// ==========================================

const MiniInfo = ({
  label,
  value,
}) => {

  return (

    <div className="rounded-xl bg-gray-50 p-2.5 text-center">

      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-gray-700">
        {value}
      </p>

    </div>

  );
};


// ==========================================
// LOADING STATE
// ==========================================

const LoadingState = () => {

  return (

    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">

      {Array.from({
        length: 6,
      }).map((_, index) => (

        <div
          key={index}
          className="animate-pulse rounded-2xl border border-gray-100 p-4"
        >

          <div className="flex gap-3">

            <div className="h-20 w-20 rounded-xl bg-gray-100" />

            <div className="flex-1">

              <div className="h-4 w-3/4 rounded bg-gray-100" />

              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />

              <div className="mt-4 h-6 w-20 rounded-full bg-gray-100" />

            </div>

          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">

            <div className="h-12 rounded-xl bg-gray-100" />
            <div className="h-12 rounded-xl bg-gray-100" />
            <div className="h-12 rounded-xl bg-gray-100" />

          </div>

        </div>

      ))}

    </div>

  );
};


// ==========================================
// EMPTY STATE
// ==========================================

const EmptyState = ({
  type,
  onAction,
}) => {

  const noFoods =
    type === "foods";


  return (

    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >

          {noFoods ? (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3v18M6 3c3 1.5 4 3.8 4 6M18 3v18"
              />

              <path
                strokeLinecap="round"
                d="M3 9h7"
              />
            </>
          ) : (
            <>
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path
                strokeLinecap="round"
                d="M16.5 16.5L21 21"
              />
            </>
          )}

        </svg>

      </div>


      <h3 className="mt-5 text-lg font-extrabold text-gray-900">

        {noFoods
          ? "No foods yet"
          : "No matching foods"}

      </h3>


      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">

        {noFoods
          ? "Add your first food item to start building the CleanCRAVE catalog."
          : "Try changing your search or filters to find what you're looking for."}

      </p>


      <button
        type="button"
        onClick={onAction}
        className="mt-6 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
      >

        {noFoods
          ? "Add New Food"
          : "Clear Filters"}

      </button>

    </div>

  );
};


export default AdminDashboard;