import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { BACKEND_URL, API_URL } from '../../config'

const AdminConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchConversations()
  }, [currentPage, searchTerm, sortBy, sortOrder])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`${API_URL}/admin/conversations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.conversations)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationDetails = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversation details')
      }

      const data = await response.json()
      setSelectedConversation(data.conversation)
      setMessages(data.messages)
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      // Refresh conversations list
      fetchConversations()
      
      // Clear selected conversation if it was deleted
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }

      alert('Conversation deleted successfully')
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchConversations()
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Conversations</h1>
          <p className="mt-2 text-gray-600">View and manage all user conversations</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </form>
                
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="updatedAt">Last Activity</option>
                    <option value="createdAt">Created Date</option>
                    <option value="messageCount">Message Count</option>
                  </select>
                  
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                  }`}
                  onClick={() => fetchConversationDetails(conversation._id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {conversation.participants.map((participant, index) => (
                          <span key={participant._id} className="text-sm font-medium text-gray-900">
                            {participant.name}
                            {index < conversation.participants.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      
                      {conversation.item && (
                        <p className="text-sm text-gray-600 mb-1">
                          Item: {conversation.item.title}
                        </p>
                      )}
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{conversation.messageCount || 0} messages</span>
                        <span>{formatDate(conversation.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conversation._id)
                      }}
                      className="ml-2 p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete conversation"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Conversation Details */}
          <div className="bg-white rounded-lg shadow">
            {selectedConversation ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Participants:</span>
                      <div className="mt-1">
                        {selectedConversation.participants.map((participant) => (
                          <div key={participant._id} className="flex items-center gap-2 mb-2">
                            {participant.avatar ? (
                              <img
                                src={BACKEND_URL+participant.avatar}
                                alt={participant.name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {participant.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                              <p className="text-xs text-gray-500">{participant.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedConversation.item && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Related Item:</span>
                        <p className="mt-1 text-sm text-gray-900">{selectedConversation.item.title}</p>
                        <p className="text-xs text-gray-500">{selectedConversation.item.category}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedConversation.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Messages ({messages.length})</h4>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div key={message._id} className="flex gap-3">
                        {message.sender.avatar ? (
                          <img
                            src={BACKEND_URL+message.sender.avatar || "/placeholder.svg"}
                            alt={message.sender.name}
                            className="h-8 w-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-600">
                              {message.sender.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{message.sender.name}</span>
                            <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {messages.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No messages in this conversation</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminConversations
