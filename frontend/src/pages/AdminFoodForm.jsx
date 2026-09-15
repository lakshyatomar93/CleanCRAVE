import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createFood,
  updateFood,
} from "../api/adminApi";

import {
  getFoodById,
} from "../api/foodApi";


const emptyFood = {
  name: "",
  description: "",
  category: "Indian",
  price: "",
  servingSize: 100,
  servingUnit: "g",
  image: "",
  foodPreference: "Vegetarian",

  nutrition: {
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    fiber: "",
    sugar: "",
    sodium: "",
  },

  isAvailable: true,
};


// ==========================================
// ADMIN FOOD FORM
// ==========================================

const AdminFoodForm = () => {

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const editing =
    Boolean(id);


  const [form, setForm] =
    useState(emptyFood);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);


  // ==========================================
  // LOAD FOOD WHEN EDITING
  // ==========================================

  useEffect(() => {

    if (!editing) {
      return;
    }


    const loadFood = async () => {

      try {

        const data =
          await getFoodById(id);

        setForm({
          ...emptyFood,
          ...data.food,
          nutrition: {
            ...emptyFood.nutrition,
            ...(data.food?.nutrition || {}),
          },
        });

      } catch (error) {

        console.error(
          "Error loading food:",
          error
        );

        alert(
          error.response?.data?.message ||
          "Failed to load food"
        );

      } finally {

        setLoading(false);

      }

    };


    loadFood();

  }, [id, editing]);


  // ==========================================
  // BASIC FIELD CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

  };


  // ==========================================
  // NUTRITION FIELD CHANGE
  // ==========================================

  const handleNutritionChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;


      setForm(
        (prev) => ({
          ...prev,

          nutrition: {
            ...prev.nutrition,
            [name]: value,
          },

        })
      );

    };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();


    // ------------------------------
    // Basic validation
    // ------------------------------

    if (!form.name.trim()) {

      alert(
        "Please enter a food name."
      );

      return;

    }


    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {

      alert(
        "Please enter a valid price."
      );

      return;

    }


    if (
      form.servingSize === "" ||
      Number(form.servingSize) <= 0
    ) {

      alert(
        "Please enter a valid serving size."
      );

      return;

    }


    setSaving(true);


    try {

      const foodData = {

        ...form,

        name: form.name.trim(),

        description:
          form.description?.trim() ||
          "",

        category:
          form.category?.trim() ||
          "Indian",

        price:
          Number(form.price),

        servingSize:
          Number(form.servingSize),

        nutrition: {

          calories:
            Number(
              form.nutrition.calories || 0
            ),

          protein:
            Number(
              form.nutrition.protein || 0
            ),

          carbohydrates:
            Number(
              form.nutrition.carbohydrates || 0
            ),

          fat:
            Number(
              form.nutrition.fat || 0
            ),

          fiber:
            Number(
              form.nutrition.fiber || 0
            ),

          sugar:
            Number(
              form.nutrition.sugar || 0
            ),

          sodium:
            Number(
              form.nutrition.sodium || 0
            ),

        },

      };


      if (editing) {

        await updateFood(
          id,
          foodData
        );

      } else {

        await createFood(
          foodData
        );

      }


      navigate("/admin");

    } catch (error) {

      console.error(
        "Error saving food:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to save food"
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {

    return (

      <div className="min-h-screen bg-[#f7f8f5]">

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="animate-pulse">

            <div className="h-4 w-36 rounded bg-gray-200" />

            <div className="mt-8 h-8 w-64 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-200" />


            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-5 sm:p-8">

              <div className="grid gap-5 md:grid-cols-2">

                {Array.from({
                  length: 8,
                }).map((_, index) => (

                  <div
                    key={index}
                    className={
                      index === 7
                        ? "md:col-span-2"
                        : ""
                    }
                  >

                    <div className="h-3 w-24 rounded bg-gray-200" />

                    <div className="mt-2 h-12 rounded-xl bg-gray-100" />

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="min-h-screen bg-[#f7f8f5] text-gray-900">


      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-gray-100 bg-white">

        <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">

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
                  d="M7 3c2.5 1.2 4 3.4 4 6.2V21M17 3v18M7 3c-1.8 1.8-3 4.2-3 6.8"
                />
              </svg>

            </div>


            <div>

              <p className="text-sm font-extrabold text-gray-900">
                CleanCRAVE Admin
              </p>

              <p className="hidden text-[10px] text-gray-400 sm:block">
                Food Catalog Management
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-600 transition hover:border-green-300 hover:text-green-600 sm:px-4 sm:text-sm"
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
              Back to Food Catalog
            </span>

            <span className="sm:hidden">
              Back
            </span>

          </button>

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">


        {/* ====================================
            PAGE INTRO
        ==================================== */}

        <div className="mb-6">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">
            Food Catalog
          </p>


          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">

            {editing
              ? "Edit Food"
              : "Add New Food"}

          </h1>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            {editing
              ? "Update food details, nutrition information and availability."
              : "Add a food item with the information used by CleanCRAVE's recommendation engine."}
          </p>

        </div>


        {/* ====================================
            FORM CARD
        ==================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
        >


          {/* =================================
              BASIC INFORMATION
          ================================= */}

          <section className="p-5 sm:p-7 lg:p-8">

            <SectionHeader
              number="01"
              title="Basic Information"
              description="General information about the food item."
            />


            <div className="mt-7 grid gap-5 md:grid-cols-2">


              <Input
                label="Food Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Paneer Tikka"
                required
              />


              <Input
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Indian"
              />


              <Input
                label="Price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="120"
                prefix="₹"
                required
              />


              <div className="grid grid-cols-2 gap-3">

                <Input
                  label="Serving Size"
                  name="servingSize"
                  type="number"
                  min="1"
                  step="1"
                  value={form.servingSize}
                  onChange={handleChange}
                  placeholder="100"
                />


                <Input
                  label="Unit"
                  name="servingUnit"
                  value={form.servingUnit}
                  onChange={handleChange}
                  placeholder="g"
                />

              </div>


              {/* PREFERENCE */}

              <SelectField
                label="Food Preference"
                name="foodPreference"
                value={
                  form.foodPreference
                }
                onChange={handleChange}
              >

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

              </SelectField>


              {/* IMAGE */}

              <div className="md:col-span-2">

                <Input
                  label="Image URL"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://images.pexels.com/..."
                />

                <p className="mt-2 text-[11px] leading-5 text-gray-400">
                  Use a direct image URL. Avoid search-result or webpage URLs.
                </p>

              </div>


              {/* IMAGE PREVIEW */}

              {form.image && (
                <div className="md:col-span-2">

                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">

                      <img
                        src={form.image}
                        alt="Food preview"
                        className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-36"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />


                      <div>

                        <p className="text-sm font-bold text-gray-800">
                          Image Preview
                        </p>

                        <p className="mt-1 break-all text-xs text-gray-400">
                          {form.image}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              )}


              {/* DESCRIPTION */}

              <TextArea
                label="Description"
                name="description"
                value={
                  form.description
                }
                onChange={handleChange}
                placeholder="Describe the food, ingredients or preparation..."
              />

            </div>

          </section>


          {/* =================================
              NUTRITION
          ================================= */}

          <section className="border-t border-gray-100 bg-gray-50/40 p-5 sm:p-7 lg:p-8">

            <SectionHeader
              number="02"
              title="Nutrition Information"
              description="Nutrition values should be entered per serving."
            />


            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <NutritionInput
                label="Calories"
                name="calories"
                value={
                  form.nutrition.calories
                }
                onChange={
                  handleNutritionChange
                }
                unit="kcal"
              />


              <NutritionInput
                label="Protein"
                name="protein"
                value={
                  form.nutrition.protein
                }
                onChange={
                  handleNutritionChange
                }
                unit="g"
              />


              <NutritionInput
                label="Carbohydrates"
                name="carbohydrates"
                value={
                  form.nutrition.carbohydrates
                }
                onChange={
                  handleNutritionChange
                }
                unit="g"
              />


              <NutritionInput
                label="Fat"
                name="fat"
                value={
                  form.nutrition.fat
                }
                onChange={
                  handleNutritionChange
                }
                unit="g"
              />


              <NutritionInput
                label="Fiber"
                name="fiber"
                value={
                  form.nutrition.fiber
                }
                onChange={
                  handleNutritionChange
                }
                unit="g"
              />


              <NutritionInput
                label="Sugar"
                name="sugar"
                value={
                  form.nutrition.sugar
                }
                onChange={
                  handleNutritionChange
                }
                unit="g"
              />


              <NutritionInput
                label="Sodium"
                name="sodium"
                value={
                  form.nutrition.sodium
                }
                onChange={
                  handleNutritionChange
                }
                unit="mg"
              />

            </div>


            {/* NUTRITION NOTE */}

            <div className="mt-5 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-600">

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
                    r="9"
                  />

                  <path
                    strokeLinecap="round"
                    d="M12 10v6M12 7h.01"
                  />

                </svg>

              </div>


              <div>

                <p className="text-xs font-bold text-green-800">
                  Nutrition accuracy matters
                </p>

                <p className="mt-1 text-[11px] leading-5 text-green-700/80">
                  These values are used for CleanCRAVE recommendations, cart nutrition and daily nutrition tracking.
                </p>

              </div>

            </div>

          </section>


          {/* =================================
              AVAILABILITY
          ================================= */}

          <section className="border-t border-gray-100 p-5 sm:p-7 lg:p-8">

            <SectionHeader
              number="03"
              title="Availability"
              description="Control whether users can currently order this food."
            />


            <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-green-200 sm:p-5">

              <div className="flex min-w-0 items-center gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    form.isAvailable
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >

                  {form.isAvailable ? (
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
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        d="M9 6v12M15 6v12"
                      />
                    </svg>
                  )}

                </div>


                <div className="min-w-0">

                  <p className="text-sm font-bold text-gray-800">
                    Food is currently available
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Users can see and order this food.
                  </p>

                </div>

              </div>


              <div className="relative shrink-0">

                <input
                  type="checkbox"
                  checked={
                    Boolean(
                      form.isAvailable
                    )
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        isAvailable:
                          e.target.checked,
                      })
                    )
                  }
                  className="peer sr-only"
                />


                <div className="h-7 w-12 rounded-full bg-gray-200 transition peer-checked:bg-green-600" />


                <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />

              </div>

            </label>

          </section>


          {/* =================================
              ACTIONS
          ================================= */}

          <div className="border-t border-gray-100 bg-gray-50/60 p-5 sm:p-7 lg:px-8">

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving && (
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
                )}

                {saving
                  ? "Saving..."
                  : editing
                  ? "Update Food"
                  : "Create Food"}

              </button>

            </div>

          </div>

        </form>

      </main>

    </div>

  );
};


// ==========================================
// SECTION HEADER
// ==========================================

const SectionHeader = ({
  number,
  title,
  description,
}) => {

  return (

    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[10px] font-extrabold text-green-600">
        {number}
      </div>


      <div>

        <h2 className="text-base font-extrabold text-gray-900 sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-gray-400">
          {description}
        </p>

      </div>

    </div>

  );
};


// ==========================================
// INPUT
// ==========================================

const Input = ({
  label,
  prefix,
  suffix,
  ...props
}) => {

  return (

    <div>

      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>


      <div className="relative">

        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
            {prefix}
          </span>
        )}


        <input
          {...props}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 ${
            prefix
              ? "pl-9 pr-4"
              : suffix
              ? "pl-4 pr-12"
              : "px-4"
          }`}
        />


        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
            {suffix}
          </span>
        )}

      </div>

    </div>

  );
};


// ==========================================
// TEXT AREA
// ==========================================

const TextArea = ({
  label,
  ...props
}) => {

  return (

    <div className="md:col-span-2">

      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>


      <textarea
        {...props}
        rows={4}
        className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
      />

    </div>

  );
};


// ==========================================
// SELECT FIELD
// ==========================================

const SelectField = ({
  label,
  children,
  ...props
}) => {

  return (

    <div>

      <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>


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

    </div>

  );
};


// ==========================================
// NUTRITION INPUT
// ==========================================

const NutritionInput = ({
  label,
  name,
  value,
  onChange,
  unit,
}) => {

  return (

    <Input
      label={label}
      name={name}
      type="number"
      min="0"
      step="0.1"
      value={value}
      onChange={onChange}
      placeholder="0"
      suffix={unit}
    />

  );
};


export default AdminFoodForm;