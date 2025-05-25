"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Monitor,
  Package,
  Users,
  CheckCircle,
  Gift,
  MessageCircle,
  Bell,
  UserCircle,
  Shield,
  ChevronRight,
  Globe,
  Mail,
} from "lucide-react"
import axios from "axios"
import { API_URL } from "../config"
import ItemCard from "../components/ItemCard"

const LandingPage = () => {
  const [featuredItems, setFeaturedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/items/featured`)
        setFeaturedItems(response.data)
      } catch (error) {
        console.error("Error fetching featured items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  const testimonials = [
    {
      quote:
        "Carry Forward helped me find textbooks I couldn't afford. Now I'm passing them on to the next student who needs them.",
      author: "Sarah J.",
      role: "Biology Major",
    },
    {
      quote:
        "As a graduating senior, I wanted my lab equipment to go to someone who would use it. This platform made it easy to connect with freshmen who needed it.",
      author: "Michael T.",
      role: "Engineering Student",
    },
    {
      quote:
        "I've both given and received items through Carry Forward. It's created a wonderful cycle of giving on campus.",
      author: "Priya K.",
      role: "Psychology Student",
    },
  ]

  const stats = [
    { value: "2,500+", label: "Items Shared" },
    { value: "1,800+", label: "Active Students" },
    { value: "15+", label: "Campus Campaigns" },
    { value: "4", label: "Tons of Waste Reduced" },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-800 bg-opacity-50 rounded-full text-sm font-medium mb-4">
                  MMGlobus Initiative
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  One Student. One Gift.
                  <br />
                  <span className="text-indigo-200">One Global Movement.</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-indigo-100 leading-relaxed">
                A peer-to-peer platform where students donate books, equipment, and essentials to one another. No red
                tape. No waste. Just generosity, growth, and change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  Join Now
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg border border-indigo-400 hover:bg-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  Browse Items
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-2xl rotate-3 transform-gpu"></div>
              <img
                src="/images/heero.png"
                alt="Students sharing resources"
                className="relative rounded-2xl shadow-2xl transform-gpu -rotate-3 transition-transform hover:rotate-0 duration-500"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* What Is Carry Forward? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Is Carry Forward?</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 leading-relaxed">
                Carry Forward is a student-driven initiative designed to build a sustainable ecosystem of learning. It's
                a web-based platform that allows students to donate, exchange, and request books, lab gear, tech
                devices, and more — directly from fellow students.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mt-4">
                Together, we create an open loop of learning where resources are never lost, only passed forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A simple process to share resources and build a more sustainable campus community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">1. Donate Items</h3>
              <p className="text-gray-600 text-center">
                List any books, equipment, or supplies you're no longer using.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">2. Wishlist What You Need</h3>
              <p className="text-gray-600 text-center">Search or request what you're missing this semester.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">3. Connect & Chat</h3>
              <p className="text-gray-600 text-center">
                Message directly with fellow students to coordinate handovers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">4. Repeat & Reinforce</h3>
              <p className="text-gray-600 text-center">
                Keep the circle going. Your one donation may spark someone's future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                Browse
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Items</h2>
            </div>
            <Link
              to="/dashboard"
              className="mt-4 md:mt-0 group text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
            >
              View All <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tools designed to make resource sharing easy, efficient, and community-focused.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real-Time Chat</h3>
              <p className="text-gray-600">Coordinate pickups or simply connect with fellow students.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Wishlist</h3>
              <p className="text-gray-600">Automatically match you with items you're looking for.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <UserCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Profile & History</h3>
              <p className="text-gray-600">Build your giving legacy and track contributions.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Trust</h3>
              <p className="text-gray-600">
                Report/block options, verified campus logins, and positive feedback scores.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Bell className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Notifications & Alerts</h3>
              <p className="text-gray-600">Get real-time updates when an item you need becomes available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              Impact
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why It Matters</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Creating impact beyond just resource sharing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Reduce Educational Waste</h3>
              <p className="text-gray-600">
                Over 5 million textbooks end up in landfills every year. Let's change that.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Empower Financial Equity</h3>
              <p className="text-gray-600">Bridge the resource gap for underfunded students through shared access.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Monitor className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Build Student Community</h3>
              <p className="text-gray-600">Promote empathy, trust, and meaningful connections across campuses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-800 bg-opacity-50 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What Students Say</h2>
            <p className="text-lg text-indigo-200 max-w-3xl mx-auto">
              Hear from students who have experienced the benefits of Carry Forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-indigo-800 bg-opacity-50 p-8 rounded-xl backdrop-blur-sm border border-indigo-700 hover:border-indigo-500 transition-colors"
              >
                <p className="text-indigo-100 mb-6 italic leading-relaxed text-lg">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <UserCircle className="h-6 w-6 text-indigo-200" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-indigo-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <p className="text-5xl font-bold text-indigo-600 mb-3">{stat.value}</p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              Vision
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Changing the World, One Student at a Time
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 leading-relaxed">
                At MMGlobus, we believe that education is a shared journey — and that journey should never be limited by
                access to materials. With Carry Forward, we're planting the seeds of a new educational culture: one
                rooted in sharing, sustainability, and support.
              </p>
              <p className="text-xl font-semibold text-indigo-600 mt-6">This isn't charity. It's a movement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* A Movement That Moves */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              Future
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">A Movement That Moves</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              MMGlobus envisions a global network of students uplifting each other. As the Carry Forward platform
              expands, campuses become collaborative ecosystems — where students empower students, and knowledge flows
              freely.
            </p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-white p-10 rounded-2xl shadow-lg border border-indigo-100">
            <h3 className="text-2xl font-bold mb-8 text-center text-indigo-800">Imagine:</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-lg text-gray-700">
                  A future where no student drops a course because they can't afford a textbook.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-lg text-gray-700">
                  Where lab kits don't collect dust in closets, but pass from learner to learner.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-lg text-gray-700">Where community isn't a buzzword — it's a behavior.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-3 py-1 bg-indigo-800 bg-opacity-50 rounded-full text-sm font-medium mb-4">
            Get Started
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Movement</h2>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto mb-4">Ready to Carry Forward?</p>
          <p className="text-lg text-indigo-100 max-w-3xl mx-auto mb-10">
            Sign up today. Start giving, start receiving, start shaping a better world.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg border border-indigo-400 hover:bg-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              Login
            </Link>
          </div>
          <div className="text-indigo-200 space-y-2">
            <p className="flex items-center justify-center">
              <Globe className="h-5 w-5 mr-2" /> mmglobus.com/carryforward
            </p>
            <p className="flex items-center justify-center">
              <Mail className="h-5 w-5 mr-2" /> contact@mmglobus.com
            </p>
          </div>
          <p className="text-xl font-semibold text-white mt-10 italic">
            "Because every student deserves a little help. And every resource deserves a second life."
          </p>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
