import express from "express"
import { authenticate } from "../middleware/auth.js"
import { getConversations, getMessages, createConversation } from "../controllers/chatController.js"

const router = express.Router()

// Define routes
router.get("/conversations", authenticate, getConversations)
router.get("/messages/:conversationId", authenticate, getMessages)
router.post("/conversations", authenticate, createConversation)

export default router
