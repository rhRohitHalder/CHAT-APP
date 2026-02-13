import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv"
dotenv.config();
const protect_route = async (req, res, next) => {
  // console.log("=== AUTH MIDDLEWARE ===============================================");
  // console.log("Request headers:", JSON.stringify(req.headers, null, 2));
  // console.log("Request cookies:", req.cookies);

  const token = req.cookies?._jwt;

  // console.log("Extracted token:", token);

  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ message: "Unauthorized - no token found" });
  }
  // // ✅ Fallback: check Authorization header (for Postman or API clients)
  // if (!token && req.headers.authorization?.startsWith("Bearer")) {
  //   token = req.headers.authorization.split(" ")[1];
  // }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.UserId).select("-password");
    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }
    // console.log("User authenticated:", user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};

export { protect_route };
