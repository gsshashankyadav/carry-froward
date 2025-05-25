import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

// Load environment variables
dotenv.config()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import models
import User from "../models/User.js"
import Item from "../models/Item.js"
import Suggestion from "../models/Suggestion.js"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    seedDatabase()
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

// Sample data
const users = [
  {
    name: "Admin User",
    email: "carryforward@mmglobus.in",
    password: "admin123",
    role: "admin",
    isVerified: true,
  },
  {
    name: "Shashank Yadav",
    email: "shashank@mmglobus.in",
    password: "password123",
    studentId: "ST12345",
    department: "Computer Science",
    isVerified: true,
  },
  {
    name: "Kid Sencho",
    email: "kid@mmglobus.in",
    password: "password123",
    studentId: "ST67890",
    department: "Engineering",
    isVerified: true,
  },
  {
    name: "Bob Johnson",
    email: "bob@mmglobus.in",
    password: "password123",
    studentId: "ST24680",
    department: "Business",
    isVerified: true,
  },
  {
    name: "Alice Williams",
    email: "alice@mmglobus.in",
    password: "password123",
    studentId: "ST13579",
    department: "Arts",
    isVerified: true,
  },
]

const categories = ["textbooks", "electronics", "furniture", "clothing", "kitchenware" ,"stationery","sports", "others"]
const conditions = ["new", "likeNew", "good", "fair", "poor"]

const itemTitles = [
  "Calculus Textbook",
  "Physics Lab Equipment",
  "Notebook Set",
  "Graphing Calculator",
  "Desk Lamp",
  "Backpack",
  "Laptop Stand",
  "Engineering Drafting Tools",
  "Chemistry Reference Book",
  "Wireless Mouse",
  "Desk Organizer",
  "USB Flash Drive",
  "Portable Charger",
  "Whiteboard",
  "Ergonomic Chair",
]

const suggestionTitles = [
  "Book Exchange Event",
  "End of Semester Donation Drive",
  "Create a Mobile App",
  "Partner with Local Businesses",
  "Add Rating System for Users",
  "Organize Campus Cleanup",
  "Start a Mentorship Program",
  "Add Delivery Options",
  "Create Category for Class Notes",
  "Host Virtual Workshops",
]

