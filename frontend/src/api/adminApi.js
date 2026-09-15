import api from "./api";

// ==========================================
// ADMIN ORDERS
// ==========================================

export const getAdminOrders = async () => {
  const response = await api.get("/admin/orders");

  return response.data;
};

export const updateOrderStatus = async (
  id,
  orderStatus
) => {
  const response = await api.patch(
    `/admin/orders/${id}/status`,
    {
      orderStatus,
    }
  );

  return response.data;
};

// ==========================================
// ADMIN FOODS
// ==========================================

export const getAdminFoods = async () => {
  const response = await api.get("/admin/foods");

  return response.data;
};

export const createFood = async (foodData) => {
  const response = await api.post(
    "/admin/foods",
    foodData
  );

  return response.data;
};

export const updateFood = async (
  id,
  foodData
) => {
  const response = await api.put(
    `/admin/foods/${id}`,
    foodData
  );

  return response.data;
};

export const deleteFood = async (id) => {
  const response = await api.delete(
    `/admin/foods/${id}`
  );

  return response.data;
};

export const toggleFoodAvailability = async (
  id,
  isAvailable
) => {
  const response = await api.patch(
    `/admin/foods/${id}/availability`,
    {
      isAvailable,
    }
  );

  return response.data;
};