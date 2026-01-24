const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];  // Get token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);  // Log the decoded token to check the user's role

    req.user = decoded;  // Attach the decoded user information to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle different types of JWT errors (e.g., token expiration, malformed token)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

module.exports = { requireAuth };
