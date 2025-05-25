import jwt from "jsonwebtoken"
import User from "../models/User.js"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js"


// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password,department,studentId } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user
    const user = new User({
      name,
      email,
      password,
      department,
      studentId,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    })

    await user.save()

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`

    // In a production environment, you would use a proper email service
    // console.log(`Verification URL: ${verificationUrl}`)
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `
        <h3>Hi ${name},</h3>
        <p>Thanks for registering! Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    })


    // For development, we'll just return the token in the response
    // Generate JWT token (even though not verified yet, allows login flow testing)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
     // verificationUrl, // Remove this in production
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Registration failed" })
  }
}

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" })
    }

    // Update user
    user.isVerified = true
    user.verificationToken = null
    user.verificationTokenExpires = null
    await user.save()

    res.status(200).json({ message: "Email verified successfully. You can now log in." })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).json({ message: "Email verification failed" })
  }
}

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Update user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpires
    await user.save()

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // In a production environment, you would use a proper email service
    console.log(`Reset URL: ${resetUrl}`)
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <h3>Hi ${user.name},</h3>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    })


    res.status(200).json({
      message: "Password reset link sent to your email",
      //resetUrl, // Remove this in production
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Failed to process forgot password request" })
  }
}

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // Update password
    user.password = password
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Failed to reset password" })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" })
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(200).json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed" })
  }
}

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Failed to get user data" })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, department, studentId } = req.body
    const userId = req.user._id

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        department,
        studentId,
        updatedAt: Date.now(),
      },
      { new: true },
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser.toJSON(),
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Failed to update profile" })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user._id

    // Find user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Update password
    user.password = newPassword
    user.updatedAt = Date.now()
    await user.save()

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Failed to change password" })
  }
}
