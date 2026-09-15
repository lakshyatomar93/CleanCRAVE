const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ==========================================
// CREATE ORDER
// ==========================================

const createOrder = async (req, res) => {
  try {
    const {
      paymentMethod = "Cash on Delivery",
      deliveryAddress,
    } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    // JWT contains userId
    const userId = req.user.userId || req.user.id;

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.food");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const orderItems = [];

    let subtotal = 0;

    // ==========================================
    // BUILD ORDER ITEMS
    // ==========================================

    for (const item of cart.items) {
      const food = item.food;

      if (!food) {
        continue;
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          message: `${food.name} is no longer available`,
        });
      }

      const quantity = item.quantity || 1;

      const itemTotal =
        food.price * quantity;

      subtotal += itemTotal;

      // ------------------------------------------
      // Nutrition snapshot
      // ------------------------------------------

      const calories =
        food.nutrition?.calories || 0;

      const protein =
        food.nutrition?.protein || 0;

      const carbohydrates =
        food.nutrition?.carbohydrates || 0;

      const fat =
        food.nutrition?.fat || 0;

      const fiber =
        food.nutrition?.fiber || 0;

      // ------------------------------------------
      // Order item snapshot
      // ------------------------------------------

      orderItems.push({
        food: food._id,

        name: food.name,

        image: food.image,

        price: food.price,

        quantity,

        nutrition: {
          calories,
          protein,
          carbohydrates,
          fat,
          fiber,
        },
      });
    }

    // ==========================================
    // VALIDATE ITEMS
    // ==========================================

    if (orderItems.length === 0) {
      return res.status(400).json({
        message: "No valid items in cart",
      });
    }

    // ==========================================
    // DELIVERY FEE
    // ==========================================

    const deliveryFee =
      subtotal >= 300 ? 0 : 30;

    const total =
      subtotal + deliveryFee;

    // ==========================================
    // ESTIMATED DELIVERY
    // ==========================================

    const estimatedDelivery =
      new Date(
        Date.now() + 45 * 60 * 1000
      );

    // ==========================================
    // CREATE ORDER
    // ==========================================

    const order = await Order.create({
      user: userId,

      items: orderItems,

      subtotal,

      deliveryFee,

      total,

      paymentMethod,

      paymentStatus: "Pending",

      orderStatus: "Placed",

      // Important:
      // Nutrition will be logged only
      // when admin marks order Delivered.
      nutritionLogged: false,

      deliveryAddress,

      estimatedDelivery,
    });

    // ==========================================
    // EMPTY CART
    // ==========================================

    cart.items = [];

    await cart.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      success: true,

      message: "Order placed successfully",

      order,
    });

  } catch (error) {
    console.error(
      "========== CREATE ORDER ERROR =========="
    );

    console.error(error);

    console.error(
      "========================================="
    );

    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};


// ==========================================
// GET MY ORDERS
// ==========================================

const getMyOrders = async (req, res) => {
  try {
    const userId =
      req.user.userId || req.user.id;

    const orders = await Order.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,

      count: orders.length,

      orders,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load orders",
    });
  }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const userId =
      req.user.userId || req.user.id;

    const order = await Order.findOne({
      _id: req.params.id,

      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      success: true,

      order,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load order",
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};