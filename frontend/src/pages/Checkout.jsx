import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";

import {
  getCart,
} from "../api/cartApi";

import {
  createOrder,
} from "../api/orderApi";


const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "Cash on Delivery",
  });


  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCart();
        setCart(data.cart);
      } catch (error) {
        console.error(error);
        setError(
          error.response?.data?.message ||
          "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async (e) => {
    e.preventDefault();

    setError("");

    // Prevent accidental double click
    if (placing) {
      return;
    }

    setPlacing(true);

    try {
      const data = await createOrder({
        paymentMethod: form.paymentMethod,

        deliveryAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine: form.addressLine.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });

      navigate(
        `/orders/${data.order._id}`
      );

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to place order. Please try again."
      );

    } finally {
      setPlacing(false);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse">

          <div className="h-3 w-20 rounded bg-gray-200" />

          <div className="mt-3 h-9 w-64 rounded-lg bg-gray-200" />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">

            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-7">

              <div className="h-6 w-40 rounded bg-gray-200" />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className={
                      index === 2
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <div className="mb-2 h-4 w-20 rounded bg-gray-200" />
                    <div className="h-12 rounded-xl bg-gray-100" />
                  </div>
                ))}

              </div>

            </div>

            <div className="h-80 rounded-3xl border border-gray-100 bg-white p-6" />

          </div>

        </div>
      </AppLayout>
    );
  }


  const summary =
    cart?.summary || {};

  const subtotal =
    Number(summary.subtotal) || 0;

  const deliveryFee =
    subtotal >= 300
      ? 0
      : 30;

  const total =
    subtotal + deliveryFee;

  const itemCount =
    Number(summary.itemCount) || 0;

  const isEmpty =
    !cart?.items ||
    cart.items.length === 0;


  // ==========================================
  // EMPTY CART
  // ==========================================

  if (isEmpty) {
    return (
      <AppLayout>
        <div className="flex min-h-[65vh] items-center justify-center">

          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm sm:px-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">

              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h13m-9 4a1 1 0 11-2 0m8 0a1 1 0 11-2 0"
                />
              </svg>

            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add some healthy food to your cart before
              continuing to checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate("/discover")}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Explore Foods
            </button>

          </div>

        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>

      <div className="mx-auto w-full max-w-6xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-6 sm:mb-8">

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Checkout
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Complete your order
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Enter your delivery details and choose how you'd like to pay.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 sm:self-auto">
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

              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </div>

          </div>

        </div>


        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">

            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M10.3 3.8L2.9 17a2 2 0 001.7 3h14.8a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z"
              />
            </svg>

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

          </div>
        )}


        {/* ======================================
            MAIN GRID
        ====================================== */}

        <form
          onSubmit={placeOrder}
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
        >

          {/* ====================================
              LEFT SIDE
          ==================================== */}

          <div className="space-y-6">

            {/* DELIVERY DETAILS */}

            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">

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
                      d="M12 21s7-4.4 7-10a7 7 0 10-14 0c0 5.6 7 10 7 10z"
                    />

                    <circle
                      cx="12"
                      cy="11"
                      r="2.2"
                    />
                  </svg>

                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Delivery Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>

              </div>


              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <Input
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  inputMode="numeric"
                  required
                />

                <div className="sm:col-span-2">

                  <Input
                    label="Address"
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    placeholder="House no., street, landmark..."
                    autoComplete="street-address"
                    required
                  />

                </div>

                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  autoComplete="address-level2"
                  required
                />

                <Input
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  autoComplete="address-level1"
                  required
                />

                <Input
                  label="Pincode"
                  name="pincode"
                  type="text"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />

              </div>

            </section>


            {/* PAYMENT METHOD */}

            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />

                    <path d="M3 10h18" />

                    <path d="M7 15h4" />

                  </svg>

                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Payment Method
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose your preferred payment option.
                  </p>
                </div>

              </div>


              <div className="mt-6 space-y-3">

                {/* COD */}

                <label
                  className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                    form.paymentMethod ===
                    "Cash on Delivery"
                      ? "border-green-300 bg-green-50/70 ring-1 ring-green-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={
                      form.paymentMethod ===
                      "Cash on Delivery"
                    }
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-green-600"
                  />

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-bold text-gray-900">
                        Cash on Delivery
                      </p>

                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                        Available
                      </span>

                    </div>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Pay when your food arrives at your doorstep.
                    </p>

                  </div>

                  <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm sm:flex">

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
                        d="M6 8h12M6 12h8m-8 4h12"
                      />

                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                    </svg>

                  </div>

                </label>


                {/* ONLINE */}

                <label
                  className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                    form.paymentMethod ===
                    "Online"
                      ? "border-blue-300 bg-blue-50/60 ring-1 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={
                      form.paymentMethod ===
                      "Online"
                    }
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-bold text-gray-900">
                        Online Payment
                      </p>

                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Coming Soon
                      </span>

                    </div>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Online payment gateway integration will be added later.
                    </p>

                  </div>

                  <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:flex">

                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="M3 10h18" />

                    </svg>

                  </div>

                </label>

              </div>

            </section>

          </div>


          {/* ====================================
              RIGHT SIDE — ORDER SUMMARY
          ==================================== */}

          <aside className="h-fit xl:sticky xl:top-24">

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

              {/* HEADER */}

              <div className="bg-gradient-to-br from-green-50 to-white px-5 py-5 sm:px-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                      Summary
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                      Order Summary
                    </h2>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">

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
                        d="M6 3h12l1 5H5l1-5z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 8h14l-1 12H6L5 8z"
                      />

                      <path d="M9 12h6" />

                    </svg>

                  </div>

                </div>

              </div>


              {/* SUMMARY CONTENT */}

              <div className="p-5 sm:p-6">

                <div className="space-y-4">

                  <SummaryRow
                    label={`Items (${itemCount})`}
                    value={`₹${subtotal}`}
                  />

                  <SummaryRow
                    label="Delivery"
                    value={
                      deliveryFee === 0
                        ? "FREE"
                        : `₹${deliveryFee}`
                    }
                    valueClass={
                      deliveryFee === 0
                        ? "text-green-600"
                        : ""
                    }
                  />

                </div>


                {/* FREE DELIVERY MESSAGE */}

                {subtotal < 300 && (
                  <div className="mt-5 rounded-2xl bg-green-50 p-4">

                    <div className="flex gap-3">

                      <div className="mt-0.5 text-green-600">

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
                            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                          />
                        </svg>

                      </div>

                      <p className="text-xs leading-5 text-green-700">
                        Add{" "}
                        <span className="font-bold">
                          ₹{300 - subtotal}
                        </span>{" "}
                        more to get free delivery.
                      </p>

                    </div>

                  </div>
                )}


                {/* TOTAL */}

                <div className="mt-6 border-t border-gray-100 pt-5">

                  <div className="flex items-end justify-between gap-4">

                    <div>
                      <p className="text-sm text-gray-500">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Including delivery
                      </p>
                    </div>

                    <p className="text-3xl font-extrabold tracking-tight text-green-600">
                      ₹{total}
                    </p>

                  </div>

                </div>


                {/* PLACE ORDER */}

                <button
                  type="submit"
                  disabled={placing}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {placing ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
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

                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order

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
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>
                    </>
                  )}

                </button>


                {/* SECURITY NOTE */}

                <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-gray-400">

                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />

                    <path
                      strokeLinecap="round"
                      d="M8 10V7a4 4 0 018 0v3"
                    />

                  </svg>

                  Your order details are securely handled.

                </div>

              </div>

            </div>

          </aside>

        </form>

      </div>

    </AppLayout>
  );
};


// ==========================================
// INPUT COMPONENT
// ==========================================

const Input = ({
  label,
  ...props
}) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
      />

    </div>
  );
};


// ==========================================
// SUMMARY ROW
// ==========================================

const SummaryRow = ({
  label,
  value,
  valueClass = "",
}) => {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">

      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={`font-semibold text-gray-900 ${valueClass}`}
      >
        {value}
      </span>

    </div>
  );
};


export default Checkout;