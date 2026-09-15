const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");


const router = express.Router();


router.get(
  "/",
  authMiddleware,
  getCart
);


router.post(
  "/items",
  authMiddleware,
  addToCart
);


router.put(
  "/items/:foodId",
  authMiddleware,
  updateCartItem
);


router.delete(
  "/items/:foodId",
  authMiddleware,
  removeFromCart
);


router.delete(
  "/",
  authMiddleware,
  clearCart
);


module.exports = router;