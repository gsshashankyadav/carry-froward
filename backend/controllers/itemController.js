import Item from "../models/Item.js"
import User from "../models/User.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get all items with filters
export const getItems = async (req, res) => {
  try {
    const { category, status, owner, search } = req.query

    // Build query
    const query = {}

    if (category) {
      query.category = category
    }

    if (status) {
      query.status = status
    } else {
      // By default, only show available items
      query.status = "available"
    }

    if (owner) {
      query.owner = owner
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Get items
    const items = await Item.find(query).populate("owner", "name avatar department").sort({ createdAt: -1 })

    res.status(200).json(items)
  } catch (error) {
    console.error("Get items error:", error)
    res.status(500).json({ message: "Failed to get items" })
  }
}

// Get featured items
export const getFeaturedItems = async (req, res) => {
  try {
    const items = await Item.find({
      isFeatured: true,
      status: "available",
    })
      .populate("owner", "name avatar department")
      .sort({ createdAt: -1 })
      .limit(8)

    res.status(200).json(items)
  } catch (error) {
    console.error("Get featured items error:", error)
    res.status(500).json({ message: "Failed to get featured items" })
  }
}

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params

    const item = await Item.findById(id)
      .populate("owner", "name avatar department studentId")
      .populate("interestedUsers", "name avatar")

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    res.status(200).json(item)
  } catch (error) {
    console.error("Get item by ID error:", error)
    res.status(500).json({ message: "Failed to get item" })
  }
}

// Create a new item
export const createItem = async (req, res) => {
  try {
    console.log("Creating item with body:", req.body)
    console.log("Files received:", req.files)

    const { title, description, category, condition } = req.body
    const userId = req.user._id

    // Handle image uploads
    const images = []

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store the path relative to the server root
        images.push(`/uploads/${file.filename}`)
      })
    }

    // Create item
    const item = new Item({
      title,
      description,
      category,
      condition,
      images,
      owner: userId,
    })

    await item.save()

    // Populate owner details
    await item.populate("owner", "name avatar department")

    res.status(201).json(item)
  } catch (error) {
    console.error("Create item error:", error)
    res.status(500).json({ message: "Failed to create item", error: error.message })
  }
}

// Update an item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category, condition, imagesToDelete } = req.body
    const userId = req.user._id

    console.log("Updating item with body:", req.body)
    console.log("Files received:", req.files)
    console.log("Images to delete:", imagesToDelete)

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Check if user is the owner
    if (item.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own items" })
    }

    // Check if item is already handed over
    if (item.status === "handed_over") {
      return res.status(400).json({ message: "Cannot update an item that has been handed over" })
    }

    // Update item
    item.title = title || item.title
    item.description = description || item.description
    item.category = category || item.category
    item.condition = condition || item.condition
    item.updatedAt = Date.now()

    // Handle image deletions
    let updatedImages = [...item.images]

    if (imagesToDelete) {
      // Convert to array if it's a single value
      const imagesToDeleteArray = Array.isArray(imagesToDelete) ? imagesToDelete : [imagesToDelete]

      // Delete images from filesystem
      imagesToDeleteArray.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
        // Remove from images array
        updatedImages = updatedImages.filter((img) => img !== imagePath)
      })
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Add new images
      req.files.forEach((file) => {
        updatedImages.push(`/uploads/${file.filename}`)
      })
    }

    // Update images array
    item.images = updatedImages

    await item.save()

    // Populate owner details
    await item.populate("owner", "name avatar department")

    res.status(200).json(item)
  } catch (error) {
    console.error("Update item error:", error)
    res.status(500).json({ message: "Failed to update item", error: error.message })
  }
}

// Delete an item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const isAdmin = req.user.role === "admin"

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Check if user is the owner or admin
    if (item.owner.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own items" })
    }

    // Delete images
    item.images.forEach((image) => {
      const imagePath = path.join(__dirname, "..", image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    })

    // Delete item
    await Item.findByIdAndDelete(id)

    res.status(200).json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Delete item error:", error)
    res.status(500).json({ message: "Failed to delete item" })
  }
}

// Express interest in an item
export const expressInterest = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Check if item is available
    if (item.status !== "available") {
      return res.status(400).json({ message: "This item is not available" })
    }

    // Check if user is the owner
    if (item.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot express interest in your own item" })
    }

    // Check if user has already expressed interest
    if (item.interestedUsers.includes(userId)) {
      return res.status(400).json({ message: "You have already expressed interest in this item" })
    }

    // Add user to interested users
    item.interestedUsers.push(userId)
    await item.save()

    res.status(200).json({ message: "Interest expressed successfully" })
  } catch (error) {
    console.error("Express interest error:", error)
    res.status(500).json({ message: "Failed to express interest" })
  }
}

// Mark item as handed over
export const markAsHandedOver = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { receivedBy } = req.body

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Check if user is the owner
    if (item.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only mark your own items as handed over" })
    }

    // Check if item is already handed over
    if (item.status === "handed_over") {
      return res.status(400).json({ message: "This item has already been handed over" })
    }

    // Update item status
    item.status = "handed_over"
    item.handoverDate = Date.now()

    // If receivedBy is provided, set it
    if (receivedBy) {
      // Verify that receivedBy is a valid user
      const receivedByUser = await User.findById(receivedBy)

      if (!receivedByUser) {
        return res.status(404).json({ message: "Recipient user not found" })
      }

      item.receivedBy = receivedBy
    }

    await item.save()

    res.status(200).json({ message: "Item marked as handed over" })
  } catch (error) {
    console.error("Mark as handed over error:", error)
    res.status(500).json({ message: "Failed to mark item as handed over" })
  }
}

// Report an item
export const reportItem = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { reason } = req.body

    // Find item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Check if user has already reported this item
    const hasReported = item.reports.some((report) => report.user.toString() === userId.toString())

    if (hasReported) {
      return res.status(400).json({ message: "You have already reported this item" })
    }

    // Add report
    item.reports.push({
      user: userId,
      reason: reason || "No reason provided",
    })

    await item.save()

    res.status(200).json({ message: "Item reported successfully" })
  } catch (error) {
    console.error("Report item error:", error)
    res.status(500).json({ message: "Failed to report item" })
  }
}
