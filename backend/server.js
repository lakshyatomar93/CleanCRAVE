// ============================================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ============================================================

require("dotenv").config();

console.log("EMAIL_USER loaded:", !!process.env.EMAIL_USER);
console.log(
  "EMAIL_APP_PASSWORD loaded:",
  !!process.env.EMAIL_APP_PASSWORD
);

// ============================================================
// IMPORTS
// ============================================================

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const foodRoutes = require("./routes/foodRoutes");

const recommendationRoutes =
  require("./routes/recommendationRoutes");

const cartRoutes =
  require("./routes/cartRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const adminFoodRoutes =
  require("./routes/adminFoodRoutes");

const adminOrderRoutes =
  require("./routes/adminOrderRoutes");

const nutritionRoutes =
  require("./routes/nutritionRoutes");


// ============================================================
// FIREBASE ENVIRONMENT CHECK
// ============================================================

console.log(
  "Firebase project:",
  process.env.FIREBASE_PROJECT_ID
);

console.log(
  "Firebase client email:",
  process.env.FIREBASE_CLIENT_EMAIL
);

console.log(
  "Firebase private key exists:",
  !!process.env.FIREBASE_PRIVATE_KEY
);


// ============================================================
// DATABASE
// ============================================================

connectDB();


// ============================================================
// EXPRESS APP
// ============================================================

const app = express();


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// ROOT ROUTE
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message: "CleanCrave API is running",
  });
});


// ============================================================
// AUTH ROUTES
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);


// ============================================================
// FOOD ROUTES
// ============================================================

app.use(
  "/api/foods",
  foodRoutes
);


// ============================================================
// RECOMMENDATION ROUTES
// ============================================================

app.use(
  "/api/recommendations",
  recommendationRoutes
);


// ============================================================
// CART ROUTES
// ============================================================

app.use(
  "/api/cart",
  cartRoutes
);


// ============================================================
// ORDER ROUTES
// ============================================================

app.use(
  "/api/orders",
  orderRoutes
);


// ============================================================
// ADMIN FOOD ROUTES
// ============================================================

app.use(
  "/api/admin/foods",
  adminFoodRoutes
);


// ============================================================
// ADMIN ORDER ROUTES
// ============================================================

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);


// ============================================================
// NUTRITION ROUTES
// ============================================================

app.use(
  "/api/nutrition",
  nutritionRoutes
);


// ============================================================
// SERVER
// ============================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `CleanCrave API running on port ${PORT}`
  );
});