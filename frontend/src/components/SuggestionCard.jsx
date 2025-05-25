"use client"

import { useState } from "react"
import { ThumbsUp, MessageCircle, Flag, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import { API_URL, BACKEND_URL } from "../config"

const DEFAULT_AVATAR = "/images/default-avatar.png"

const SuggestionCard = ({ suggestion, onVote, onComment }) => {
  const { currentUser } = useAuth()
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasVoted = suggestion.votes.some((vote) => vote.user === currentUser?._id)

  const handleVote = async () => {
    if (!currentUser) return

    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/suggestions/${suggestion._id}/vote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      onVote(suggestion._id)
    } catch (error) {
      console.error("Error voting on suggestion:", error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !currentUser) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/suggestions/${suggestion._id}/comments`,
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      onComment(suggestion._id, response.data)
      setComment("")
      setShowCommentForm(false)
      setShowComments(true) // Show comments after posting a new one
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
    // If we're showing comments, also close the comment form if it's open
    if (!showComments) {
      setShowCommentForm(false)
    }
  }

  const handleCommentButtonClick = () => {
    setShowCommentForm(!showCommentForm)
    // If we're showing the comment form, also show the comments
    if (!showCommentForm) {
      setShowComments(true)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start">
        <img
          src={suggestion.author.avatar ? BACKEND_URL + suggestion.author.avatar : DEFAULT_AVATAR}
          alt={suggestion.author.name}
          className="h-10 w-10 rounded-full mr-3"
          onError={(e) => (e.target.src = DEFAULT_AVATAR)}
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{suggestion.title}</h3>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
            </span>
          </div>

          <p className="text-gray-700 my-2">{suggestion.content}</p>

          {suggestion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {suggestion.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center mt-4 space-x-4">
            <button
              onClick={handleVote}
              className={`flex items-center text-sm ${hasVoted ? "text-indigo-600" : "text-gray-500"} hover:text-indigo-700`}
              disabled={!currentUser}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{suggestion.votes.length}</span>
            </button>

            <button
              onClick={handleCommentButtonClick}
              className="flex items-center text-sm text-gray-500 hover:text-indigo-700"
              disabled={!currentUser}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{suggestion.comments.length}</span>
            </button>

            <button
              className="flex items-center text-sm text-gray-500 hover:text-red-600 ml-auto"
              disabled={!currentUser}
            >
              <Flag className="h-4 w-4 mr-1" />
              <span>Report</span>
            </button>
          </div>

          {/* Comments section */}
          {suggestion.comments.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between cursor-pointer mb-2" onClick={toggleComments}>
                <h4 className="text-sm font-medium">Comments ({suggestion.comments.length})</h4>
                <button className="text-gray-500 hover:text-indigo-600">
                  {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {showComments && (
                <div className="space-y-3">
                  {suggestion.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start">
                      <img
                        src={comment.author.avatar ? BACKEND_URL + comment.author.avatar : DEFAULT_AVATAR}
                        alt={comment.author.name}
                        className="h-6 w-6 rounded-full mr-2"
                        onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                      />
                      <div className="bg-gray-50 rounded-md p-2 text-sm flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comment form */}
          {showCommentForm && currentUser && (
            <form onSubmit={handleSubmitComment} className="mt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
                placeholder="Add a comment..."
                rows={2}
                required
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuggestionCard
