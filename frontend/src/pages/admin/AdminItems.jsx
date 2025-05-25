"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle, Flag, CheckCircle, X, Star } from "lucide-react"
import axios from "axios"
import { API_URL, CATEGORIES, BACKEND_URL } from "../../config"

const AdminItems = () => {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [reportedOnly, setReportedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchItems()
  }, [categoryFilter, statusFilter, reportedOnly, currentPage])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      let url = reportedOnly
        ? `${API_URL}/admin/reported-items`
        : `${API_URL}/items?page=${currentPage}&limit=${itemsPerPage}`

      if (categoryFilter) {
        url += `&category=${categoryFilter}`
      }

      if (statusFilter) {
        url += `&status=${statusFilter}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(response.data.items || response.data)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.length / itemsPerPage))
    } catch (error) {
      console.error("Error fetching items:", error)
      setError("Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  const handleItemAction = async (itemId, action) => {
    try {
      const token = localStorage.getItem("token")
      let endpoint = ""
      let data = {}

      if (action === "approve" || action === "reject") {
        endpoint = `${API_URL}/admin/items/${itemId}/moderate`
        data = { action }
      } else if (action === "feature") {
        endpoint = `${API_URL}/admin/items/${itemId}/feature`
      } else if (action === "delete") {
        endpoint = `${API_URL}/items/${itemId}`
      }

      if (action === "delete") {
        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.put(endpoint, data, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      if (action === "delete") {
        // Remove item from the list
        setItems((prevItems) => prevItems.filter((item) => item._id !== itemId))
        if (selectedItem && selectedItem._id === itemId) {
          setShowItemModal(false)
        }
      } else {
        // Refresh the items list
        fetchItems()
      }
    } catch (error) {
      console.error(`Error ${action} item:`, error)
      setError(`Failed to ${action} item`)
    }
  }

  const handleViewItem = async (itemId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSelectedItem(response.data)
      setShowItemModal(true)
    } catch (error) {
      console.error("Error fetching item details:", error)
      setError("Failed to load item details")
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = searchTerm
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : items

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Items</h1>
          <p className="text-gray-600">Review and moderate items</p>
        </div>

        <Link to="/admin" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button type="submit" className="absolute right-3 top-2 text-indigo-600 hover:text-indigo-800">
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="handed_over">Handed Over</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={() => setReportedOnly(!reportedOnly)}
              className={`px-3 py-2 border rounded-md ${
                reportedOnly ? "bg-red-100 border-red-300 text-red-800" : "bg-white"
              }`}
            >
              <Flag className={`h-5 w-5 ${reportedOnly ? "text-red-600" : "text-gray-400"}`} />
            </button>

            <button
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("")
                setStatusFilter("")
                setReportedOnly(false)
                setCurrentPage(1)
                fetchItems()
              }}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Owner
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reports
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={item.images[0]? BACKEND_URL+item.images[0] : "/images/default-item.png"}
                              alt={item.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {item.title}
                              {item.isFeatured && <Star className="h-4 w-4 text-amber-500 ml-1" />}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description.substring(0, 50)}
                              {item.description.length > 50 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-6 w-6 rounded-full mr-2"
                            src={item.owner.avatar? BACKEND_URL+item.owner.avatar : "/images/default-avatar.png"}
                            alt={item.owner.name}
                          />
                          <div className="text-sm text-gray-900">{item.owner.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === "available"
                              ? "bg-green-100 text-green-800"
                              : item.status === "handed_over"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.reports && item.reports.length > 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {item.reports.length} reports
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewItem(item._id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleItemAction(item._id, "feature")}
                          className={`mr-3 ${
                            item.isFeatured
                              ? "text-amber-600 hover:text-amber-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {item.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                        {item.reports && item.reports.length > 0 && (
                          <>
                            <button
                              onClick={() => handleItemAction(item._id, "approve")}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleItemAction(item._id, "reject")}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of{" "}
                <span className="font-medium">{filteredItems.length}</span> items
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Item Details Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-6 mb-6">
              <div className="">
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={selectedItem.images[0] ? BACKEND_URL+selectedItem.images[0] : "/placeholder.svg"}
                      alt={selectedItem.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden bg-gray-200 h-64 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}

                {selectedItem.images && selectedItem.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {selectedItem.images.slice(1).map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden h-20">
                        <img
                          src={image? BACKEND_URL+image : "/placeholder.svg"}
                          alt={`${selectedItem.title} ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedItem.title}</h3>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedItem.status === "available"
                          ? "bg-green-100 text-green-800"
                          : selectedItem.status === "handed_over"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedItem.status}
                    </span>
                    {selectedItem.isFeatured && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={selectedItem.owner.avatar ? BACKEND_URL+selectedItem.owner.avatar : "/images/default-avatar.png"}
                      alt={selectedItem.owner.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700">{selectedItem.owner.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium capitalize">{selectedItem.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Condition</p>
                      <p className="font-medium capitalize">{selectedItem.condition}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-medium">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Interested Users</p>
                      <p className="font-medium">{selectedItem.interestedUsers.length}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedItem.description}</p>
                  </div>

                  {selectedItem.reports && selectedItem.reports.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Reports ({selectedItem.reports.length})</p>
                      <div className="bg-red-50 p-3 rounded-md">
                        {selectedItem.reports.map((report, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Reason:</span> {report.reason}
                            </p>
                            <p className="text-xs text-gray-600">
                              Reported on {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => handleItemAction(selectedItem._id, "feature")}
                  className={`px-4 py-2 rounded-md ${
                    selectedItem.isFeatured
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                >
                  {selectedItem.isFeatured ? "Unfeature" : "Feature"}
                </button>

                {selectedItem.reports && selectedItem.reports.length > 0 && (
                  <>
                    <button
                      onClick={() => handleItemAction(selectedItem._id, "approve")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-5 w-5 mr-1 inline-block" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleItemAction(selectedItem._id, "reject")}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <X className="h-5 w-5 mr-1 inline-block" />
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
                      handleItemAction(selectedItem._id, "delete")
                    }
                  }}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                >
                  Delete
                </button>

                <button
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminItems
