"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import { ChevronLeft, ChevronRight, MessageCircle, Flag, Calendar, Tag, CheckCircle, AlertTriangle } from "lucide-react"
import axios from "axios"
import { API_URL, BACKEND_URL } from "../config"
import { formatDistanceToNow } from "date-fns"

// Default images
const DEFAULT_ITEM_IMAGE = "/images/default-item.png"
const DEFAULT_AVATAR = "/images/default-avatar.png"

const ItemDetails = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { startConversation } = useChat()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInterested, setIsInterested] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItem(response.data)

      // Check if user has already expressed interest
      setIsInterested(response.data.interestedUsers.includes(currentUser._id))
    } catch (error) {
      console.error("Error fetching item:", error)
      setError("Failed to load item details")
    } finally {
      setLoading(false)
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1))
  }

  const handleExpressInterest = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/items/${id}/interest`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setIsInterested(true)
      fetchItem() // Refresh item data
    } catch (error) {
      console.error("Error expressing interest:", error)
    }
  }

  const handleStartChat = async () => {
    try {
      const conversation = await startConversation(item.owner._id, item._id)
      navigate(`/chat/${conversation._id}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  const handleReportItem = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/items/${id}/report`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      alert("Item reported successfully. Our moderators will review it.")
    } catch (error) {
      console.error("Error reporting item:", error)
    }
  }

  const handleConfirmHandover = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/items/${id}/handover`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setShowConfirmation(false)
      fetchItem() // Refresh item data
    } catch (error) {
      console.error("Error confirming handover:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Item</h2>
        <p className="text-gray-600 mb-4">{error || "Item not found"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const isOwner = item.owner._id === currentUser._id
  const isHandedOver = item.status === "handed_over"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 relative">
            {item.images && item.images.length > 0 ? (
              <>
                <img
                  src={
                    item.images[currentImageIndex] ? BACKEND_URL + item.images[currentImageIndex] : DEFAULT_ITEM_IMAGE
                  }
                  alt={item.title}
                  className="w-full h-96 object-cover"
                  onError={(e) => (e.target.src = DEFAULT_ITEM_IMAGE)}
                />

                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {item.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            index === currentImageIndex ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <img
                src={DEFAULT_ITEM_IMAGE || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            )}
          </div>

          {/* Item Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isHandedOver ? "bg-green-100 text-green-800" : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {isHandedOver ? "Handed Over" : "Available"}
              </span>
            </div>

            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-600">
                Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center mb-6">
              <Tag className="h-5 w-5 text-gray-500 mr-2" />
              <span className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                {item.category}
              </span>
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {item.condition}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{item.description}</p>
            </div>

            <div className="flex items-center mb-6">
              <img
                src={item.owner.avatar ? BACKEND_URL + item.owner.avatar : DEFAULT_AVATAR}
                alt={item.owner.name}
                className="h-10 w-10 rounded-full mr-3"
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              />
              <div>
                <p className="font-medium">{item.owner.name}</p>
                <p className="text-sm text-gray-600">{item.owner.department}</p>
              </div>
            </div>

            {!isHandedOver && (
              <div className="flex flex-wrap gap-3">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => setShowConfirmation(true)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Handed Over
                    </button>

                    <button
                      onClick={() => navigate(`/edit-item/${item._id}`)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Edit Item
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStartChat}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      disabled={isHandedOver}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Chat with Owner
                    </button>

                    <button
                      onClick={handleExpressInterest}
                      className={`flex-1 flex items-center justify-center px-4 py-2 ${
                        isInterested
                          ? "bg-gray-100 text-gray-800 border border-gray-300"
                          : "bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200"
                      } rounded-md`}
                      disabled={isInterested || isHandedOver}
                    >
                      {isInterested ? "Interested" : "Express Interest"}
                    </button>

                    <button
                      onClick={handleReportItem}
                      className="flex items-center px-4 py-2 text-red-600 hover:text-red-800"
                    >
                      <Flag className="h-5 w-5 mr-1" />
                      Report
                    </button>
                  </>
                )}
              </div>
            )}

            {isHandedOver && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">This item has been handed over to another student.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handover Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Handover</h3>
            <p className="mb-6">
              Are you sure you want to mark this item as handed over? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemDetails
