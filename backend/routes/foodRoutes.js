const express = require("express");

const {
  searchFoods,
  importFood,
  getFoods,
  getFoodById,
  synchronizeFoods,
  synchronizeFoodCatalog,
  cleanupCatalog,
  bulkSynchronizeFoods,
} = require("../controllers/foodController");

const router = express.Router();


// Search USDA foods
router.get("/search", searchFoods);


// Synchronize arbitrary USDA foods
router.post("/sync", synchronizeFoods);

router.post("/bulk-sync", bulkSynchronizeFoods);

// Synchronize FoodFit catalog
router.post(
  "/sync-catalog",
  synchronizeFoodCatalog
);


// One-time catalog duplicate cleanup
router.post(
  "/cleanup-catalog",
  cleanupCatalog
);


// Import a specific USDA food
router.post(
  "/import/:fdcId",
  importFood
);


// Get FoodFit foods
router.get(
  "/",
  getFoods
);



// Get one food by MongoDB ID
router.get(
  "/:id",
  getFoodById
);


module.exports = router;