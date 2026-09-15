const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const {
  getAdminFoods,
  createAdminFood,
  updateAdminFood,
  deleteAdminFood,
  toggleFoodAvailability,
} = require("../controllers/adminFoodController");


const router = express.Router();


router.use(authMiddleware);
router.use(adminMiddleware);


router.get(
  "/",
  getAdminFoods
);


router.post(
  "/",
  createAdminFood
);


router.put(
  "/:id",
  updateAdminFood
);


router.delete(
  "/:id",
  deleteAdminFood
);


router.patch(
  "/:id/availability",
  toggleFoodAvailability
);


module.exports = router;