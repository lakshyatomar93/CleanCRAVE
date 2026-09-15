const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("========== AUTH DEBUG ==========");
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      console.log("❌ No authorization header");

      return res.status(401).json({
        message: "No authorization token",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    console.log("Token received:", token ? "YES" : "NO");

    if (!token) {
      console.log("❌ Invalid authorization format");

      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("✅ JWT VERIFIED");
    console.log("Decoded JWT:", decoded);
    console.log("User ID:", decoded.userId);
    console.log("================================");

    req.user = decoded;

    next();

  } catch (error) {
    console.log("❌ JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;