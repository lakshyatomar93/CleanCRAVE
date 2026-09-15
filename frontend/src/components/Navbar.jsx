import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-5">

        <div className="h-16 flex items-center justify-between">

          {/* Logo */}

          <Link
            to="/dashboard"
            className="flex items-center gap-2"
          >

            <div className="w-9 h-9 bg-green-600 text-white rounded-xl flex items-center justify-center">
              🍃
            </div>

            <span className="text-xl font-bold text-green-700">
              CleanCRAVE
            </span>

          </Link>


          {/* Navigation */}

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">

            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-green-600"
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="text-gray-600 hover:text-green-600"
            >
              Profile
            </Link>

            <Link
              to="/orders"
              className="text-gray-600 hover:text-green-600"
            >
              Orders
            </Link>

            <Link
              to="/cart"
              className="text-gray-600 hover:text-green-600"
            >
              🛒 Cart
            </Link>

          </div>


          {/* User */}

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">

              <p className="text-sm font-semibold">
                {user.name || "User"}
              </p>

              <p className="text-xs text-gray-500">
                {user.goal || "Healthy"}
              </p>

            </div>

            <button
              onClick={logout}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;