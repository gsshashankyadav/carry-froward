"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Upload, X, Plus, AlertCircle, Loader } from "lucide-react"
import axios from "axios"
import { API_URL, BACKEND_URL, CATEGORIES, ITEM_CONDITIONS } from "../config"

// Default image
const DEFAULT_ITEM_IMAGE = "/images/default-item.png"

const EditItem = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
  })

  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setFetchLoading(true)
        const token = localStorage.getItem("token")
        const response = await axios.get(`${API_URL}/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const item = response.data

        // Check if user is the owner
        if (item.owner._id !== currentUser._id) {
          setError("You can only edit your own items")
          navigate("/dashboard")
          return
        }

        // Check if item is already handed over
        if (item.status === "handed_over") {
          setError("You cannot edit an item that has been handed over")
          navigate(`/items/${id}`)
          return
        }

        // Set form data
        setFormData({
          title: item.title,
          description: item.description,
          category: item.category,
          condition: item.condition,
        })

        // Set existing images
        setExistingImages(
          item.images.map((image) => ({
            path: image,
            url: BACKEND_URL + image,
          })),
        )
      } catch (error) {
        console.error("Error fetching item:", error)
        setError("Failed to load item details")
      } finally {
        setFetchLoading(false)
      }
    }

    fetchItem()
  }, [id, currentUser._id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files)
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length

    if (totalImages > 5) {
      setError("You can upload a maximum of 5 images")
      return
    }

    // Preview images
    const newImagesArray = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }))

    setNewImages((prev) => [...prev, ...newImagesArray])
    setNewImageFiles((prev) => [...prev, ...files])
    setError("")
  }

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index]
    setImagesToDelete((prev) => [...prev, imageToDelete.path])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      // Create form data for file upload
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("description", formData.description)
      formDataObj.append("category", formData.category)
      formDataObj.append("condition", formData.condition)

      // Add images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach((path) => {
          formDataObj.append("imagesToDelete", path)
        })
      }

      // Append each new image file
      newImageFiles.forEach((file) => {
        formDataObj.append("images", file)
      })

      // Update item
      await axios.put(`${API_URL}/items/${id}`, formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess("Item updated successfully")

      // Navigate to item details page after a short delay
      setTimeout(() => {
        navigate(`/items/${id}`)
      }, 1500)
    } catch (err) {
      console.error("Update error:", err)
      setError(err.response?.data?.message || "Failed to update item")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const totalImages = existingImages.length + newImages.length
  const canAddMoreImages = totalImages < 5

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the item, its condition, and any other relevant details"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition *
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select condition</option>
              {ITEM_CONDITIONS.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Images (Max 5)</label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`Item ${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = DEFAULT_ITEM_IMAGE)}
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))}

            {/* New Images */}
            {newImages.map((image, index) => (
              <div key={`new-${index}`} className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`New ${index}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-2 py-1 rounded">New</div>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))}

            {/* Add Image Button */}
            {canAddMoreImages && (
              <label className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <Plus className="h-8 w-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Image</span>
                <input type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" multiple />
              </label>
            )}
          </div>

          <p className="text-xs text-gray-500">
            {totalImages} of 5 images used.{" "}
            {canAddMoreImages ? `You can add ${5 - totalImages} more.` : "Maximum reached."}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/items/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Update Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditItem
