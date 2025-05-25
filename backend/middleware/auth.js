import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Middleware to authenticate API requests
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }

    console.error("Authentication error:", error)
    res.status(500).json({ message: "Authentication failed" })
  }
}

// Middleware to authenticate socket connections
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication token missing"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return next(new Error("User not found"))
    }

    if (!user.isActive) {
      return next(new Error("Account is deactivated"))
    }

    socket.userId = user._id.toString()
    next()
  } catch (error) {
    console.error("Socket authentication error:", error)
    next(new Error("Authentication failed"))
  }
}

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." })
  }

  next()
}
