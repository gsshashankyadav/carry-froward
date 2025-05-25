"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Send, ChevronLeft, Info, AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { BACKEND_URL, API_URL } from "../config"
import io from "socket.io-client" // Import io for socket connection

const DEFAULT_AVATAR = "/images/default-avatar.png"
const DEFAULT_ITEM_IMAGE = "/images/default-item.png"

const Chat = () => {
  const { userId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // State
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [socket, setSocket] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [socketError, setSocketError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Refs
  const messagesEndRef = useRef(null)
  const conversationsLoaded = useRef(false)
  const activeConversationId = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return

    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No token found")
      return
    }

    // Create socket connection
    const socketUrl = API_URL.replace(/\/api\/?$/, "")
    console.log("Connecting to socket at:", socketUrl)

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: "/socket.io",
    })

    // Socket event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id)
      setSocketConnected(true)
      setSocketError(null)
    })

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
      setSocketError(`Connection error: ${err.message}`)
      setSocketConnected(false)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setSocketConnected(false)
    })

    newSocket.on("message", (message) => {
      console.log("Received message:", message)
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection")
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [currentUser])

  // Fetch conversations once on mount
  useEffect(() => {
    if (!currentUser || conversationsLoaded.current) return

    fetchConversations()
  }, [currentUser])

  // Set active conversation when userId or conversations change
  useEffect(() => {
    if (!conversationsLoaded.current || conversations.length === 0) return

    if (userId) {
      // Find conversation by ID
      const conversation = conversations.find((c) => c._id === userId)
      if (conversation) {
        console.log("Setting active conversation:", conversation._id)
        setActiveConversation(conversation)
        activeConversationId.current = conversation._id
      } else {
        console.error("Conversation not found for ID:", userId)
        setError("Conversation not found")
        if (conversations.length > 0) {
          navigate("/chat")
        }
      }
    } else if (conversations.length > 0 && !activeConversation) {
      // Default to first conversation if none selected
      setActiveConversation(conversations[0])
      activeConversationId.current = conversations[0]._id
    }
  }, [userId, conversations, conversationsLoaded.current])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return

    // Skip if conversation ID hasn't changed
    if (activeConversationId.current === activeConversation._id && messages.length > 0) {
      return
    }

    fetchMessages(activeConversation._id)
    activeConversationId.current = activeConversation._id
  }, [activeConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched conversations:", data)
      setConversations(data)
      conversationsLoaded.current = true

      // Calculate unread count
      const unread = data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
      setUnreadCount(unread)
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setError("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched messages:", data)
      setMessages(data)

      // Mark messages as read
      if (socket && socketConnected) {
        socket.emit("markAsRead", { conversationId })
      }

      // Update unread count in conversations
      setConversations((prev) => prev.map((conv) => (conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv)))
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  // Send a message
  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!messageText.trim() || !activeConversation || !socket || !socketConnected) {
      return
    }

    console.log("Sending message:", messageText)
    socket.emit("sendMessage", {
      content: messageText,
      conversationId: activeConversation._id,
    })

    // Optimistically add message to UI
    const optimisticMessage = {
      _id: Date.now().toString(), // Temporary ID
      content: messageText,
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      conversation: activeConversation._id,
      createdAt: new Date().toISOString(),
      isRead: false,
      readBy: [currentUser._id],
      isOptimistic: true, // Flag to identify optimistic messages
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setMessageText("")
  }

  // Select a conversation
  const handleSelectConversation = (conversation) => {
    if (activeConversation && conversation._id === activeConversation._id) {
      return
    }

    setActiveConversation(conversation)
    navigate(`/chat/${conversation._id}`)
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <div className="mt-3 flex">
            <button
              onClick={() => {
                setError(null)
                fetchConversations()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="ml-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render loading state
  if (loading && !activeConversation && conversations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Socket Connection Status */}
      {!socketConnected && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
          <WifiOff className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-yellow-700">
            Chat connection is offline. {socketError ? `Error: ${socketError}` : "Attempting to reconnect..."}
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Conversation List */}
          <div className="w-1/3 border-r overflow-y-auto hidden md:block">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="flex items-center">
                <button
                  onClick={fetchConversations}
                  className="text-gray-500 hover:text-indigo-600 mr-2"
                  title="Refresh conversations"
                  disabled={loading}
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                {socketConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" title="Connected" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" title="Disconnected" />
                )}
              </div>
            </div>

            {loading && conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet. Start by expressing interest in an item.
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => {
                  const otherUser = conversation.participants.find((p) => p._id !== currentUser._id)
                  if (!otherUser) return null

                  return (
                    <div
                      key={conversation._id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        activeConversation?._id === conversation._id ? "bg-indigo-50" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        <img
                          src={otherUser.avatar ? `${BACKEND_URL}${otherUser.avatar}` : DEFAULT_AVATAR}
                          alt={otherUser.name}
                          className="h-10 w-10 rounded-full mr-3"
                          onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium truncate">{otherUser.name}</h3>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                            </span>
                          </div>

                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.sender === currentUser._id ? "You: " : ""}
                              {conversation.lastMessage.content}
                            </p>
                          )}

                          {conversation.item && (
                            <div className="mt-1 flex items-center">
                              <div className="h-6 w-6 rounded overflow-hidden mr-1">
                                <img
                                  src={
                                    conversation.item.images && conversation.item.images.length > 0
                                      ? `${BACKEND_URL}${conversation.item.images[0]}`
                                      : DEFAULT_ITEM_IMAGE
                                  }
                                  alt={conversation.item.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => (e.target.src = DEFAULT_ITEM_IMAGE)}
                                />
                              </div>
                              <span className="text-xs text-gray-500 truncate">{conversation.item.title}</span>
                            </div>
                          )}

                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full mt-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center">
                  <button onClick={() => navigate("/dashboard")} className="md:hidden mr-2">
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {activeConversation.participants.map((participant) => {
                    if (participant._id !== currentUser._id) {
                      return (
                        <div key={participant._id} className="flex items-center">
                          <img
                            src={participant.avatar ? `${BACKEND_URL}${participant.avatar}` : DEFAULT_AVATAR}
                            alt={participant.name}
                            className="h-8 w-8 rounded-full mr-2"
                            onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                          />
                          <div>
                            <h3 className="font-medium">{participant.name}</h3>
                            <p className="text-xs text-gray-500">{participant.department}</p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}

                  {activeConversation.item && (
                    <div className="ml-auto flex items-center">
                      <button
                        onClick={() => fetchMessages(activeConversation._id)}
                        className="text-gray-500 hover:text-indigo-600 mr-2"
                        title="Refresh messages"
                        disabled={loading}
                      >
                        <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                      </button>
                      <div className="h-8 w-8 rounded overflow-hidden mr-2">
                        <img
                          src={
                            activeConversation.item.images && activeConversation.item.images.length > 0
                              ? `${BACKEND_URL}${activeConversation.item.images[0]}`
                              : DEFAULT_ITEM_IMAGE
                          }
                          alt={activeConversation.item.title}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.target.src = DEFAULT_ITEM_IMAGE)}
                        />
                      </div>
                      <span className="text-sm text-gray-600 truncate max-w-[150px]">
                        {activeConversation.item.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Info className="h-12 w-12 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                      <p className="text-gray-600 max-w-md">
                        Start the conversation by sending a message about the item.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === currentUser._id ? "justify-end" : "justify-start"} mb-4`}
                        >
                          {message.sender._id !== currentUser._id && (
                            <img
                              src={message.sender.avatar ? `${BACKEND_URL}${message.sender.avatar}` : DEFAULT_AVATAR}
                              alt={message.sender.name}
                              className="h-8 w-8 rounded-full mr-2"
                              onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                            />
                          )}

                          <div
                            className={`max-w-xs md:max-w-md ${
                              message.sender._id === currentUser._id ? "bg-indigo-100" : "bg-gray-100"
                            } rounded-lg p-3 ${message.isOptimistic ? "opacity-70" : ""}`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              {message.isOptimistic && " (sending...)"}
                            </p>
                          </div>

                          {message.sender._id === currentUser._id && (
                            <img
                              src={currentUser.avatar ? `${BACKEND_URL}${currentUser.avatar}` : DEFAULT_AVATAR}
                              alt={currentUser.name}
                              className="h-8 w-8 rounded-full ml-2"
                              onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                            />
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type a message..."
                      disabled={!socketConnected || loading}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || !socketConnected || loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Info className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Select a conversation from the list or start a new one by expressing interest in an item.
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Browse Items
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
