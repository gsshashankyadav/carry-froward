"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Filter, Search, Grid, List } from "lucide-react"
import axios from "axios"
import { API_URL, CATEGORIES, BACKEND_URL } from "../config"
import ItemCard from "../components/ItemCard"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [myItems, setMyItems] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [selectedCategory, myItems])

  const fetchItems = async () => {
    try {
      setLoading(true)

      let url = `${API_URL}/items`
      const params = new URLSearchParams()

      if (selectedCategory) {
        params.append("category", selectedCategory)
      }

      if (myItems) {
        params.append("owner", currentUser._id)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(response.data)
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      fetchItems()
      return
    }

    const filteredItems = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setItems(filteredItems)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setMyItems(false)
    fetchItems()
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
          <p className="text-gray-600">Find books, equipment, and other resources shared by fellow students.</p>
        </div>

        <Link
          to="/upload"
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Item
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
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

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setMyItems(!myItems)}
              className={`px-3 py-2 border rounded-md ${
                myItems ? "bg-indigo-100 border-indigo-300 text-indigo-800" : "bg-white"
              }`}
            >
              My Items
            </button>

            <button onClick={resetFilters} className="px-3 py-2 border rounded-md hover:bg-gray-50">
              Reset
            </button>

            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 ${viewMode === "grid" ? "bg-gray-100" : "bg-white"}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${viewMode === "list" ? "bg-gray-100" : "bg-white"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {myItems ? "You haven't uploaded any items yet." : "No items match your current filters."}
          </p>
          {myItems && (
            <Link
              to="/upload"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Item
            </Link>
          )}
          {!myItems && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredItems.map((item) =>
            viewMode === "grid" ? (
              <ItemCard key={item._id} item={item} />
            ) : (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden flex">
                <div className="w-1/4">
                  <img
                    src={item.images[0]? BACKEND_URL+item.images[0] : "/images/default-item.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <img
                        src={item.owner.avatar ? BACKEND_URL+item.owner.avatar:"/images/default-avatar.png"}
                        alt={item.owner.name}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                      <span className="text-xs text-gray-600">{item.owner.name}</span>
                    </div>

                    <Link
                      to={`/items/${item._id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
