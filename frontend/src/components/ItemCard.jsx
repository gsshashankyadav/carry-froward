import { Link } from "react-router-dom"
import { Calendar, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { BACKEND_URL } from "../config"

// Default images
const DEFAULT_ITEM_IMAGE = "/images/default-item.png"
const DEFAULT_AVATAR = "/images/default-avatar.png"

const ItemCard = ({ item }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.images && item.images.length > 0 ? BACKEND_URL + item.images[0] : DEFAULT_ITEM_IMAGE}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = DEFAULT_ITEM_IMAGE)}
        />
        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
          {item.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 truncate">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center text-gray-500 text-xs mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>

          <Tag className="h-4 w-4 ml-3 mr-1" />
          <span>{item.condition}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={item.owner.avatar ? BACKEND_URL + item.owner.avatar : DEFAULT_AVATAR}
              alt={item.owner.name}
              className="h-6 w-6 rounded-full mr-2"
              onError={(e) => (e.target.src = DEFAULT_AVATAR)}
            />
            <span className="text-xs text-gray-600">{item.owner.name}</span>
          </div>

          <Link to={`/items/${item._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ItemCard
