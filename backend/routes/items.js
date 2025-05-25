import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"
import { authenticate } from "../middleware/auth.js"
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  expressInterest,
  markAsHandedOver,
  reportItem,
  getFeaturedItems,
} from "../controllers/itemController.js"

const router = express.Router()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4()
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
})

// Routes
router.get("/", getItems)
router.get("/featured", getFeaturedItems)
router.get("/:id", getItemById)
router.post("/", authenticate, upload.array("images", 5), createItem)
router.put("/:id", authenticate, upload.array("images", 5), updateItem)
router.delete("/:id", authenticate, deleteItem)
router.post("/:id/interest", authenticate, expressInterest)
router.post("/:id/handover", authenticate, markAsHandedOver)
router.post("/:id/report", authenticate, reportItem)

export default router
