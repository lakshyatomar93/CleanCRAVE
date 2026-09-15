const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getUserRecommendations,
} = require("../controllers/recommendationController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getUserRecommendations
);

module.exports = router;