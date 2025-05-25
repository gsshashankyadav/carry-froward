import express from "express"
import { authenticate } from "../middleware/auth.js"
import {
  getSuggestions,
  getSuggestionById,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
  voteSuggestion,
  addComment,
  reportSuggestion,
} from "../controllers/suggestionController.js"

const router = express.Router()

// Define routes
router.get("/", authenticate, getSuggestions)
router.get("/:id", authenticate, getSuggestionById)
router.post("/", authenticate, createSuggestion)
router.put("/:id", authenticate, updateSuggestion)
router.delete("/:id", authenticate, deleteSuggestion)
router.post("/:id/vote", authenticate, voteSuggestion)
router.post("/:id/comments", authenticate, addComment)
router.post("/:id/report", authenticate, reportSuggestion)

export default router
