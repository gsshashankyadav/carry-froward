import User from "../models/User.js"
import Item from "../models/Item.js"
import Suggestion from "../models/Suggestion.js"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import mongoose from "mongoose"

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments()
    const itemCount = await Item.countDocuments()
    const handedOverCount = await Item.countDocuments({ status: "handed_over" })
    const suggestionCount = await Suggestion.countDocuments()
    const reportedItemsCount = await Item.countDocuments({ "reports.0": { $exists: true } })
    const reportedSuggestionsCount = await Suggestion.countDocuments({ "reports.0": { $exists: true } })

    // Get recent activity
    const recentItems = await Item.find().populate("owner", "name avatar").sort({ createdAt: -1 }).limit(5)

    const recentSuggestions = await Suggestion.find().populate("author", "name avatar").sort({ createdAt: -1 }).limit(5)

    // Get category distribution
    const categoryDistribution = await Item.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Get monthly stats
    const currentDate = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6)

    const monthlyItems = await Item.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    const monthlyHandovers = await Item.aggregate([
      {
        $match: {
          status: "handed_over",
          handoverDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$handoverDate" },
            month: { $month: "$handoverDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    res.status(200).json({
      counts: {
        users: userCount,
        items: itemCount,
        handedOver: handedOverCount,
        suggestions: suggestionCount,
        reportedItems: reportedItemsCount,
        reportedSuggestions: reportedSuggestionsCount,
      },
      recentActivity: {
        items: recentItems,
        suggestions: recentSuggestions,
      },
      categoryDistribution,
      monthlyStats: {
        items: monthlyItems,
        handovers: monthlyHandovers,
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Failed to get dashboard stats" })
  }
}

// Get all users
export const getUsers = async (req, res) => {
  try {
    const { search, sort, role } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ]
    }

    if (role) {
      query.role = role
    }

    // Determine sort order
    let sortOption = { createdAt: -1 } // Default: newest first

    if (sort === "name") {
      sortOption = { name: 1 }
    } else if (sort === "department") {
      sortOption = { department: 1 }
    }

    // Get users
    const users = await User.find(query).select("-password").sort(sortOption)

    res.status(200).json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Failed to get users" })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's items
    const items = await Item.find({ owner: id }).sort({ createdAt: -1 })

    // Get user's suggestions
    const suggestions = await Suggestion.find({ author: id }).sort({ createdAt: -1 })

    res.status(200).json({
      user,
      items,
      suggestions,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({ message: "Failed to get user" })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, department, role, isActive } = req.body

    // Find user
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user
    if (name) user.name = name
    if (email) user.email = email
    if (department) user.department = department
    if (role) user.role = role
    if (isActive !== undefined) user.isActive = isActive

    user.updatedAt = Date.now()
    await user.save()

    res.status(200).json({
      message: "User updated successfully",
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Failed to update user" })
  }
}

// Get reported items
export const getReportedItems = async (req, res) => {
  try {
    // Get items with reports
    const items = await Item.find({ "reports.0": { $exists: true } })
      .populate("owner", "name avatar")
      .populate("reports.user", "name")
      .sort({ "reports.length": -1 })

    res.status(200).json(items)
  } catch (error) {
    console.error("Get reported items error:", error)
    res.status(500).json({ message: "Failed to get reported items" })
  }
}

// Get reported suggestions
export const getReportedSuggestions = async (req, res) => {
  try {
    // Get suggestions with reports
    const suggestions = await Suggestion.find({ "reports.0": { $exists: true } })
      .populate("author", "name avatar")
      .populate("reports.user", "name")
      .sort({ "reports.length": -1 })

    res.status(200).json(suggestions)
  } catch (error) {
    console.error("Get reported suggestions error:", error)
    res.status(500).json({ message: "Failed to get reported suggestions" })
  }
}

// Approve or reject an item
export const moderateItem = async (req, res) => {
  try {
    const { id } = req.params
    const { action, reason } = req.body

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" })
    }

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Update item
    if (action === "approve") {
      item.isApproved = true
      item.status = "available"
    } else {
      item.isApproved = false
      item.status = "rejected"
    }

    // Clear reports if approving
    if (action === "approve") {
      item.reports = []
    }

    item.updatedAt = Date.now()
    await item.save()

    res.status(200).json({
      message: `Item ${action === "approve" ? "approved" : "rejected"} successfully`,
      item,
    })
  } catch (error) {
    console.error("Moderate item error:", error)
    res.status(500).json({ message: "Failed to moderate item" })
  }
}

// Approve or reject a suggestion
export const moderateSuggestion = async (req, res) => {
  try {
    const { id } = req.params
    const { action, reason } = req.body

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" })
    }

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Update suggestion
    suggestion.isApproved = action === "approve"

    // Clear reports if approving
    if (action === "approve") {
      suggestion.reports = []
    }

    suggestion.updatedAt = Date.now()
    await suggestion.save()

    res.status(200).json({
      message: `Suggestion ${action === "approve" ? "approved" : "rejected"} successfully`,
      suggestion,
    })
  } catch (error) {
    console.error("Moderate suggestion error:", error)
    res.status(500).json({ message: "Failed to moderate suggestion" })
  }
}

// Feature or unfeature an item
export const toggleFeatureItem = async (req, res) => {
  try {
    const { id } = req.params

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Toggle featured status
    item.isFeatured = !item.isFeatured
    await item.save()

    res.status(200).json({
      message: `Item ${item.isFeatured ? "featured" : "unfeatured"} successfully`,
      item,
    })
  } catch (error) {
    console.error("Toggle feature item error:", error)
    res.status(500).json({ message: "Failed to toggle feature status" })
  }
}

// Get all suggestions with filtering and sorting
export const getAllSuggestions = async (req, res) => {
  try {
    const { search, status, sort, type, page = 1, limit = 10 } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ]
    }

    if (status && ["open", "in_progress", "implemented", "closed"].includes(status)) {
      query.status = status
    }

    if (type === "reported") {
      query["reports.0"] = { $exists: true }
    }

    // Determine sort order
    let sortOption = { createdAt: -1 } // Default: newest first

    if (sort === "oldest") {
      sortOption = { createdAt: 1 }
    } else if (sort === "votes") {
      sortOption = { "votes.length": -1 }
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Get suggestions
    const suggestions = await Suggestion.find(query)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar")
      .populate("votes.user", "name")
      .populate("reports.user", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count for pagination
    const total = await Suggestion.countDocuments(query)

    res.status(200).json({
      suggestions,
      pagination: {
        total,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get all suggestions error:", error)
    res.status(500).json({ message: "Failed to get suggestions" })
  }
}

// Get suggestion by ID
export const getSuggestionById = async (req, res) => {
  try {
    const { id } = req.params

    const suggestion = await Suggestion.findById(id)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar")
      .populate("votes.user", "name")
      .populate("reports.user", "name")

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    res.status(200).json(suggestion)
  } catch (error) {
    console.error("Get suggestion by ID error:", error)
    res.status(500).json({ message: "Failed to get suggestion" })
  }
}

// Update suggestion status
export const updateSuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["open", "in_progress", "implemented", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Update status
    suggestion.status = status
    suggestion.updatedAt = Date.now()
    await suggestion.save()

    res.status(200).json({
      message: `Suggestion status updated to ${status}`,
      suggestion,
    })
  } catch (error) {
    console.error("Update suggestion status error:", error)
    res.status(500).json({ message: "Failed to update suggestion status" })
  }
}

// Feature or unfeature a suggestion
export const toggleFeatureSuggestion = async (req, res) => {
  try {
    const { id } = req.params

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Toggle featured status (add the field if it doesn't exist)
    suggestion.isFeatured = !suggestion.isFeatured
    await suggestion.save()

    res.status(200).json({
      message: `Suggestion ${suggestion.isFeatured ? "featured" : "unfeatured"} successfully`,
      suggestion,
    })
  } catch (error) {
    console.error("Toggle feature suggestion error:", error)
    res.status(500).json({ message: "Failed to toggle feature status" })
  }
}

// Delete a suggestion
export const deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params

    // Find and delete suggestion
    const suggestion = await Suggestion.findByIdAndDelete(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    res.status(200).json({
      message: "Suggestion deleted successfully",
      id,
    })
  } catch (error) {
    console.error("Delete suggestion error:", error)
    res.status(500).json({ message: "Failed to delete suggestion" })
  }
}

// Delete a comment from a suggestion
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if comment exists
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" })
    }

    // Remove comment
    suggestion.comments = suggestion.comments.filter((comment) => comment._id.toString() !== commentId)

    suggestion.updatedAt = Date.now()
    await suggestion.save()

    res.status(200).json({
      message: "Comment deleted successfully",
      suggestion,
    })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ message: "Failed to delete comment" })
  }
}

// Get all conversations with filtering and pagination
export const getAllConversations = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = "updatedAt", sortOrder = "desc" } = req.query

    // Build query
    const query = {}

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Get conversations with populated data
    let conversationsQuery = Conversation.find(query)
      .populate("participants", "name email avatar department")
      .populate("item", "title category images")
      .populate("lastMessage.sender", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))

    // If search is provided, we need to search in populated fields
    if (search) {
      // First get all conversations, then filter
      const allConversations = await Conversation.find()
        .populate("participants", "name email avatar department")
        .populate("item", "title category images")
        .populate("lastMessage.sender", "name avatar")
        .sort(sort)

      // Filter conversations based on search term
      const filteredConversations = allConversations.filter(conv => {
        const searchLower = search.toLowerCase()
        
        // Search in participant names and emails
        const participantMatch = conv.participants.some(p => 
          p.name?.toLowerCase().includes(searchLower) || 
          p.email?.toLowerCase().includes(searchLower)
        )
        
        // Search in item title
        const itemMatch = conv.item?.title?.toLowerCase().includes(searchLower)
        
        // Search in last message content
        const messageMatch = conv.lastMessage?.content?.toLowerCase().includes(searchLower)
        
        return participantMatch || itemMatch || messageMatch
      })

      // Apply pagination to filtered results
      const conversations = filteredConversations.slice(skip, skip + parseInt(limit))
      const total = filteredConversations.length

      return res.status(200).json({
        conversations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      })
    }

    // If no search, use the optimized query
    const conversations = await conversationsQuery
    const total = await Conversation.countDocuments(query)

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await Message.countDocuments({ conversation: conv._id })
        return {
          ...conv.toObject(),
          messageCount,
        }
      })
    )

    res.status(200).json({
      conversations: conversationsWithCounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get all conversations error:", error)
    res.status(500).json({ message: "Failed to get conversations" })
  }
}

// Get conversation by ID with all messages
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params

    // Get conversation
    const conversation = await Conversation.findById(id)
      .populate("participants", "name email avatar department studentId")
      .populate("item", "title category images description owner")

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    // Get all messages for this conversation
    const messages = await Message.find({ conversation: id })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })

    // Get conversation statistics
    const messageCount = messages.length
    const participantCount = conversation.participants.length
    const lastActivity = conversation.updatedAt

    res.status(200).json({
      conversation,
      messages,
      stats: {
        messageCount,
        participantCount,
        lastActivity,
      },
    })
  } catch (error) {
    console.error("Get conversation by ID error:", error)
    res.status(500).json({ message: "Failed to get conversation" })
  }
}

// Delete a conversation and all its messages
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params

    // Check if conversation exists
    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    // Delete all messages in this conversation
    await Message.deleteMany({ conversation: id })

    // Delete the conversation
    await Conversation.findByIdAndDelete(id)

    res.status(200).json({
      message: "Conversation and all messages deleted successfully",
      id,
    })
  } catch (error) {
    console.error("Delete conversation error:", error)
    res.status(500).json({ message: "Failed to delete conversation" })
  }
}