// Seed database
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Item.deleteMany({})
    await Suggestion.deleteMany({})
    await Conversation.deleteMany({})
    await Message.deleteMany({})

    console.log("Cleared existing data")

    // Create upload directories if they don't exist
    const uploadDirs = ["uploads", "uploads/avatars", "uploads/items"]
    uploadDirs.forEach((dir) => {
      const dirPath = path.join(__dirname, "..", dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
    })

    // Create users
    const createdUsers = []
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userData.password, salt)

      const user = new User({
        ...userData,
        password: hashedPassword,
      })

      const savedUser = await user.save()
      createdUsers.push(savedUser)
    }

    console.log(`Created ${createdUsers.length} users`)

    // Create items
    const createdItems = []
    for (let i = 0; i < 20; i++) {
      const randomUserIndex = Math.floor(Math.random() * (createdUsers.length - 1)) + 1 // Skip admin
      const randomUser = createdUsers[randomUserIndex]
      const randomTitleIndex = Math.floor(Math.random() * itemTitles.length)
      const randomCategoryIndex = Math.floor(Math.random() * categories.length)
      const randomConditionIndex = Math.floor(Math.random() * conditions.length)

      const item = new Item({
        title: itemTitles[randomTitleIndex],
        description: `This is a ${conditions[randomConditionIndex]} condition ${
          categories[randomCategoryIndex]
        } item available for sharing. Contact me if you're interested!`,
        category: categories[randomCategoryIndex],
        condition: conditions[randomConditionIndex],
        owner: randomUser._id,
        status: Math.random() > 0.8 ? "handed_over" : "available", // 20% chance of being handed over
        isFeatured: Math.random() > 0.8, // 20% chance of being featured
      })

      if (item.status === "handed_over") {
        const randomRecipientIndex = Math.floor(Math.random() * (createdUsers.length - 1)) + 1
        if (randomRecipientIndex !== randomUserIndex) {
          item.receivedBy = createdUsers[randomRecipientIndex]._id
          item.handoverDate = new Date()
        }
      }

      const savedItem = await item.save()
      createdItems.push(savedItem)
    }

    console.log(`Created ${createdItems.length} items`)

    // Create suggestions
    const createdSuggestions = []
    for (let i = 0; i < suggestionTitles.length; i++) {
      const randomUserIndex = Math.floor(Math.random() * (createdUsers.length - 1)) + 1 // Skip admin
      const randomUser = createdUsers[randomUserIndex]

      const suggestion = new Suggestion({
        title: suggestionTitles[i],
        content: `This is a suggestion for improving the platform. ${suggestionTitles[i]} would help students share resources more effectively.`,
        author: randomUser._id,
        tags: ["improvement", "community", "sharing"],
      })

      // Add random votes
      const numVotes = Math.floor(Math.random() * 5)
      for (let j = 0; j < numVotes; j++) {
        const voterIndex = Math.floor(Math.random() * (createdUsers.length - 1)) + 1
        if (!suggestion.votes.some((vote) => vote.user.toString() === createdUsers[voterIndex]._id.toString())) {
          suggestion.votes.push({
            user: createdUsers[voterIndex]._id,
            createdAt: new Date(),
          })
        }
      }

      // Add random comments
      const numComments = Math.floor(Math.random() * 3)
      for (let j = 0; j < numComments; j++) {
        const commenterIndex = Math.floor(Math.random() * (createdUsers.length - 1)) + 1
        suggestion.comments.push({
          author: createdUsers[commenterIndex]._id,
          content: `This is a great idea! I would love to see ${suggestionTitles[i]} implemented.`,
          createdAt: new Date(),
        })
      }

      const savedSuggestion = await suggestion.save()
      createdSuggestions.push(savedSuggestion)
    }

    console.log(`Created ${createdSuggestions.length} suggestions`)

    // Create conversations and messages
    const createdConversations = []
    for (let i = 0; i < 10; i++) {
      const randomUserIndex1 = Math.floor(Math.random() * (createdUsers.length - 1)) + 1
      let randomUserIndex2 = Math.floor(Math.random() * (createdUsers.length - 1)) + 1

      // Make sure we don't create a conversation with the same user
      while (randomUserIndex2 === randomUserIndex1) {
        randomUserIndex2 = Math.floor(Math.random() * (createdUsers.length - 1)) + 1
      }

      const randomItemIndex = Math.floor(Math.random() * createdItems.length)

      const conversation = new Conversation({
        participants: [createdUsers[randomUserIndex1]._id, createdUsers[randomUserIndex2]._id],
        item: createdItems[randomItemIndex]._id,
        unreadCounts: [
          { user: createdUsers[randomUserIndex1]._id, count: 0 },
          { user: createdUsers[randomUserIndex2]._id, count: 0 },
        ],
      })

      const savedConversation = await conversation.save()

      // Create messages for this conversation
      const numMessages = Math.floor(Math.random() * 5) + 2 // At least 2 messages
      let lastMessage = null

      for (let j = 0; j < numMessages; j++) {
        const senderIndex = j % 2 === 0 ? randomUserIndex1 : randomUserIndex2
        const sender = createdUsers[senderIndex]

        const message = new Message({
          conversation: savedConversation._id,
          sender: sender._id,
          content: `Message ${j + 1}: Hi there! I'm interested in the ${createdItems[randomItemIndex].title}.`,
          isRead: true,
          readBy: [sender._id],
          createdAt: new Date(Date.now() - (numMessages - j) * 60000), // Stagger message times
        })

        const savedMessage = await message.save()
        lastMessage = savedMessage
      }

      // Update conversation with last message
      if (lastMessage) {
        savedConversation.lastMessage = {
          sender: lastMessage.sender,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
        }
        await savedConversation.save()
      }

      createdConversations.push(savedConversation)
    }

    console.log(`Created ${createdConversations.length} conversations`)

    console.log("Database seeded successfully!")
    console.log("\nAdmin credentials:")
    console.log("Email: admin@example.com")
    console.log("Password: admin123")
    console.log("\nSample user credentials:")
    console.log("Email: john@example.com")
    console.log("Password: password123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}
