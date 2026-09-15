const adminMiddleware = (req, res, next) => {

  console.log("REQ.USER:", req.user);

  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};

module.exports = adminMiddleware;