const Order = require("../models/Order");

const {
  addNutrition,
} = require("../services/nutritionLogService");


// ==========================================
// GET ALL ORDERS
// ==========================================

const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate(
        "user",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {

    console.error(
      "========== GET ALL ORDERS ERROR =========="
    );

    console.error(error);

    console.error(
      "==========================================="
    );

    res.status(500).json({
      message: "Failed to load orders",
    });

  }
};


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

const updateOrderStatus = async (
  req,
  res
) => {

  try {

    const {
      orderStatus,
    } = req.body;


    // ==========================================
    // VALID STATUSES
    // ==========================================

    const validStatuses = [
      "Placed",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];


    if (
      !validStatuses.includes(orderStatus)
    ) {

      return res.status(400).json({
        message: "Invalid order status",
      });

    }


    // ==========================================
    // FIND ORDER
    // ==========================================

    const order =
      await Order.findById(
        req.params.id
      );


    if (!order) {

      return res.status(404).json({
        message: "Order not found",
      });

    }


    const oldStatus =
      order.orderStatus;


    // ==========================================
    // SAME STATUS
    // ==========================================

    if (
      oldStatus === orderStatus
    ) {

      return res.status(400).json({
        message:
          `Order is already ${orderStatus}`,
      });

    }


    // ==========================================
    // CANCELLED ORDERS ARE LOCKED
    // ==========================================

    if (
      oldStatus === "Cancelled"
    ) {

      return res.status(400).json({
        message:
          "Cancelled orders cannot be updated",
      });

    }


    // ==========================================
    // DELIVERED ORDERS ARE LOCKED
    // ==========================================

    if (
      oldStatus === "Delivered"
    ) {

      return res.status(400).json({
        message:
          "Delivered orders cannot be changed",
      });

    }


    // ==========================================
    // ORDER STATUS PROGRESSION
    // ==========================================

    const nextStatus = {

      "Placed":
        "Confirmed",

      "Confirmed":
        "Preparing",

      "Preparing":
        "Out for Delivery",

      "Out for Delivery":
        "Delivered",

    };


    // ==========================================
    // ALLOW CANCELLATION
    // ==========================================

    if (
      orderStatus === "Cancelled"
    ) {

      order.orderStatus =
        "Cancelled";


      await order.save();


      return res.json({

        success: true,

        message:
          "Order cancelled successfully",

        order,

      });

    }


    // ==========================================
    // CHECK NORMAL STATUS PROGRESSION
    // ==========================================

    if (
      nextStatus[oldStatus] !==
      orderStatus
    ) {

      return res.status(400).json({

        message:
          `Invalid status transition. Order is currently "${oldStatus}". The next status must be "${nextStatus[oldStatus]}".`,

      });

    }


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    order.orderStatus =
      orderStatus;


    // ==========================================
    // NUTRITION LOGGING
    // ONLY WHEN DELIVERED
    // ==========================================

    if (
      orderStatus === "Delivered" &&
      oldStatus !== "Delivered" &&
      !order.nutritionLogged
    ) {

      const nutritionTotal = {

        calories: 0,

        protein: 0,

        carbohydrates: 0,

        fat: 0,

        fiber: 0,

      };


      // ========================================
      // CALCULATE ORDER NUTRITION
      // ========================================

      for (
        const item of order.items
      ) {

        const quantity =
          item.quantity || 1;


        nutritionTotal.calories +=
          (
            item.nutrition?.calories ||
            0
          ) * quantity;


        nutritionTotal.protein +=
          (
            item.nutrition?.protein ||
            0
          ) * quantity;


        nutritionTotal.carbohydrates +=
          (
            item.nutrition?.carbohydrates ||
            0
          ) * quantity;


        nutritionTotal.fat +=
          (
            item.nutrition?.fat ||
            0
          ) * quantity;


        nutritionTotal.fiber +=
          (
            item.nutrition?.fiber ||
            0
          ) * quantity;

      }


      // ========================================
      // NUTRITION DEBUG
      // ========================================

      console.log(
        "========== NUTRITION DEBUG =========="
      );

      console.log(
        "Order ID:",
        order._id
      );

      console.log(
        "User ID:",
        order.user
      );

      console.log(
        "Old Status:",
        oldStatus
      );

      console.log(
        "New Status:",
        orderStatus
      );

      console.log(
        "Nutrition Total:",
        nutritionTotal
      );

      console.log(
        "Food Spending:",
        order.subtotal
      );

      console.log(
        "Nutrition Logged:",
        order.nutritionLogged
      );

      console.log(
        "====================================="
      );


      // ========================================
      // ADD NUTRITION + FOOD SPENDING
      // ========================================

      const updatedNutritionLog =
        await addNutrition(
          order.user,
          nutritionTotal,
          order.subtotal || 0
        );


      console.log(
        "UPDATED NUTRITION LOG:",
        updatedNutritionLog
      );


      // ========================================
      // PREVENT DUPLICATE LOGGING
      // ========================================

      order.nutritionLogged =
        true;


      console.log(
        "Nutrition logged for delivered order:",
        order._id
      );

      console.log(
        "Nutrition:",
        nutritionTotal
      );

      console.log(
        "Food spending:",
        order.subtotal
      );

    }


    // ==========================================
    // SAVE ORDER
    // ==========================================

    await order.save();


    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({

      success: true,

      message:
        `Order status changed from "${oldStatus}" to "${orderStatus}"`,

      order,

    });

  } catch (error) {

    console.error(
      "========== UPDATE ORDER STATUS ERROR =========="
    );

    console.error(error);

    console.error(
      "================================================"
    );


    res.status(500).json({

      message:
        "Failed to update order status",

      error:
        error.message,

    });

  }

};


module.exports = {
  getAllOrders,
  updateOrderStatus,
};