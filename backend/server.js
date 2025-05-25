import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"
import jwt from "jsonwebtoken"
import User from "./models/User.js"

// Routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import itemRoutes from "./routes/items.js"
import chatRoutes from "./routes/chat.js"
import suggestionRoutes from "./routes/suggestions.js"
import adminRoutes from "./routes/admin.js"

// Config
dotenv.config()
const app = express()
const server = http.createServer(app)

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(express.static(path.join(__dirname, "public")))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
const fs = await import("fs")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/suggestions", suggestionRoutes)
app.use("/api/admin", adminRoutes)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io", // Explicitly set the default Socket.IO path
})

// Socket authentication middleware
io.use(async (socket, next) => {
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
    next(new Error("Authentication failed: " + error.message))
  }
})

// Socket.io connection handler
io.on("connection", async (socket) => {
  console.log("User connected:", socket.userId, "Socket ID:", socket.id)

  // Join user's room
  socket.join(socket.userId)

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      const { content, conversationId, itemId } = data
      console.log("Received message from client:", data)

      // Import here to avoid circular dependency
      const { createMessage, getConversationById } = await import("./controllers/chatController.js")

      // Create message in database
      const message = await createMessage({
        sender: socket.userId,
        content,
        conversation: conversationId,
        item: itemId,
      })

      console.log("Created message:", message)

      // Get conversation to find recipients
      const conversation = await getConversationById(conversationId)

      // Emit to all participants
      conversation.participants.forEach((participant) => {
        const participantId = participant.toString()
        if (participantId !== socket.userId) {
          console.log("Emitting message to participant:", participantId)
          io.to(participantId).emit("message", message)
        }
      })

      // Also emit back to sender
      socket.emit("message", message)
    } catch (error) {
      console.error("Error sending message:", error)
      socket.emit("error", { message: "Failed to send message: " + error.message })
    }
  })

  // Mark messages as read
  socket.on("markAsRead", async (data) => {
    try {
      const { conversationId } = data

      // Import here to avoid circular dependency
      const { markMessagesAsRead } = await import("./controllers/chatController.js")

      await markMessagesAsRead(conversationId, socket.userId)
    } catch (error) {
      console.error("Error marking messages as read:", error)
      socket.emit("error", { message: "Failed to mark messages as read: " + error.message })
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId, "Socket ID:", socket.id)
  })
})

// Add a simple route to test the server
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running correctly" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!", error: err.message })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")

    // Start server
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Socket.IO server running with path: /socket.io`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })
