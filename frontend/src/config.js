// API URL from environment or default
export const API_URL = import.meta.env.VITE_BACKEND_URL+"/api" || "http://localhost:5000/api"

// Backend URL for static files (images, etc.)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

// Categories for items
export const CATEGORIES = [
  { id: "textbooks", name: "Textbooks" },
  { id: "electronics", name: "Electronics" },
  { id: "furniture", name: "Furniture" },
  { id: "clothing", name: "Clothing" },
  { id: "kitchenware", name: "Kitchenware" },
  { id: "stationery", name: "Stationery" },
  { id: "sports", name: "Sports Equipment" },
  { id: "other", name: "Other" },
]

// Conditions for items
export const ITEM_CONDITIONS = [
  { id: "new", name: "New" },
  { id: "likeNew", name: "Like New" },
  { id: "good", name: "Good" },
  { id: "fair", name: "Fair" },
  { id: "poor", name: "Poor" },
]