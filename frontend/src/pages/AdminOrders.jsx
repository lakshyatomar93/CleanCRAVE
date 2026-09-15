import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminOrders,
  updateOrderStatus,
} from "../api/adminApi";


const statuses = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];


const nextStatus = {
  Placed: "Confirmed",
  Confirmed: "Preparing",
  Preparing: "Out for Delivery",
  "Out for Delivery": "Delivered",
};


// ==========================================
// ADMIN ORDERS
// ==========================================

const AdminOrders = () => {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(null);

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [searchTerm, setSearchTerm] =
    useState("");


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  const loadOrders = async () => {

    try {

      setLoading(true);

      const data =
        await getAdminOrders();

      console.log(
        "Admin orders:",
        data
      );

      setOrders(
        data.orders || data || []
      );

    } catch (error) {

      console.error(
        "Error loading admin orders:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to load orders"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadOrders();
  }, []);


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {

    try {

      setUpdating(orderId);

      const data =
        await updateOrderStatus(
          orderId,
          newStatus
        );

      console.log(
        "Updated order:",
        data
      );


      setOrders(
        (prevOrders) =>
          prevOrders.map(
            (order) =>
              order._id === orderId
                ? {
                    ...order,
                    orderStatus:
                      newStatus,
                  }
                : order
          )
      );

    } catch (error) {

      console.error(
        "Error updating order:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to update order status"
      );

    } finally {

      setUpdating(null);

    }

  };


  // ==========================================
  // FILTER ORDERS
  // ==========================================

  const filteredOrders =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return orders.filter(
        (order) => {

          const matchesStatus =
            statusFilter === "All" ||
            order.orderStatus ===
              statusFilter;


          if (!search) {
            return matchesStatus;
          }


          const orderId =
            order._id
              ?.toLowerCase() || "";


          const customerName =
            order.user?.name
              ?.toLowerCase() || "";


          const customerEmail =
            order.user?.email
              ?.toLowerCase() || "";


          const deliveryName =
            order.deliveryAddress?.name
              ?.toLowerCase() || "";


          const phone =
            String(
              order.deliveryAddress?.phone ||
              ""
            ).toLowerCase();


          const matchesSearch =
            orderId.includes(search) ||
            customerName.includes(search) ||
            customerEmail.includes(search) ||
            deliveryName.includes(search) ||
            phone.includes(search);


          return (
            matchesStatus &&
            matchesSearch
          );

        }
      );

    }, [
      orders,
      statusFilter,
      searchTerm,
    ]);


  // ==========================================
  // STATISTICS
  // ==========================================

  const totalOrders =
    orders.length;


  const activeOrders =
    orders.filter(
      (order) =>
        ![
          "Delivered",
          "Cancelled",
        ].includes(
          order.orderStatus
        )
    ).length;


  const preparingOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Preparing"
    ).length;


  const deliveredOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Delivered"
    ).length;


  const cancelledOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Cancelled"
    ).length;


  const totalRevenue =
    orders
      .filter(
        (order) =>
          order.orderStatus !==
          "Cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total || 0
          ),
        0
      );


  // ==========================================
  // STATUS OPTIONS
  // ==========================================

  const getStatusOptions = (
    currentStatus
  ) => {

    if (
      currentStatus ===
        "Delivered" ||
      currentStatus ===
        "Cancelled"
    ) {
      return [currentStatus];
    }


    const options = [
      currentStatus,
    ];


    const next =
      nextStatus[currentStatus];


    if (next) {
      options.push(next);
    }


    if (
      currentStatus !==
      "Cancelled"
    ) {
      options.push(
        "Cancelled"
      );
    }


    return options;

  };


  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {

    setSearchTerm("");
    setStatusFilter("All");

  };


  const hasFilters =
    Boolean(
      searchTerm ||
      statusFilter !== "All"
    );


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <AdminOrdersLoading />
    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-[#f7f8f5] text-gray-900">


      {/* ======================================
          HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">

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
                  d="M4 7h16M6 11h12M8 15h8M10 19h4"
                />
              </svg>

            </div>


            <div className="min-w-0">

              <h1 className="truncate text-base font-extrabold sm:text-lg">
                Order Management
              </h1>

              <p className="hidden text-xs text-gray-400 sm:block">
                CleanCRAVE Admin
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:border-green-300 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
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
                d="M20 11a8 8 0 00-14.7-4.7L4 8"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 13a8 8 0 0014.7 4.7L20 16"
              />
            </svg>

            <span className="hidden sm:inline">
              Refresh Orders
            </span>

            <span className="sm:hidden">
              Refresh
            </span>

          </button>

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">


        {/* ====================================
            PAGE TITLE
        ==================================== */}

        <div className="mb-7">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Administration
          </p>


          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Manage Orders
          </h1>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            View customer orders, monitor delivery progress and update order status.
          </p>

        </div>


        {/* ====================================
            STATISTICS
        ==================================== */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">

          <OrderStat
            label="Total Orders"
            value={totalOrders}
            type="total"
          />

          <OrderStat
            label="Active"
            value={activeOrders}
            type="active"
          />

          <OrderStat
            label="Preparing"
            value={preparingOrders}
            type="preparing"
          />

          <OrderStat
            label="Delivered"
            value={deliveredOrders}
            type="delivered"
          />

          <OrderStat
            label="Cancelled"
            value={cancelledOrders}
            type="cancelled"
          />

          <OrderStat
            label="Revenue"
            value={`₹${totalRevenue.toFixed(0)}`}
            type="revenue"
          />

        </div>


        {/* ====================================
            FILTERS
        ==================================== */}

        <section className="mt-7 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600">

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
                  d="M4 6h16M7 12h10M10 18h4"
                />
              </svg>

            </div>


            <div>

              <h2 className="text-sm font-extrabold">
                Find Orders
              </h2>

              <p className="text-xs text-gray-400">
                Search by customer or order details.
              </p>

            </div>

          </div>


          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">

            {/* SEARCH */}

            <div>

              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Search Orders
              </label>


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
                  placeholder="Customer, email, phone or order ID..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
                />

              </div>

            </div>


            {/* STATUS */}

            <div>

              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Order Status
              </label>


              <div className="relative">

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
                >

                  <option value="All">
                    All Orders
                  </option>

                  {statuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

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

          </div>


          {/* SUMMARY */}

          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-gray-500 sm:text-sm">

              Showing{" "}

              <span className="font-bold text-gray-900">
                {filteredOrders.length}
              </span>

              {" "}of{" "}

              <span className="font-bold text-gray-900">
                {orders.length}
              </span>

              {" "}orders

            </p>


            {hasFilters && (

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="self-start text-xs font-bold text-green-600 hover:text-green-700 sm:self-auto sm:text-sm"
              >
                Clear Filters
              </button>

            )}

          </div>

        </section>


        {/* ====================================
            ORDERS
        ==================================== */}

        <div className="mt-7">

          {orders.length === 0 ? (

            <EmptyOrders
              type="empty"
            />

          ) : filteredOrders.length === 0 ? (

            <EmptyOrders
              type="search"
              onClear={
                clearFilters
              }
            />

          ) : (

            <div className="space-y-5">

              {filteredOrders.map(
                (order) => {

                  const currentStatus =
                    order.orderStatus ||
                    "Placed";


                  const statusOptions =
                    getStatusOptions(
                      currentStatus
                    );


                  const isFinalStatus =
                    currentStatus ===
                      "Delivered" ||
                    currentStatus ===
                      "Cancelled";


                  return (

                    <OrderCard
                      key={order._id}
                      order={order}
                      currentStatus={
                        currentStatus
                      }
                      statusOptions={
                        statusOptions
                      }
                      isFinalStatus={
                        isFinalStatus
                      }
                      updating={
                        updating ===
                        order._id
                      }
                      onStatusChange={
                        handleStatusChange
                      }
                    />

                  );

                }
              )}

            </div>

          )}

        </div>

      </main>

    </div>

  );
};


// ==========================================
// ORDER CARD
// ==========================================

const OrderCard = ({
  order,
  currentStatus,
  statusOptions,
  isFinalStatus,
  updating,
  onStatusChange,
}) => {

  return (

    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">


      {/* ====================================
          ORDER HEADER
      ==================================== */}

      <div className="border-b border-gray-100 p-5 sm:p-6">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          {/* CUSTOMER */}

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-xs font-extrabold text-green-700">
                  {getInitials(
                    order.user?.name
                  )}
                </div>


                <h2 className="text-sm font-extrabold text-gray-900 sm:text-base">
                  {order.user?.name ||
                    "Unknown Customer"}
                </h2>

              </div>


              <StatusBadge
                status={
                  currentStatus
                }
              />

            </div>


            <div className="mt-2 flex flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:gap-3">

              <span>
                Order #
                {order._id
                  ?.slice(-6)
                  .toUpperCase()}
              </span>

              <span className="hidden sm:block">
                •
              </span>

              <span className="truncate">
                {order.user?.email ||
                  "No email"}
              </span>

            </div>

          </div>


          {/* PRICE */}

          <div className="flex items-end justify-between gap-4 xl:block xl:text-right">

            <div>

              <p className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                ₹
                {Number(
                  order.total || 0
                ).toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {order.paymentMethod ||
                  "Payment not specified"}
              </p>

            </div>


            {order.createdAt && (
              <p className="text-right text-[11px] text-gray-400 xl:mt-2">
                {new Date(
                  order.createdAt
                ).toLocaleString()}
              </p>
            )}

          </div>

        </div>

      </div>


      {/* ====================================
          ORDER BODY
      ==================================== */}

      <div className="p-5 sm:p-6">

        <div className="grid gap-5 xl:grid-cols-2">


          {/* =================================
              ITEMS
          ================================= */}

          <div>

            <SectionTitle
              icon="items"
              title="Ordered Items"
            />


            <div className="mt-3 space-y-2">

              {order.items?.map(
                (item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <FoodThumb
                        src={item.image}
                        alt={item.name}
                      />


                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-gray-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ₹
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                          {" "}×{" "}
                          {item.quantity}
                        </p>

                      </div>

                    </div>


                    <p className="shrink-0 text-sm font-extrabold text-gray-800">
                      ₹
                      {(
                        Number(
                          item.price || 0
                        ) *
                        Number(
                          item.quantity || 0
                        )
                      ).toFixed(2)}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>


          {/* =================================
              DELIVERY
          ================================= */}

          <div>

            <SectionTitle
              icon="location"
              title="Delivery Details"
            />


            <div className="mt-3 rounded-2xl bg-gray-50 p-4">

              <DeliveryRow
                label="Name"
                value={
                  order.deliveryAddress
                    ?.name
                }
              />

              <DeliveryRow
                label="Phone"
                value={
                  order.deliveryAddress
                    ?.phone
                }
              />

              <DeliveryRow
                label="Address"
                value={
                  order.deliveryAddress
                    ?.address
                }
              />

              <DeliveryRow
                label="City"
                value={
                  order.deliveryAddress
                    ?.city
                }
              />

              <DeliveryRow
                label="State"
                value={
                  order.deliveryAddress
                    ?.state
                }
              />

              <DeliveryRow
                label="Pincode"
                value={
                  order.deliveryAddress
                    ?.pincode
                }

                last
              />

            </div>

          </div>

        </div>


        {/* ====================================
            PRICE SUMMARY
        ==================================== */}

        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">

          <PriceItem
            label="Subtotal"
            value={
              order.subtotal
            }
          />

          <PriceItem
            label="Delivery"
            value={
              order.deliveryFee
            }
          />

          <PriceItem
            label="Total"
            value={
              order.total
            }
            total
          />

        </div>


        {/* ====================================
            STATUS UPDATE
        ==================================== */}

        <div className="mt-6 border-t border-gray-100 pt-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="h-2 w-2 rounded-full bg-green-500" />

                <p className="text-sm font-extrabold text-gray-800">
                  Order Status
                </p>

              </div>


              <p className="mt-1 text-xs leading-5 text-gray-400">

                {isFinalStatus
                  ? currentStatus ===
                    "Delivered"
                    ? "This order has been delivered and is locked."
                    : "This order has been cancelled and is locked."
                  : nextStatus[
                      currentStatus
                    ]
                  ? `Next step: ${
                      nextStatus[
                        currentStatus
                      ]
                    }`
                  : "Update the customer's order progress."}

              </p>

            </div>


            <div className="w-full lg:w-auto">

              <div className="relative">

                <select
                  value={
                    currentStatus
                  }
                  disabled={
                    updating ||
                    isFinalStatus
                  }
                  onChange={(e) =>
                    onStatusChange(
                      order._id,
                      e.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 lg:min-w-[240px]"
                >

                  {statusOptions.map(
                    (status) => (

                      <option
                        key={status}
                        value={status}
                      >

                        {status ===
                        currentStatus
                          ? `Current: ${status}`
                          : status ===
                            "Cancelled"
                          ? "Cancel Order"
                          : `Move to ${status}`}

                      </option>

                    )
                  )}

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

          </div>


          {updating && (

            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-green-600">

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

              Updating order status...

            </div>

          )}

        </div>

      </div>

    </article>

  );
};


// ==========================================
// STAT CARD
// ==========================================

const OrderStat = ({
  label,
  value,
  type,
}) => {

  const styles = {
    total: {
      bg: "bg-gray-100",
      text: "text-gray-700",
    },

    active: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    preparing: {
      bg: "bg-orange-50",
      text: "text-orange-600",
    },

    delivered: {
      bg: "bg-green-50",
      text: "text-green-600",
    },

    cancelled: {
      bg: "bg-red-50",
      text: "text-red-600",
    },

    revenue: {
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  };


  const style =
    styles[type] ||
    styles.total;


  return (

    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
      >

        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >

          {type === "revenue" ? (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"
              />
            </>
          ) : type === "delivered" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12l4 4L19 6"
            />
          ) : type === "cancelled" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 7l10 10M17 7L7 17"
            />
          ) : (
            <>
              <rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
              />

              <path
                strokeLinecap="round"
                d="M8 9h8M8 13h5"
              />
            </>
          )}

        </svg>

      </div>


      <p className="mt-3 text-xs font-medium text-gray-500">
        {label}
      </p>


      <p className="mt-1 truncate text-xl font-extrabold text-gray-900 sm:text-2xl">
        {value}
      </p>

    </div>

  );
};


// ==========================================
// STATUS BADGE
// ==========================================

const StatusBadge = ({
  status,
}) => {

  const config = {
    Placed: {
      className:
        "bg-yellow-50 text-yellow-700",
      dot:
        "bg-yellow-500",
    },

    Confirmed: {
      className:
        "bg-blue-50 text-blue-700",
      dot:
        "bg-blue-500",
    },

    Preparing: {
      className:
        "bg-orange-50 text-orange-700",
      dot:
        "bg-orange-500",
    },

    "Out for Delivery": {
      className:
        "bg-purple-50 text-purple-700",
      dot:
        "bg-purple-500",
    },

    Delivered: {
      className:
        "bg-green-50 text-green-700",
      dot:
        "bg-green-500",
    },

    Cancelled: {
      className:
        "bg-red-50 text-red-600",
      dot:
        "bg-red-500",
    },
  };


  const style =
    config[status] ||
    config.Placed;


  return (

    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.className}`}
    >

      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {status}

    </span>

  );
};


// ==========================================
// SECTION TITLE
// ==========================================

const SectionTitle = ({
  icon,
  title,
}) => {

  return (

    <div className="flex items-center gap-2">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">

        {icon === "items" ? (
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
              d="M5 6h14M5 12h14M5 18h8"
            />
          </svg>
        ) : (
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
              d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"
            />

            <circle
              cx="12"
              cy="10"
              r="2"
            />
          </svg>
        )}

      </div>


      <h3 className="text-sm font-extrabold text-gray-900">
        {title}
      </h3>

    </div>

  );
};


// ==========================================
// DELIVERY ROW
// ==========================================

const DeliveryRow = ({
  label,
  value,
  last = false,
}) => {

  return (

    <div
      className={`flex flex-col gap-1 py-2 sm:flex-row sm:items-start ${
        !last
          ? "border-b border-gray-200/70"
          : ""
      }`}
    >

      <span className="w-20 shrink-0 text-[11px] font-bold text-gray-400">
        {label}
      </span>


      <span className="break-words text-xs font-medium text-gray-700">
        {value || "—"}
      </span>

    </div>

  );
};


// ==========================================
// PRICE ITEM
// ==========================================

const PriceItem = ({
  label,
  value,
  total = false,
}) => {

  return (

    <div>

      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>


      <p
        className={`mt-1 ${
          total
            ? "text-lg font-extrabold text-gray-900"
            : "text-sm font-bold text-gray-700"
        }`}
      >
        ₹
        {Number(
          value || 0
        ).toFixed(2)}
      </p>

    </div>

  );
};


// ==========================================
// FOOD THUMB
// ==========================================

const FoodThumb = ({
  src,
  alt,
}) => {

  const [
    imageError,
    setImageError,
  ] = useState(false);


  if (!src || imageError) {

    return (

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">

        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4-5 3 3 3-4 6 7"
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
      className="h-12 w-12 shrink-0 rounded-xl object-cover"
    />

  );
};


// ==========================================
// EMPTY ORDERS
// ==========================================

const EmptyOrders = ({
  type,
  onClear,
}) => {

  const empty =
    type === "empty";


  return (

    <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

        {empty ? (
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 7h16v12H4z"
            />

            <path
              strokeLinecap="round"
              d="M8 7V5h8v2"
            />
          </svg>
        ) : (
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
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
        )}

      </div>


      <h3 className="mt-5 text-lg font-extrabold text-gray-900">

        {empty
          ? "No orders found"
          : "No matching orders"}

      </h3>


      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">

        {empty
          ? "Customer orders will appear here when users place orders."
          : "Try changing your search or status filter."}

      </p>


      {!empty && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
        >
          Clear Filters
        </button>
      )}

    </div>

  );
};


// ==========================================
// LOADING STATE
// ==========================================

const AdminOrdersLoading = () => {

  return (

    <div className="min-h-screen bg-[#f7f8f5]">

      <header className="border-b border-gray-100 bg-white">

        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">

          <div className="h-10 w-44 animate-pulse rounded-xl bg-gray-100" />

        </div>

      </header>


      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-3 w-24 rounded bg-gray-200" />

          <div className="mt-3 h-9 w-64 rounded bg-gray-200" />

          <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-200" />


          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

            {Array.from({
              length: 6,
            }).map((_, index) => (

              <div
                key={index}
                className="h-32 rounded-2xl bg-white"
              />

            ))}

          </div>


          <div className="mt-7 h-36 rounded-3xl bg-white" />


          <div className="mt-7 space-y-5">

            {Array.from({
              length: 3,
            }).map((_, index) => (

              <div
                key={index}
                className="h-96 rounded-3xl bg-white"
              />

            ))}

          </div>

        </div>

      </main>

    </div>

  );
};


// ==========================================
// INITIALS
// ==========================================

const getInitials = (
  name
) => {

  if (!name) {
    return "U";
  }


  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
          ?.toUpperCase()
    )
    .join("") || "U";

};


export default AdminOrders;