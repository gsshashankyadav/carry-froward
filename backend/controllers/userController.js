import User from "../models/User.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Update user avatar
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    // Find user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete old avatar if exists
    if (user.avatar && !user.avatar.includes("default-avatar")) {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar)
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath)
      }
    }

    // Update avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`
    user.avatar = avatarPath
    await user.save()

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar: avatarPath,
    })
  } catch (error) {
    console.error("Update avatar error:", error)
    res.status(500).json({ message: "Failed to update avatar" })
  }
}
