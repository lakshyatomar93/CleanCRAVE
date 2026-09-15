import React, {
  useState,
} from "react";

import AppLayout from "../components/AppLayout";

import {
  updateProfile,
} from "../api/userApi";


// ==========================================
// PROFILE PAGE
// ==========================================

const Profile = () => {

  // ==========================================
  // GET STORED USER
  // ==========================================

  const storedUser = (() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("user")
        ) || {}
      );
    } catch {
      return {};
    }
  })();


  // ==========================================
  // PROFILE STATE
  // ==========================================

  const [user, setUser] =
    useState({
      name: storedUser.name || "",
      email: storedUser.email || "",
      age: storedUser.age || "",
      gender: storedUser.gender || "",
      height: storedUser.height || "",
      weight: storedUser.weight || "",
      activityLevel:
        storedUser.activityLevel || "",
      foodPreference:
        storedUser.foodPreference || "",
      goal: storedUser.goal || "",
      dailyBudget:
        storedUser.dailyBudget ?? 300,
    });


  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages while editing
    if (message) {
      setMessage("");
    }

    if (error) {
      setError("");
    }
  };


  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const saveProfile = async () => {

    try {

      setSaving(true);
      setMessage("");
      setError("");


      // ========================================
      // BASIC VALIDATION
      // ========================================

      if (!user.name.trim()) {
        setError(
          "Name is required."
        );
        return;
      }


      if (!user.email.trim()) {
        setError(
          "Email is required."
        );
        return;
      }


      if (
        user.age &&
        (
          Number(user.age) <= 0 ||
          Number(user.age) > 120
        )
      ) {
        setError(
          "Please enter a valid age between 1 and 120."
        );
        return;
      }


      if (
        user.height &&
        Number(user.height) <= 0
      ) {
        setError(
          "Please enter a valid height."
        );
        return;
      }


      if (
        user.weight &&
        Number(user.weight) <= 0
      ) {
        setError(
          "Please enter a valid weight."
        );
        return;
      }


      if (
        user.dailyBudget === "" ||
        Number(user.dailyBudget) < 0
      ) {
        setError(
          "Daily budget cannot be negative."
        );
        return;
      }


      // ========================================
      // SEND TO BACKEND
      // ========================================

      const data =
        await updateProfile({
          name: user.name.trim(),

          email: user.email.trim(),

          age: user.age
            ? Number(user.age)
            : undefined,

          gender:
            user.gender || undefined,

          height: user.height
            ? Number(user.height)
            : undefined,

          weight: user.weight
            ? Number(user.weight)
            : undefined,

          activityLevel:
            user.activityLevel ||
            undefined,

          foodPreference:
            user.foodPreference ||
            undefined,

          goal:
            user.goal ||
            undefined,

          dailyBudget:
            Number(user.dailyBudget),
        });


      // ========================================
      // UPDATE LOCAL STORAGE
      // ========================================

      if (data?.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );


        setUser({
          name:
            data.user.name || "",

          email:
            data.user.email || "",

          age:
            data.user.age || "",

          gender:
            data.user.gender || "",

          height:
            data.user.height || "",

          weight:
            data.user.weight || "",

          activityLevel:
            data.user.activityLevel ||
            "",

          foodPreference:
            data.user.foodPreference ||
            "",

          goal:
            data.user.goal || "",

          dailyBudget:
            data.user.dailyBudget ??
            300,
        });
      }


      setMessage(
        "Profile updated successfully!"
      );

    } catch (err) {

      console.error(
        "PROFILE UPDATE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update profile."
      );

    } finally {

      setSaving(false);

    }

  };


  return (
    <AppLayout>

      <div className="mx-auto w-full max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-7 sm:mb-8">

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-600">

            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

            Account Settings

          </div>


          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            My Profile
          </h1>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Update your personal information,
            nutrition preferences and daily budget.
          </p>

        </div>


        {/* ======================================
            PROFILE CARD
        ====================================== */}

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          {/* ====================================
              PROFILE HEADER
          ==================================== */}

          <div className="border-b border-gray-100 bg-gradient-to-br from-green-50 via-white to-white p-5 sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              {/* AVATAR */}

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-xl font-extrabold text-white shadow-sm">

                {user.name
                  ? user.name
                      .trim()
                      .charAt(0)
                      .toUpperCase()
                  : "U"}

              </div>


              <div className="min-w-0">

                <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                  Personal Profile
                </p>

                <h2 className="mt-1 truncate text-xl font-extrabold text-gray-900">
                  {user.name ||
                    "CleanCRAVE User"}
                </h2>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {user.email ||
                    "Add your email address"}
                </p>

              </div>

            </div>

          </div>


          {/* ====================================
              FORM
          ==================================== */}

          <div className="p-5 sm:p-7 lg:p-8">

            {/* ==================================
                PERSONAL INFORMATION
            ================================== */}

            <section>

              <SectionHeading
                icon="user"
                title="Personal Information"
                description="Keep your basic information up to date."
              />


              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <ProfileInput
                  label="Name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />


                <ProfileInput
                  label="Email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />


                <ProfileInput
                  label="Age"
                  name="age"
                  type="number"
                  value={user.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  min="1"
                  max="120"
                  inputMode="numeric"
                />


                <ProfileSelect
                  label="Gender"
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                  ]}
                  placeholder="Select gender"
                />


                <ProfileInput
                  label="Height"
                  suffix="cm"
                  name="height"
                  type="number"
                  value={user.height}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  min="1"
                  inputMode="decimal"
                />


                <ProfileInput
                  label="Weight"
                  suffix="kg"
                  name="weight"
                  type="number"
                  value={user.weight}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  min="1"
                  inputMode="decimal"
                />

              </div>

            </section>


            {/* ==================================
                FITNESS & NUTRITION
            ================================== */}

            <section className="mt-9 border-t border-gray-100 pt-8">

              <SectionHeading
                icon="fitness"
                title="Fitness & Nutrition"
                description="These preferences help CleanCRAVE personalize your nutrition targets."
              />


              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <ProfileSelect
                  label="Activity Level"
                  name="activityLevel"
                  value={user.activityLevel}
                  onChange={handleChange}
                  options={[
                    "Sedentary",
                    "Light",
                    "Moderate",
                    "Active",
                    "Very Active",
                  ]}
                  placeholder="Select activity level"
                />


                <ProfileSelect
                  label="Goal"
                  name="goal"
                  value={user.goal}
                  onChange={handleChange}
                  options={[
                    "Lose",
                    "Maintain",
                    "Gain",
                    "Muscle Gain",
                  ]}
                  placeholder="Select your goal"
                />


                <ProfileSelect
                  label="Food Preference"
                  name="foodPreference"
                  value={user.foodPreference}
                  onChange={handleChange}
                  options={[
                    "Vegetarian",
                    "Non-Vegetarian",
                    "Vegan",
                    "Eggitarian",
                  ]}
                  placeholder="Select food preference"
                />


                <ProfileInput
                  label="Daily Food Budget"
                  suffix="₹"
                  name="dailyBudget"
                  type="number"
                  value={user.dailyBudget}
                  onChange={handleChange}
                  placeholder="e.g. 300"
                  min="0"
                  inputMode="numeric"
                />

              </div>

            </section>


            {/* ==================================
                CleanCRAVE INFO
            ================================== */}

            <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-4 sm:p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">

                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3l2.2 5.1L20 10l-5.8 1.9L12 17l-2.2-5.1L4 10l5.8-1.9L12 3z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 16l.8 1.8L22 19l-2.2.7L19 22l-.8-2.3L16 19l2.2-1.2L19 16z"
                    />

                  </svg>

                </div>


                <div className="min-w-0">

                  <h3 className="font-bold text-green-800">
                    Your profile powers CleanCRAVE
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    Your goal, activity level, body
                    measurements, food preference and
                    budget are used to calculate nutrition
                    targets and personalize food
                    recommendations.
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================
                MESSAGES
            ================================== */}

            {message && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100">

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

                </div>

                <p className="pt-1 font-semibold">
                  {message}
                </p>

              </div>
            )}


            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100">

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
                      d="M12 8v4m0 4h.01"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                  </svg>

                </div>

                <p className="pt-1 font-semibold">
                  {error}
                </p>

              </div>
            )}


            {/* ==================================
                SAVE BUTTON
            ================================== */}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setError("");
                }}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear Messages
              </button>


              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
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

                    Saving Changes...
                  </>
                ) : (
                  <>
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
                        d="M5 12l4 4L19 6"
                      />
                    </svg>

                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
};


// ==========================================
// SECTION HEADING
// ==========================================

const SectionHeading = ({
  icon,
  title,
  description,
}) => {

  return (
    <div className="flex items-start gap-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">

        {icon === "user" ? (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle
              cx="12"
              cy="8"
              r="3.5"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 20a7 7 0 0114 0"
            />

          </svg>
        ) : (
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
              d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"
            />

            <path
              strokeLinecap="round"
              d="M19 15l.8 2L22 18l-2.2 1L19 21l-.8-2L16 18l2.2-1 0.8-2z"
            />

          </svg>
        )}

      </div>


      <div className="min-w-0">

        <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
};


// ==========================================
// INPUT
// ==========================================

const ProfileInput = ({
  label,
  suffix,
  required = false,
  ...props
}) => {

  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>


      <div className="relative">

        <input
          {...props}
          value={props.value ?? ""}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 ${
            suffix
              ? "pr-14"
              : ""
          }`}
        />


        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-gray-400">
            {suffix}
          </span>
        )}

      </div>

    </div>
  );
};


// ==========================================
// SELECT
// ==========================================

const ProfileSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}) => {

  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>


      <div className="relative">

        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
        >

          <option value="">
            {placeholder}
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}

        </select>


        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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


export default Profile;