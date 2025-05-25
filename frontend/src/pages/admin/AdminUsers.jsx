"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle, UserX, UserCheck } from "lucide-react"
import axios from "axios"
import { BACKEND_URL, API_URL } from "../../config"

const AdminUsers = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      let url = `${API_URL}/admin/users?page=${currentPage}&limit=${usersPerPage}`

      if (roleFilter) {
        url += `&role=${roleFilter}`
      }

      if (statusFilter) {
        url += `&isActive=${statusFilter === "active"}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUsers(response.data.users || response.data)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.length / usersPerPage))
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem("token")
      let data = {}

      if (action === "activate") {
        data = { isActive: true }
      } else if (action === "deactivate") {
        data = { isActive: false }
      } else if (action === "makeAdmin") {
        data = { role: "admin" }
      } else if (action === "removeAdmin") {
        data = { role: "student" }
      }

      await axios.put(`${API_URL}/admin/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update user in the list
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, ...data } : user)))

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, ...data })
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error)
      setError(`Failed to ${action} user`)
    }
  }

  const handleViewUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSelectedUser(response.data.user)
      setShowUserModal(true)
    } catch (error) {
      console.error("Error fetching user details:", error)
      setError("Failed to load user details")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : users

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600">View and manage user accounts</p>
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
                placeholder="Search users by name, email, or student ID..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("")
                setRoleFilter("")
                setStatusFilter("")
                setCurrentPage(1)
                fetchUsers()
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
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
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
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Student ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
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
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar ? BACKEND_URL+user.avatar : "/images/default-avatar.png"}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.studentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleUserAction(user._id, "deactivate")}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user._id, "activate")}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Activate
                          </button>
                        )}
                        {user.role === "student" ? (
                          <button
                            onClick={() => handleUserAction(user._id, "makeAdmin")}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Make Admin
                          </button>
                        ) : user._id !== currentUser._id ? (
                          <button
                            onClick={() => handleUserAction(user._id, "removeAdmin")}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Remove Admin
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> users
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <img
                  src={selectedUser.avatar? BACKEND_URL+selectedUser.avatar : "/images/default-avatar.png"}
                  alt={selectedUser.name}
                  className="h-32 w-32 rounded-full mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                  <span
                    className={`mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{selectedUser.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{selectedUser.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.isActive ? (
                      <button
                        onClick={() => handleUserAction(selectedUser._id, "deactivate")}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate Account
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(selectedUser._id, "activate")}
                        className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate Account
                      </button>
                    )}

                    {selectedUser.role === "student" ? (
                      <button
                        onClick={() => handleUserAction(selectedUser._id, "makeAdmin")}
                        className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
                      >
                        Make Admin
                      </button>
                    ) : selectedUser._id !== currentUser._id ? (
                      <button
                        onClick={() => handleUserAction(selectedUser._id, "removeAdmin")}
                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                      >
                        Remove Admin
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
