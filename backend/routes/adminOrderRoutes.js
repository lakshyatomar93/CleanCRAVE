const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminOrderController");


const router = express.Router();


router.use(authMiddleware);
router.use(adminMiddleware);


router.get(
  "/",
  getAllOrders
);


router.patch(
  "/:id/status",
  updateOrderStatus
);


module.exports = router;