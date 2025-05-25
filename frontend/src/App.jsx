import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ChatProvider } from "./contexts/ChatContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ItemDetails from "./pages/ItemDetails"
import UploadItem from "./pages/UploadItem"
import EditItem from "./pages/EditItem"
import Chat from "./pages/Chat"
import SuggestionWall from "./pages/SuggestionWall"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminItems from "./pages/admin/AdminItems"
import AdminChats from "./pages/admin/AdminChats"
import AdminSuggestions from "./pages/admin/AdminSuggestions"
import NotFound from "./pages/NotFound"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import VerifyEmail from "./pages/VerifyEmail"
import Profile from "./pages/Profile"
import AdminConversations from "./pages/admin/AdminConversations"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />

                {/* Protected Student Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/items/:id" element={<ItemDetails />} />
                  <Route path="/upload" element={<UploadItem />} />
                  <Route path="/edit-item/:id" element={<EditItem />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:userId" element={<Chat />} />
                  <Route path="/suggestions" element={<SuggestionWall />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/items" element={<AdminItems />} />
                  <Route path="/admin/chats" element={<AdminChats />} />
                  <Route path="/admin/suggestions" element={<AdminSuggestions />} />
                  <Route path="/admin/conversations" element={<AdminConversations />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ChatProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
