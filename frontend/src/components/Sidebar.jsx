import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Always close the mobile sidebar after navigation.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10.5 12 3l9 7.5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6"
          />
        </svg>
      ),
    },
    {
      name: "Discover",
      path: "/discover",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-5 h-5"
        >
          <circle cx="11" cy="11" r="7" />
          <path
            strokeLinecap="round"
            d="m20 20-4-4"
          />
          <path
            strokeLinecap="round"
            d="M8.5 11h5M11 8.5v5"
          />
        </svg>
      ),
    },
    {
      name: "Nutrition",
      path: "/nutrition",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v18M5 8c2.5-2 5-2 7 0 2-2 4.5-2 7 0M5 16c2.5-2 5-2 7 0 2-2 4.5-2 7 0"
          />
        </svg>
      ),
    },
    {
      name: "My Cart",
      path: "/cart",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20.5 8H6"
          />
          <circle cx="10" cy="19" r="1.2" />
          <circle cx="17" cy="19" r="1.2" />
        </svg>
      ),
    },
    {
      name: "Orders",
      path: "/orders",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z"
          />
          <path
            strokeLinecap="round"
            d="M8 8h8M8 12h8M8 16h5"
          />
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-5 h-5"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 21a7 7 0 0 1 14 0"
          />
        </svg>
      ),
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsMobileOpen(false);
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">

      {/* =========================
          LOGO
      ========================== */}

      <div className="flex h-20 shrink-0 items-center border-b border-gray-100 px-5 sm:px-6">
        <NavLink
          to="/dashboard"
          onClick={closeMobileSidebar}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-xl text-white shadow-sm shadow-green-100">
            🥗
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              CleanCRAVE
            </h1>

            <p className="text-[10px] font-medium tracking-wide text-gray-400">
              Eat smart. Live better.
            </p>
          </div>
        </NavLink>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}

      <div className="flex-1 overflow-y-auto px-3 py-7 sm:px-4">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
          Menu
        </p>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-green-600" />
                  )}

                  <span
                    className={`flex h-6 w-6 items-center justify-center transition-colors ${
                      isActive
                        ? "text-green-600"
                        : "text-gray-400 group-hover:text-gray-700"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Account */}

        <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
          Account
        </p>

        <button
          type="button"
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
        >
          <span className="flex h-6 w-6 items-center justify-center text-gray-400 transition-colors group-hover:text-red-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 17l5-5-5-5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12H3"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 5V3h7v18h-7v-2"
              />
            </svg>
          </span>

          Logout
        </button>
      </div>

      {/* =========================
          BOTTOM MOTIVATION CARD
      ========================== */}

      <div className="shrink-0 p-3 sm:p-4">
        <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
            <span className="text-lg">💚</span>
          </div>

          <p className="text-sm font-semibold text-gray-800">
            Stay consistent
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Small healthy choices every day make a big difference.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ==========================================
          DESKTOP SIDEBAR
      =========================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-gray-100 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* ==========================================
          MOBILE MENU BUTTON
      =========================================== */}

      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-[70] flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            d="M4 7h16M4 12h16M4 17h16"
          />
        </svg>
      </button>

      {/* ==========================================
          MOBILE OVERLAY
      =========================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-[75] bg-black/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ==========================================
          MOBILE SIDEBAR
      =========================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] w-[280px] max-w-[85vw] transform border-r border-gray-100 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}

        <button
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
          className="absolute right-4 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              d="M6 6l12 12M18 6 6 18"
            />
          </svg>
        </button>

        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;