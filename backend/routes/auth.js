import express from "express"
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)
router.get("/verify-email/:token", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)

// Protected routes
router.get("/me", authenticate, getCurrentUser)
router.put("/profile", authenticate, updateProfile)
router.put("/password", authenticate, changePassword)

export default router
