"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Search, ChevronLeft, AlertTriangle, MessageSquare, Flag } from "lucide-react"
import axios from "axios"
import { API_URL, BACKEND_URL } from "../../config"
import { formatDistanceToNow } from "date-fns"

// Default images
const DEFAULT_AVATAR = "/images/default-avatar.png"
const DEFAULT_ITEM_IMAGE = "/images/default-item.png"

const AdminChats = () => {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/admin/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setConversations(response.data)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/admin/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setMessages(response.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("Failed to load messages")
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation._id)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Filter conversations based on search term
  }

  const handleFlagConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${API_URL}/admin/conversations/${conversationId}/flag`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update conversation in the list
      setConversations((prevConversations) =>
        prevConversations.map((conv) => (conv._id === conversationId ? { ...conv, isFlagged: !conv.isFlagged } : conv)),
      )

      if (selectedConversation && selectedConversation._id === conversationId) {
        setSelectedConversation((prev) => ({ ...prev, isFlagged: !prev.isFlagged }))
      }
    } catch (error) {
      console.error("Error flagging conversation:", error)
      setError("Failed to flag conversation")
    }
  }

  const filteredConversations = searchTerm
    ? conversations.filter((conversation) => {
        const participants = conversation.participants.map((p) => p.name.toLowerCase()).join(" ")
        return (
          participants.includes(searchTerm.toLowerCase()) ||
          (conversation.item && conversation.item.title.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
    : conversations

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitor Chats</h1>
          <p className="text-gray-600">View and moderate user conversations</p>
        </div>

        <Link to="/admin" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Conversation List */}
          <div className="w-1/3 border-r overflow-y-auto">
            <div className="p-4 border-b">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No conversations found</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?._id === conversation._id ? "bg-indigo-50" : ""
                    } ${conversation.isFlagged ? "bg-red-50" : ""}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">
                            {conversation.participants.map((p) => p.name).join(" & ")}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                          </span>
                        </div>

                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                        )}

                        {conversation.item && (
                          <div className="mt-1 flex items-center">
                            <div className="h-6 w-6 rounded overflow-hidden mr-1">
                              <img
                                src={
                                  conversation.item.images && conversation.item.images[0]
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

                        {conversation.isFlagged && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedConversation.participants.map((p) => p.name).join(" & ")}</h3>
                    {selectedConversation.item && (
                      <p className="text-sm text-gray-600">Regarding: {selectedConversation.item.title}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleFlagConversation(selectedConversation._id)}
                    className={`p-2 rounded-full ${
                      selectedConversation.isFlagged ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                      <p className="text-gray-600">This conversation has no messages.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message._id} className="flex">
                          <img
                            src={message.sender.avatar ? `${BACKEND_URL}${message.sender.avatar}` : DEFAULT_AVATAR}
                            alt={message.sender.name}
                            className="h-8 w-8 rounded-full mr-2"
                            onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                          />
                          <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm">{message.sender.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="p-4 border-t">
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this conversation?")) {
                          // Handle delete conversation
                        }
                      }}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      Delete Conversation
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to warn these users?")) {
                          // Handle warn users
                        }
                      }}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200"
                    >
                      Send Warning
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-600 max-w-md">
                  Select a conversation from the list to view messages and moderate content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminChats
