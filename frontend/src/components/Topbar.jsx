import React from "react";
import { Link, useLocation } from "react-router-dom";

const Topbar = () => {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/dashboard") {
      return {
        title: "Dashboard",
        subtitle: "Your daily health overview",
      };
    }

    if (path === "/discover") {
      return {
        title: "Discover",
        subtitle: "Find food that fits your goals",
      };
    }

    if (path === "/cart") {
      return {
        title: "My Cart",
        subtitle: "Review your selected meals",
      };
    }

    if (path === "/orders") {
      return {
        title: "My Orders",
        subtitle: "Track and manage your orders",
      };
    }

    if (path.startsWith("/orders/")) {
      return {
        title: "Order Details",
        subtitle: "Track your food delivery",
      };
    }

    if (path === "/profile") {
      return {
        title: "Profile",
        subtitle: "Manage your personal information",
      };
    }

    if (path.startsWith("/foods/")) {
      return {
        title: "Food Details",
        subtitle: "Nutrition and meal information",
      };
    }

    if (path === "/checkout") {
      return {
        title: "Checkout",
        subtitle: "Complete your order",
      };
    }

    return {
      title: "CleanCRAVE",
      subtitle: "Eat smart. Live better.",
    };
  };

  const pageInfo = getPageInfo();

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }

    return "U";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">

      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* =====================================
            LEFT SECTION
        ====================================== */}

        <div className="flex min-w-0 items-center gap-4">

          {/* Mobile Logo / Menu area */}

          <div className="flex items-center lg:hidden">

            <Link
              to="/dashboard"
              className="ml-12 flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-lg text-white shadow-sm">
                🥗
              </div>

              <span className="hidden font-bold tracking-tight text-gray-900 sm:block">
                CleanCRAVE
              </span>
            </Link>

          </div>

          {/* Page Title */}

          <div className="hidden min-w-0 sm:block lg:block">

            <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 lg:text-xl">
              {pageInfo.title}
            </h1>

            <p className="mt-0.5 truncate text-xs text-gray-400">
              {pageInfo.subtitle}
            </p>

          </div>

        </div>

        {/* =====================================
            RIGHT SECTION
        ====================================== */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Search / Discover */}

          <Link
            to="/discover"
            aria-label="Discover food"
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-green-200 hover:bg-green-50 hover:text-green-600 sm:h-11 sm:w-11"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path
                strokeLinecap="round"
                d="m16 16 4.5 4.5"
              />
            </svg>
          </Link>

          {/* Cart */}

          <Link
            to="/cart"
            aria-label="Open cart"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-green-200 hover:bg-green-50 hover:text-green-600 sm:h-11 sm:w-11"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20.5 8H6"
              />

              <circle cx="10" cy="19" r="1.2" />
              <circle cx="17" cy="19" r="1.2" />
            </svg>
          </Link>

          {/* Divider */}

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {/* User Profile */}

          <Link
            to="/profile"
            className="group flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-gray-50 sm:gap-3 sm:pr-2"
          >

            {/* Avatar */}

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white shadow-sm sm:h-10 sm:w-10">
              {getInitials()}
            </div>

            {/* User information */}

            <div className="hidden text-left sm:block">

              <p className="max-w-[120px] truncate text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </p>

              <p className="text-[11px] text-gray-400">
                View profile
              </p>

            </div>

            {/* Arrow */}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="hidden h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 18 6-6-6-6"
              />
            </svg>

          </Link>

        </div>

      </div>

      {/* =====================================
          MOBILE PAGE TITLE
      ====================================== */}

      <div className="border-t border-gray-50 px-4 py-3 sm:hidden">

        <h1 className="text-base font-bold tracking-tight text-gray-900">
          {pageInfo.title}
        </h1>

        <p className="mt-0.5 text-[11px] text-gray-400">
          {pageInfo.subtitle}
        </p>

      </div>

    </header>
  );
};

export default Topbar;