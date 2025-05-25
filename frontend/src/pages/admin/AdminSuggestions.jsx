"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { API_URL, BACKEND_URL } from "../../config"
import { useAuth } from "../../contexts/AuthContext"

const DEFAULT_AVATAR = "/images/default-avatar.png"

const AdminSuggestions = () => {
  const { currentUser } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // all, reported, featured
  const [status, setStatus] = useState("all") // all, open, in_progress, implemented, closed
  const [sort, setSort] = useState("newest") // newest, oldest, most_votes
  const [search, setSearch] = useState("")
  const [expandedSuggestion, setExpandedSuggestion] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch suggestions based on filters
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)

        // Get token from localStorage
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("Authentication token not found")
        }

        let url = `${API_URL}/admin/suggestions?`

        // Add filters
        if (filter === "reported") {
          url += "type=reported&"
        }
        if (filter === "featured") {
          url += "featured=true&"
        }
        if (status !== "all") {
          url += `status=${status}&`
        }
        if (sort) {
          url += `sort=${sort}&`
        }
        if (search) {
          url += `search=${encodeURIComponent(search)}&`
        }

        console.log("Fetching suggestions from:", url)
        console.log("Using token:", token.substring(0, 10) + "...")

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.")
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch suggestions")
        }

        const data = await response.json()
        console.log("Suggestions data:", data)

        // Check if data has the expected structure
        if (data.suggestions) {
          setSuggestions(data.suggestions)
        } else {
          // If data is an array, use it directly
          setSuggestions(Array.isArray(data) ? data : [])
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching suggestions:", err)
        setError(err.message || "Failed to load suggestions. Please try again.")
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [filter, status, sort, search])

  // Toggle suggestion details
  const toggleSuggestionDetails = (id) => {
    if (expandedSuggestion === id) {
      setExpandedSuggestion(null)
    } else {
      setExpandedSuggestion(id)
    }
  }

  // Handle moderation action
  const handleModerateAction = async (id, action) => {
    try {
      setActionLoading(true)

      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_URL}/admin/suggestions/${id}/moderate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} suggestion`)
      }

      // Update the suggestion in the list
      const updatedSuggestions = suggestions.map((suggestion) => {
        if (suggestion._id === id) {
          return {
            ...suggestion,
            isApproved: action === "approve",
            reports: action === "approve" ? [] : suggestion.reports,
          }
        }
        return suggestion
      })

      setSuggestions(updatedSuggestions)
      setSuccessMessage(`Suggestion ${action === "approve" ? "approved" : "rejected"} successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error(`Error ${action}ing suggestion:`, err)
      setError(err.message || `Failed to ${action} suggestion. Please try again.`)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setActionLoading(true)

      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_URL}/admin/suggestions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update suggestion status")
      }

      // Update the suggestion in the list
      const updatedSuggestions = suggestions.map((suggestion) => {
        if (suggestion._id === id) {
          return {
            ...suggestion,
            status: newStatus,
          }
        }
        return suggestion
      })

      setSuggestions(updatedSuggestions)
      setSuccessMessage("Suggestion status updated successfully")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating suggestion status:", err)
      setError(err.message || "Failed to update suggestion status. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle toggle feature
  const handleToggleFeature = async (id, currentFeatured) => {
    try {
      setActionLoading(true)

      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_URL}/admin/suggestions/${id}/feature`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to toggle feature status")
      }

      // Update the suggestion in the list
      const updatedSuggestions = suggestions.map((suggestion) => {
        if (suggestion._id === id) {
          return {
            ...suggestion,
            isFeatured: !currentFeatured,
          }
        }
        return suggestion
      })

      setSuggestions(updatedSuggestions)
      setSuccessMessage(`Suggestion ${currentFeatured ? "unfeatured" : "featured"} successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error toggling feature status:", err)
      setError(err.message || "Failed to toggle feature status. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "implemented":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Check if user is not admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Access denied. You need admin privileges to view this page.</p>
          <Link to="/" className="underline">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Suggestions</h1>
        <Link to="/admin" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
          Back to Dashboard
        </Link>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suggestions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filter */}
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Suggestions</option>
              <option value="reported">Reported</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="implemented">Implemented</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_votes">Most Votes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No suggestions found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Suggestion Header */}
              <div
                className={`p-4 cursor-pointer ${
                  suggestion.reports && suggestion.reports.length > 0
                    ? "bg-red-50"
                    : suggestion.isFeatured
                      ? "bg-yellow-50"
                      : ""
                }`}
                onClick={() => toggleSuggestionDetails(suggestion._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    {/* Author Avatar */}
                    <img
                      src={
                        suggestion.author && suggestion.author.avatar
                          ? BACKEND_URL + suggestion.author.avatar
                          : DEFAULT_AVATAR
                      }
                      alt={suggestion.author ? suggestion.author.name : "User"}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                    />

                    {/* Suggestion Info */}
                    <div>
                      <h3 className="font-bold text-lg">{suggestion.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>By {suggestion.author ? suggestion.author.name : "Unknown User"}</span>
                        <span>•</span>
                        <span>{formatDate(suggestion.createdAt)}</span>
                      </div>

                      {/* Tags */}
                      {suggestion.tags && suggestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {suggestion.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status and Indicators */}
                  <div className="flex flex-col items-end space-y-2">
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(suggestion.status)}`}
                    >
                      {suggestion.status ? suggestion.status.replace("_", " ") : "open"}
                    </span>

                    {/* Indicators */}
                    <div className="flex items-center space-x-2">
                      {/* Votes */}
                      <span className="flex items-center text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        {suggestion.votes ? suggestion.votes.length : 0}
                      </span>

                      {/* Comments */}
                      <span className="flex items-center text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        {suggestion.comments ? suggestion.comments.length : 0}
                      </span>

                      {/* Reports */}
                      {suggestion.reports && suggestion.reports.length > 0 && (
                        <span className="flex items-center text-sm text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          {suggestion.reports.length}
                        </span>
                      )}

                      {/* Featured */}
                      {suggestion.isFeatured && (
                        <span className="flex items-center text-sm text-yellow-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSuggestion === suggestion._id && (
                <div className="p-4 border-t border-gray-200">
                  {/* Content */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Content</h4>
                    <p className="text-gray-600 whitespace-pre-line">{suggestion.content}</p>
                  </div>

                  {/* Reports Section */}
                  {suggestion.reports && suggestion.reports.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Reports ({suggestion.reports.length})</h4>
                      <div className="bg-red-50 p-3 rounded-md">
                        {suggestion.reports.map((report, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{report.user ? report.user.name : "Anonymous"}:</span>{" "}
                                  {report.reason}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  {suggestion.comments && suggestion.comments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Comments ({suggestion.comments.length})</h4>
                      <div className="space-y-3">
                        {suggestion.comments.map((comment, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-start">
                              <img
                                src={
                                  comment.author && comment.author.avatar
                                    ? BACKEND_URL + comment.author.avatar
                                    : DEFAULT_AVATAR
                                }
                                alt={comment.author ? comment.author.name : "User"}
                                className="w-8 h-8 rounded-full object-cover mr-3"
                                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                              />
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {comment.author ? comment.author.name : "Anonymous"}
                                  </span>
                                </p>
                                <p className="text-sm">{comment.content}</p>
                                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Moderation Actions */}
                    {!suggestion.isApproved ? (
                      <button
                        onClick={() => handleModerateAction(suggestion._id, "approve")}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerateAction(suggestion._id, "reject")}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}

                    {/* Feature Toggle */}
                    <button
                      onClick={() => handleToggleFeature(suggestion._id, suggestion.isFeatured)}
                      disabled={actionLoading}
                      className={`px-3 py-1 rounded-md transition-colors disabled:opacity-50 ${
                        suggestion.isFeatured
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }`}
                    >
                      {suggestion.isFeatured ? "Unfeature" : "Feature"}
                    </button>

                    {/* Status Update */}
                    <select
                      value={suggestion.status || "open"}
                      onChange={(e) => handleStatusUpdate(suggestion._id, e.target.value)}
                      disabled={actionLoading}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="implemented">Implemented</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminSuggestions
