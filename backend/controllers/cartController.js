const Cart = require("../models/Cart");
const Food = require("../models/Food");

// ==========================================
// BUILD COMPLETE CART RESPONSE
// ==========================================

const buildCartResponse = async (cart) => {
  const populatedCart = await Cart.findById(cart._id)
    .populate("items.food");

  let subtotal = 0;

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbohydrates = 0;
  let totalFat = 0;
  let totalFiber = 0;

  let itemCount = 0;

  populatedCart.items.forEach((item) => {
    const food = item.food;

    if (!food) {
      return;
    }

    const quantity = Number(item.quantity) || 1;

    // ------------------------------------------
    // ITEM COUNT
    // ------------------------------------------

    itemCount += quantity;

    // ------------------------------------------
    // PRICE
    // ------------------------------------------

    subtotal +=
      (Number(food.price) || 0) * quantity;

    // ------------------------------------------
    // NUTRITION
    // ------------------------------------------

    totalCalories +=
      (Number(food.nutrition?.calories) || 0) *
      quantity;

    totalProtein +=
      (Number(food.nutrition?.protein) || 0) *
      quantity;

    totalCarbohydrates +=
      (Number(food.nutrition?.carbohydrates) || 0) *
      quantity;

    totalFat +=
      (Number(food.nutrition?.fat) || 0) *
      quantity;

    totalFiber +=
      (Number(food.nutrition?.fiber) || 0) *
      quantity;
  });

  return {
    ...populatedCart.toObject(),

    summary: {
      itemCount,

      subtotal,

      totalCalories,
      totalProtein,
      totalCarbohydrates,
      totalFat,
      totalFiber,
    },
  };
};


// ==========================================
// GET CART
// ==========================================

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.userId,
    });

    // ------------------------------------------
    // CREATE CART IF IT DOES NOT EXIST
    // ------------------------------------------

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [],
      });
    }

    // ------------------------------------------
    // BUILD COMPLETE CART
    // ------------------------------------------

    const completeCart =
      await buildCartResponse(cart);

    res.json({
      success: true,
      cart: completeCart,
    });
  } catch (error) {
    console.error(
      "GET CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load cart",
    });
  }
};


// ==========================================
// ADD ITEM
// ==========================================

const addToCart = async (req, res) => {
  try {
    const {
      foodId,
      quantity = 1,
    } = req.body;

    // ------------------------------------------
    // VALIDATE FOOD ID
    // ------------------------------------------

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "foodId is required",
      });
    }

    // ------------------------------------------
    // VALIDATE QUANTITY
    // ------------------------------------------

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a positive integer",
      });
    }

    // ------------------------------------------
    // FIND FOOD
    // ------------------------------------------

    const food =
      await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // ------------------------------------------
    // CHECK AVAILABILITY
    // ------------------------------------------

    if (!food.isAvailable) {
      return res.status(400).json({
        success: false,
        message:
          "Food is currently unavailable",
      });
    }

    // ------------------------------------------
    // FIND USER CART
    // ------------------------------------------

    let cart =
      await Cart.findOne({
        user: req.user.userId,
      });

    // ------------------------------------------
    // CREATE CART IF NEEDED
    // ------------------------------------------

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [],
      });
    }

    // ------------------------------------------
    // CHECK EXISTING ITEM
    // ------------------------------------------

    const existingItem =
      cart.items.find(
        (item) =>
          item.food.toString() ===
          foodId.toString()
      );

    if (existingItem) {
      existingItem.quantity +=
        parsedQuantity;
    } else {
      cart.items.push({
        food: foodId,
        quantity: parsedQuantity,
      });
    }

    // ------------------------------------------
    // SAVE CART
    // ------------------------------------------

    await cart.save();

    // ------------------------------------------
    // BUILD COMPLETE CART
    // ------------------------------------------

    const completeCart =
      await buildCartResponse(cart);

    res.status(201).json({
      success: true,
      message: "Food added to cart",
      cart: completeCart,
    });
  } catch (error) {
    console.error(
      "ADD TO CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add food to cart",
    });
  }
};


// ==========================================
// UPDATE QUANTITY
// ==========================================

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    // ------------------------------------------
    // VALIDATE QUANTITY
    // ------------------------------------------

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a positive integer",
      });
    }

    // ------------------------------------------
    // FIND CART
    // ------------------------------------------

    const cart =
      await Cart.findOne({
        user: req.user.userId,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // ------------------------------------------
    // FIND ITEM
    // ------------------------------------------

    const item =
      cart.items.find(
        (item) =>
          item.food.toString() ===
          req.params.foodId.toString()
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Item not found in cart",
      });
    }

    // ------------------------------------------
    // UPDATE QUANTITY
    // ------------------------------------------

    item.quantity = parsedQuantity;

    // ------------------------------------------
    // SAVE
    // ------------------------------------------

    await cart.save();

    // ------------------------------------------
    // BUILD COMPLETE CART
    // IMPORTANT:
    // This includes summary again.
    // ------------------------------------------

    const completeCart =
      await buildCartResponse(cart);

    res.json({
      success: true,
      message: "Cart updated",
      cart: completeCart,
    });
  } catch (error) {
    console.error(
      "UPDATE CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};


// ==========================================
// REMOVE ITEM
// ==========================================

const removeFromCart = async (req, res) => {
  try {
    // ------------------------------------------
    // FIND CART
    // ------------------------------------------

    const cart =
      await Cart.findOne({
        user: req.user.userId,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // ------------------------------------------
    // REMOVE ITEM
    // ------------------------------------------

    cart.items =
      cart.items.filter(
        (item) =>
          item.food.toString() !==
          req.params.foodId.toString()
      );

    // ------------------------------------------
    // SAVE
    // ------------------------------------------

    await cart.save();

    // ------------------------------------------
    // BUILD COMPLETE CART
    // ------------------------------------------

    const completeCart =
      await buildCartResponse(cart);

    res.json({
      success: true,
      message: "Item removed",
      cart: completeCart,
    });
  } catch (error) {
    console.error(
      "REMOVE CART ITEM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to remove item",
    });
  }
};


// ==========================================
// CLEAR CART
// ==========================================

const clearCart = async (req, res) => {
  try {
    const cart =
      await Cart.findOne({
        user: req.user.userId,
      });

    if (!cart) {
      return res.json({
        success: true,
        message: "Cart already empty",
      });
    }

    // ------------------------------------------
    // CLEAR ITEMS
    // ------------------------------------------

    cart.items = [];

    await cart.save();

    // ------------------------------------------
    // RETURN EMPTY CART WITH SUMMARY
    // ------------------------------------------

    const completeCart =
      await buildCartResponse(cart);

    res.json({
      success: true,
      message: "Cart cleared",
      cart: completeCart,
    });
  } catch (error) {
    console.error(
      "CLEAR CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};