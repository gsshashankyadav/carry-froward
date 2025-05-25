"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Users, Package, MessageSquare, Flag, AlertTriangle, CheckCircle } from "lucide-react"
import axios from "axios"
import { API_URL, BACKEND_URL } from "../../config"

// Default images
const DEFAULT_AVATAR = "/images/default-avatar.png"
const DEFAULT_ITEM_IMAGE = "/images/default-item.png"

const AdminDashboard = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, items, and platform activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.counts.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Items Shared</h3>
              <p className="text-3xl font-bold text-emerald-600">{stats.counts.items}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Handed Over</h3>
              <p className="text-3xl font-bold text-green-600">{stats.counts.handedOver}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Suggestions</h3>
              <p className="text-3xl font-bold text-amber-600">{stats.counts.suggestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reported Items</h3>
            <Link to="/admin/items" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              View All
            </Link>
          </div>

          {stats.counts.reportedItems > 0 ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <Flag className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <p className="text-red-700 font-medium">
                    {stats.counts.reportedItems} item{stats.counts.reportedItems !== 1 ? "s" : ""} reported
                  </p>
                  <p className="text-red-600 text-sm">These items require moderation</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">No reported items to moderate</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reported Suggestions</h3>
            <Link to="/admin/suggestions" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              View All
            </Link>
          </div>

          {stats.counts.reportedSuggestions > 0 ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <Flag className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <p className="text-red-700 font-medium">
                    {stats.counts.reportedSuggestions} suggestion{stats.counts.reportedSuggestions !== 1 ? "s" : ""}{" "}
                    reported
                  </p>
                  <p className="text-red-600 text-sm">These suggestions require moderation</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">No reported suggestions to moderate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h3>

          <div className="space-y-4">
            {stats.recentActivity.items.map((item) => (
              <div key={item._id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="h-12 w-12 rounded-md overflow-hidden mr-3">
                  <img
                    src={item.images && item.images[0] ? `${BACKEND_URL}${item.images[0]}` : DEFAULT_ITEM_IMAGE}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.target.src = DEFAULT_ITEM_IMAGE)}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "available"
                          ? "bg-green-100 text-green-800"
                          : item.status === "handed_over"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <img
                      src={item.owner.avatar ? `${BACKEND_URL}${item.owner.avatar}` : DEFAULT_AVATAR}
                      alt={item.owner.name}
                      className="h-4 w-4 rounded-full mr-1"
                      onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                    />
                    <span>{item.owner.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Suggestions</h3>

          <div className="space-y-4">
            {stats.recentActivity.suggestions.map((suggestion) => (
              <div key={suggestion._id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                    src={suggestion.author.avatar ? `${BACKEND_URL}${suggestion.author.avatar}` : DEFAULT_AVATAR}
                    alt={suggestion.author.name}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1">{suggestion.content}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{suggestion.author.name}</span>
                    <span className="mx-1">•</span>
                    <span>{suggestion.votes.length} votes</span>
                    <span className="mx-1">•</span>
                    <span>{suggestion.comments.length} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.categoryDistribution.map((category) => (
            <div key={category._id} className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 capitalize">{category._id}</h4>
              <div className="flex items-center mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{
                      width: `${(category.count / stats.counts.items) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
        >
          <div className="bg-indigo-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
            <p className="text-gray-600">View and manage user accounts</p>
          </div>
        </Link>

        <Link
          to="/admin/items"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
        >
          <div className="bg-emerald-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Manage Items</h3>
            <p className="text-gray-600">Review and moderate items</p>
          </div>
        </Link>

        <Link
          to="/admin/conversations"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
        >
          <div className="bg-amber-100 p-3 rounded-full">
            <MessageSquare className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Monitor Chats</h3>
            <p className="text-gray-600">View chat activity and reports</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
