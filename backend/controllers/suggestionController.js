import Suggestion from "../models/Suggestion.js"

// Get all suggestions
export const getSuggestions = async (req, res) => {
  try {
    const { sort, author } = req.query

    // Build query
    const query = { isApproved: true }

    if (author) {
      query.author = author
    }

    // Determine sort order
    let sortOption = { createdAt: -1 } // Default: latest first

    if (sort === "popular") {
      sortOption = { "votes.length": -1, createdAt: -1 }
    }

    // Get suggestions
    const suggestions = await Suggestion.find(query)
      .populate("author", "name avatar department")
      .populate("comments.author", "name avatar")
      .sort(sortOption)

    res.status(200).json(suggestions)
  } catch (error) {
    console.error("Get suggestions error:", error)
    res.status(500).json({ message: "Failed to get suggestions" })
  }
}

// Get suggestion by ID
export const getSuggestionById = async (req, res) => {
  try {
    const { id } = req.params

    const suggestion = await Suggestion.findById(id)
      .populate("author", "name avatar department")
      .populate("comments.author", "name avatar")

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    res.status(200).json(suggestion)
  } catch (error) {
    console.error("Get suggestion by ID error:", error)
    res.status(500).json({ message: "Failed to get suggestion" })
  }
}

// Create a new suggestion
export const createSuggestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body
    const userId = req.user._id

    // Create suggestion
    const suggestion = new Suggestion({
      title,
      content,
      author: userId,
      tags: tags || [],
    })

    await suggestion.save()

    // Populate author details
    await suggestion.populate("author", "name avatar department")

    res.status(201).json(suggestion)
  } catch (error) {
    console.error("Create suggestion error:", error)
    res.status(500).json({ message: "Failed to create suggestion" })
  }
}

// Update a suggestion
export const updateSuggestion = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, tags } = req.body
    const userId = req.user._id

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if user is the author
    if (suggestion.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own suggestions" })
    }

    // Update suggestion
    suggestion.title = title || suggestion.title
    suggestion.content = content || suggestion.content
    suggestion.tags = tags || suggestion.tags
    suggestion.updatedAt = Date.now()

    await suggestion.save()

    // Populate author details
    await suggestion.populate("author", "name avatar department")

    res.status(200).json(suggestion)
  } catch (error) {
    console.error("Update suggestion error:", error)
    res.status(500).json({ message: "Failed to update suggestion" })
  }
}

// Delete a suggestion
export const deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const isAdmin = req.user.role === "admin"

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if user is the author or admin
    if (suggestion.author.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own suggestions" })
    }

    // Delete suggestion
    await Suggestion.findByIdAndDelete(id)

    res.status(200).json({ message: "Suggestion deleted successfully" })
  } catch (error) {
    console.error("Delete suggestion error:", error)
    res.status(500).json({ message: "Failed to delete suggestion" })
  }
}

// Vote on a suggestion
export const voteSuggestion = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if user has already voted
    const hasVoted = suggestion.votes.some((vote) => vote.user.toString() === userId.toString())

    if (hasVoted) {
      // Remove vote
      suggestion.votes = suggestion.votes.filter((vote) => vote.user.toString() !== userId.toString())
    } else {
      // Add vote
      suggestion.votes.push({
        user: userId,
        createdAt: Date.now(),
      })
    }

    await suggestion.save()

    res.status(200).json({
      message: hasVoted ? "Vote removed" : "Vote added",
      voteCount: suggestion.votes.length,
    })
  } catch (error) {
    console.error("Vote suggestion error:", error)
    res.status(500).json({ message: "Failed to vote on suggestion" })
  }
}

// Add a comment to a suggestion
export const addComment = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const userId = req.user._id

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" })
    }

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Add comment
    const comment = {
      author: userId,
      content,
      createdAt: Date.now(),
    }

    suggestion.comments.push(comment)
    await suggestion.save()

    // Get the added comment with author details
    const populatedSuggestion = await Suggestion.findById(id).populate("comments.author", "name avatar")

    const addedComment = populatedSuggestion.comments[populatedSuggestion.comments.length - 1]

    res.status(201).json(addedComment)
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({ message: "Failed to add comment" })
  }
}

// Report a suggestion
export const reportSuggestion = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { reason } = req.body

    // Find suggestion
    const suggestion = await Suggestion.findById(id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if user has already reported this suggestion
    const hasReported = suggestion.reports.some((report) => report.user.toString() === userId.toString())

    if (hasReported) {
      return res.status(400).json({ message: "You have already reported this suggestion" })
    }

    // Add report
    suggestion.reports.push({
      user: userId,
      reason: reason || "No reason provided",
    })

    await suggestion.save()

    res.status(200).json({ message: "Suggestion reported successfully" })
  } catch (error) {
    console.error("Report suggestion error:", error)
    res.status(500).json({ message: "Failed to report suggestion" })
  }
}
