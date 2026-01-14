import { Link } from 'react-router-dom';
import { MapPin, Tag, RefreshCw, Clock, Eye, DollarSign } from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  showActions?: boolean;
  onToggleAvailability?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const conditionColors: Record<string, string> = {
  'new': 'bg-green-100 text-green-800',
  'like-new': 'bg-emerald-100 text-emerald-800',
  'good': 'bg-blue-100 text-blue-800',
  'fair': 'bg-yellow-100 text-yellow-800',
  'poor': 'bg-red-100 text-red-800',
};

const listingTypeIcons: Record<string, { icon: JSX.Element; label: string; color: string }> = {
  'barter': { icon: <RefreshCw className="w-3 h-3" />, label: 'Barter', color: 'bg-purple-100 text-purple-800' },
  'rental': { icon: <Clock className="w-3 h-3" />, label: 'Rental', color: 'bg-blue-100 text-blue-800' },
  'both': { icon: <Tag className="w-3 h-3" />, label: 'Both', color: 'bg-amber-100 text-amber-800' },
};

const categoryLabels: Record<string, string> = {
  'electronics': 'Electronics',
  'furniture': 'Furniture',
  'sports': 'Sports',
  'tools': 'Tools',
  'clothing': 'Clothing',
  'books': 'Books',
  'vehicles': 'Vehicles',
  'home-appliances': 'Home Appliances',
  'musical-instruments': 'Musical Instruments',
  'outdoor-gear': 'Outdoor Gear',
  'baby-kids': 'Baby & Kids',
  'other': 'Other',
};

export default function ItemCard({ item, showActions, onToggleAvailability, onDelete }: ItemCardProps) {
  const owner = typeof item.owner === 'object' ? item.owner : null;
  const listingInfo = listingTypeIcons[item.listingType];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <Link to={`/items/${item._id}`} className="block relative">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Tag className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              Not Available
            </span>
          </div>
        )}

        {/* Listing Type Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${listingInfo.color}`}>
          {listingInfo.icon}
          {listingInfo.label}
        </div>

        {/* View Count */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {item.viewCount}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category & Condition */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500">
            {categoryLabels[item.category] || item.category}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${conditionColors[item.condition]}`}>
            {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/items/${item._id}`}>
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1 hover:text-amber-700 transition-colors">
            {item.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Value & Location */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{item.estimatedValue.toLocaleString()}</span>
            {item.listingType !== 'barter' && item.rentalPrice && (
              <span className="text-gray-500 font-normal">
                / ${item.rentalPrice}/{item.rentalPeriod}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{item.location.city}</span>
          </div>
        </div>

        {/* Owner Info */}
        {owner && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-stone-700 flex items-center justify-center text-white text-sm font-semibold">
              {owner.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-gray-600">{owner.username}</span>
          </div>
        )}

        {/* Actions (for owner) */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <Link
              to={`/items/${item._id}/edit`}
              className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Edit
            </Link>
            <button
              onClick={() => onToggleAvailability?.(item._id)}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                item.isAvailable
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </button>
            <button
              onClick={() => onDelete?.(item._id)}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
