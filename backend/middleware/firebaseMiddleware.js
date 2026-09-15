const firebaseAdminAuth = require("../config/firebaseAdmin");

const firebaseMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Firebase authorization token is required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Firebase token is missing.",
      });
    }

    const decodedToken =
      await firebaseAdminAuth.verifyIdToken(token);

    req.firebaseUser = decodedToken;

    next();
  } catch (error) {
    console.error("Firebase authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired Firebase authentication token.",
    });
  }
};

module.exports = firebaseMiddleware;