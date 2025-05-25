import express from "express"
import { authenticate, isAdmin } from "../middleware/auth.js"
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  getReportedItems,
  getReportedSuggestions,
  moderateItem,
  moderateSuggestion,
  toggleFeatureItem,
  getAllSuggestions,
  getSuggestionById,
  updateSuggestionStatus,
  toggleFeatureSuggestion,
  deleteSuggestion,
  deleteComment,
  getAllConversations,
  getConversationById,
  deleteConversation,
} from "../controllers/adminController.js"

const router = express.Router()

// All routes require authentication and admin privileges
router.use(authenticate, isAdmin)

// Dashboard
router.get("/dashboard", getDashboardStats)

// Users
router.get("/users", getUsers)
router.get("/users/:id", getUserById)
router.put("/users/:id", updateUser)

// Moderation
router.get("/reported-items", getReportedItems)
router.get("/reported-suggestions", getReportedSuggestions)
router.put("/items/:id/moderate", moderateItem)
router.put("/suggestions/:id/moderate", moderateSuggestion)
router.put("/items/:id/feature", toggleFeatureItem)

// Suggestions management
router.get("/suggestions", getAllSuggestions)
router.get("/suggestions/:id", getSuggestionById)
router.put("/suggestions/:id/status", updateSuggestionStatus)
router.put("/suggestions/:id/feature", toggleFeatureSuggestion)
router.delete("/suggestions/:id", deleteSuggestion)
router.delete("/suggestions/:id/comments/:commentId", deleteComment)

// Conversations management
router.get("/conversations", getAllConversations)
router.get("/conversations/:id", getConversationById)
router.delete("/conversations/:id", deleteConversation)

export default router
