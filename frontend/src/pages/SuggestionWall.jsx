"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Tag, X } from "lucide-react"
import axios from "axios"
import { API_URL } from "../config"
import SuggestionCard from "../components/SuggestionCard"

const SuggestionWall = () => {
  const { currentUser } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("latest") // 'latest', 'popular', 'my'

  useEffect(() => {
    fetchSuggestions()
  }, [filter])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)

      let url = `${API_URL}/suggestions`
      if (filter === "popular") {
        url += "?sort=popular"
      } else if (filter === "my" && currentUser) {
        url += `?author=${currentUser._id}`
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuggestions(response.data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (!tagInput.trim() || formData.tags.includes(tagInput.trim())) return

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()],
    }))
    setTagInput("")
  }

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(`${API_URL}/suggestions`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuggestions((prev) => [response.data, ...prev])
      setFormData({ title: "", content: "", tags: [] })
      setShowForm(false)
    } catch (error) {
      console.error("Error creating suggestion:", error)
    }
  }

  const handleVote = (suggestionId) => {
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion._id === suggestionId
          ? {
              ...suggestion,
              votes: suggestion.votes.some((vote) => vote.user === currentUser._id)
                ? suggestion.votes.filter((vote) => vote.user !== currentUser._id)
                : [...suggestion.votes, { user: currentUser._id }],
            }
          : suggestion,
      ),
    )
  }

  const handleAddComment = (suggestionId, comment) => {
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion._id === suggestionId
          ? {
              ...suggestion,
              comments: [...suggestion.comments, comment],
            }
          : suggestion,
      ),
    )
  }

  const filteredSuggestions = searchTerm
    ? suggestions.filter(
        (suggestion) =>
          suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suggestion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suggestion.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : suggestions

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suggestion Wall</h1>
          <p className="text-gray-600">Share ideas and campaigns related to resource sharing.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Suggestion
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create a New Suggestion</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter a title for your suggestion"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your suggestion or campaign idea"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add tags (press Enter to add)"
                  />
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Post Suggestion
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion._id}
              suggestion={suggestion}
              onVote={handleVote}
              onComment={handleAddComment}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center mt-8">
          <p>Loading suggestions...</p>
        </div>
      )}
    </div>
  )
}

export default SuggestionWall
