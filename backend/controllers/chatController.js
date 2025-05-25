import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import User from "../models/User.js"

// Get conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id

    // Find conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name avatar department")
      .populate("item", "title images")
      .sort({ updatedAt: -1 })

    // Add unread count for each conversation
    const conversationsWithUnread = conversations.map((conversation) => {
      const unreadInfo = conversation.unreadCounts.find((uc) => uc.user.toString() === userId.toString())

      return {
        ...conversation.toObject(),
        unreadCount: unreadInfo ? unreadInfo.count : 0,
      }
    })

    res.status(200).json(conversationsWithUnread)
  } catch (error) {
    console.error("Get conversations error:", error)
    res.status(500).json({ message: "Failed to get conversations" })
  }
}

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id

    // Find conversation
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "You are not a participant in this conversation" })
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })

    // Mark messages as read
    await markMessagesAsRead(conversationId, userId)

    res.status(200).json(messages)
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ message: "Failed to get messages" })
  }
}

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { recipientId, itemId } = req.body
    const userId = req.user._id

    // Check if recipient exists
    const recipient = await User.findById(recipientId)

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" })
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      item: itemId,
    })

    if (existingConversation) {
      // Return existing conversation
      await existingConversation.populate("participants", "name avatar department")
      await existingConversation.populate("item", "title images")

      return res.status(200).json(existingConversation)
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, recipientId],
      item: itemId,
      unreadCounts: [
        { user: userId, count: 0 },
        { user: recipientId, count: 0 },
      ],
    })

    await conversation.save()

    // Populate details
    await conversation.populate("participants", "name avatar department")
    await conversation.populate("item", "title images")

    res.status(201).json(conversation)
  } catch (error) {
    console.error("Create conversation error:", error)
    res.status(500).json({ message: "Failed to create conversation" })
  }
}

// Create a new message
export const createMessage = async (messageData) => {
  try {
    const { sender, content, conversation: conversationId } = messageData

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender,
      content,
      readBy: [sender], // Sender has read the message
    })

    await message.save()

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        sender,
        content,
        createdAt: message.createdAt,
      },
      updatedAt: Date.now(),
    })

    // Increment unread count for all participants except sender
    const conversation = await Conversation.findById(conversationId)

    conversation.unreadCounts = conversation.unreadCounts.map((uc) => {
      if (uc.user.toString() !== sender.toString()) {
        return { ...uc.toObject(), count: uc.count + 1 }
      }
      return uc
    })

    await conversation.save()

    // Populate sender details
    await message.populate("sender", "name avatar")

    return message
  } catch (error) {
    console.error("Create message error:", error)
    throw error
  }
}

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    // Update messages
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      {
        $push: { readBy: userId },
        $set: { isRead: true },
      },
    )

    // Reset unread count for user
    await Conversation.updateOne(
      { _id: conversationId, "unreadCounts.user": userId },
      { $set: { "unreadCounts.$.count": 0 } },
    )
  } catch (error) {
    console.error("Mark messages as read error:", error)
    throw error
  }
}

// Get conversation by ID (for socket.io)
export const getConversationById = async (conversationId) => {
  try {
    return await Conversation.findById(conversationId)
  } catch (error) {
    console.error("Get conversation by ID error:", error)
    throw error
  }
}
