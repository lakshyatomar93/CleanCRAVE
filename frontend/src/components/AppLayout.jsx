import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Link, useLocation } from "react-router-dom";
import { getCart } from "../api/cartApi";

const AppLayout = ({ children }) => {
  const location = useLocation();

  const [cart, setCart] = useState(null);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data?.cart || null);
    } catch (error) {
      console.error("Unable to load cart:", error);
    }
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdated = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const cartItems = cart?.items || [];

  const cartItemCount = cartItems.reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0
  );

  const cartSubtotal = Number(cart?.summary?.subtotal || 0);

  const cartDelivery =
    cartItemCount > 0
      ? cartSubtotal >= 300
        ? 0
        : 30
      : 0;

  const cartTotal = cartSubtotal + cartDelivery;

  // ==========================================
  // HIDE FLOATING CART ON CART PAGE
  // ==========================================
  const isCartPage = location.pathname === "/cart";

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-gray-900">
      <Sidebar />

      <div className="min-h-screen lg:ml-64">
        <Topbar />

        <main className="w-full">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-20 sm:px-6 sm:pb-32 sm:pt-20 lg:px-8 lg:py-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>

      {/* ==========================================
          GLOBAL FLOATING CART BAR

          Shows everywhere except /cart
      ========================================== */}
      {!isCartPage && cartItemCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 sm:bottom-6">
          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white/95 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-md sm:gap-4 sm:p-3.5">

            {/* CART ICON */}
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-green-600 text-xl text-white shadow-sm">
              🛒
            </div>

            {/* CART INFO */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-green-600">
                {cartItemCount} item
                {cartItemCount !== 1 ? "s" : ""} added
              </p>

              <p className="mt-0.5 truncate text-sm font-extrabold text-slate-900">
                Your cart is ready
              </p>
            </div>

            {/* TOTAL */}
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total
              </p>

              <p className="text-base font-extrabold text-slate-900">
                ₹{Math.round(cartTotal)}
              </p>
            </div>

            {/* VIEW CART BUTTON */}
            <Link
              to="/cart"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md sm:px-5"
            >
              <span>View Cart</span>
              <span>→</span>
            </Link>

          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;