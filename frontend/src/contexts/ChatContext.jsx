"use client"

import { createContext, useState, useContext, useEffect } from "react"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"
import { API_URL } from "../config"

// Create the context
const ChatContext = createContext(null)

// ChatProvider component
export function ChatProvider({ children }) {
  const { currentUser } = useAuth()
  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [socketConnected, setSocketConnected] = useState(false)
  const [socketError, setSocketError] = useState(null)

  // Initialize socket connection when user logs in
  useEffect(() => {
    if (!currentUser) return

    let newSocket = null

    const connectSocket = () => {
      const token = localStorage.getItem("token")

      // Make sure we're using the base URL without any path segments
      const socketUrl = API_URL.replace(/\/api\/?$/, "")
      console.log("Attempting to connect to socket at:", socketUrl)

      newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        path: "/socket.io", // Explicitly set the default Socket.IO path
      })

      newSocket.on("connect", () => {
        console.log("Socket connected successfully with ID:", newSocket.id)
        setSocketConnected(true)
        setSocketError(null)
      })

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message)
        setSocketError(`Connection error: ${err.message}`)
        setSocketConnected(false)
      })

      newSocket.on("error", (err) => {
        console.error("Socket error:", err)
        setSocketError(`Socket error: ${err.message || "Unknown error"}`)
      })

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason)
        setSocketConnected(false)

        // Attempt to reconnect if the disconnection wasn't intentional
        if (reason === "io server disconnect") {
          // The server has forcefully disconnected the socket
          newSocket.connect()
        }
      })

      newSocket.on("message", (message) => {
        console.log("Received message:", message)
        // Add new message to state
        if (activeConversation && message.conversationId === activeConversation._id) {
          setMessages((prev) => [...prev, message])
        } else {
          // Increment unread count if not in active conversation
          setUnreadCount((prev) => prev + 1)
        }
      })

      setSocket(newSocket)
    }

    connectSocket()

    return () => {
      if (newSocket) {
        console.log("Disconnecting socket")
        newSocket.disconnect()
      }
    }
  }, [currentUser])

  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentUser) return Promise.reject(new Error("User not authenticated"))

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setConversations(data)

      // Calculate unread messages
      const unread = data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
      setUnreadCount(unread)

      return data
    } catch (error) {
      console.error("Error fetching conversations:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return Promise.reject(new Error("Conversation ID is required"))

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setMessages(data)

      // Mark messages as read
      if (socket && socketConnected) {
        socket.emit("markAsRead", { conversationId })
      }

      // Update unread count
      setConversations((prev) => prev.map((conv) => (conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv)))

      // Recalculate total unread
      setUnreadCount((prev) =>
        Math.max(0, prev - (conversations.find((c) => c._id === conversationId)?.unreadCount || 0)),
      )

      return data
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Send a message
  const sendMessage = (content, conversationId, itemId = null) => {
    if (!socket || !currentUser || !socketConnected) {
      console.error("Cannot send message: Socket not connected")
      return false
    }

    console.log("Sending message:", { content, conversationId, itemId })
    socket.emit("sendMessage", {
      content,
      conversationId,
      itemId,
    })

    return true
  }

  // Start a new conversation about an item
  const startConversation = async (recipientId, itemId) => {
    if (!recipientId || !itemId) return Promise.reject(new Error("Recipient ID and Item ID are required"))

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, itemId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Add new conversation to state
      setConversations((prev) => [data, ...prev])
      return data
    } catch (error) {
      console.error("Error starting conversation:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    unreadCount,
    socketConnected,
    socketError,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

// Custom hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === null) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
