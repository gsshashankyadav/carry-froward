"use client"

import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../contexts/AuthContext"
import { BACKEND_URL } from "../config"

// Default images
const DEFAULT_AVATAR = "/images/default-avatar.png"

const ChatMessage = ({ message }) => {
  const { currentUser } = useAuth()
  const isOwnMessage = message.sender._id === currentUser._id

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      {!isOwnMessage && (
        <img
          src={message.sender.avatar ? `${BACKEND_URL}${message.sender.avatar}` : DEFAULT_AVATAR}
          alt={message.sender.name}
          className="h-8 w-8 rounded-full mr-2"
          onError={(e) => (e.target.src = DEFAULT_AVATAR)}
        />
      )}

      <div className={`max-w-xs md:max-w-md ${isOwnMessage ? "bg-indigo-100" : "bg-gray-100"} rounded-lg p-3`}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </p>
      </div>

      {isOwnMessage && (
        <img
          src={currentUser.avatar ? `${BACKEND_URL}${currentUser.avatar}` : DEFAULT_AVATAR}
          alt={currentUser.name}
          className="h-8 w-8 rounded-full ml-2"
          onError={(e) => (e.target.src = DEFAULT_AVATAR)}
        />
      )}
    </div>
  )
}

export default ChatMessage
