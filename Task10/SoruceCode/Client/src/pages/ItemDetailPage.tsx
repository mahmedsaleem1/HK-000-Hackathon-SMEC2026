import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Tag, 
  RefreshCw, 
  Clock, 
  Eye, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { itemsApi, swapRequestsApi, reviewsApi } from '../lib/barterApi';
import { Item, MatchingItem, Review, ReviewStats, ItemOwner } from '../types';
import ReviewCard, { ReviewStats as ReviewStatsComponent } from '../components/ReviewCard';

const conditionLabels: Record<string, string> = {
  'new': 'New',
  'like-new': 'Like New',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
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

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'matching' | 'reviews'>('details');

  // Swap Request Modal State
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapType, setSwapType] = useState<'barter' | 'rental'>('barter');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchItem();
      fetchReviews();
    }
  }, [itemId]);

  useEffect(() => {
    if (item && user) {
      fetchMatchingItems();
      fetchMyItems();
    }
  }, [item, user]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getById(itemId!);
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingItems = async () => {
    try {
      const data = await itemsApi.getMatching(itemId!);
      setMatchingItems(data);
    } catch (error) {
      console.error('Error fetching matching items:', error);
    }
  };

  const fetchMyItems = async () => {
    try {
      const data = await itemsApi.getMyItems();
      setMyItems(data.filter(i => i.isAvailable && i._id !== itemId));
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getItemReviews(itemId!);
      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!user) {
      // Redirect to login
      return;
    }

    try {
      setSubmitting(true);
      await swapRequestsApi.create({
        requestedItemId: itemId!,
        offeredItemId: swapType === 'barter' ? selectedItemId : undefined,
        requestType: swapType,
        rentalDetails: swapType === 'rental' ? {
          startDate: rentalStartDate,
          endDate: rentalEndDate,
        } : undefined,
        message,
      });

      setShowSwapModal(false);
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert('Failed to send swap request');
    } finally {
      setSubmitting(false);
    }
  };

  const owner = item?.owner as ItemOwner | undefined;
  const isOwner = user && owner && user._id === owner._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <Link to="/items" className="text-amber-700 hover:text-amber-800">
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/items"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Items
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[activeImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Tag className="w-24 h-24" />
                </div>
              )}

              {/* Navigation Arrows */}
              {item.images && item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => 
                      prev === 0 ? item.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => 
                      prev === item.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Availability Badge */}
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg">
                    Not Available
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === activeImageIndex
                        ? 'border-amber-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Category & Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {categoryLabels[item.category] || item.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.condition === 'new' ? 'bg-green-100 text-green-800' :
                item.condition === 'like-new' ? 'bg-emerald-100 text-emerald-800' :
                item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {conditionLabels[item.condition]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                item.listingType === 'barter' ? 'bg-purple-100 text-purple-800' :
                item.listingType === 'rental' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {item.listingType === 'barter' ? <RefreshCw className="w-3 h-3" /> :
                 item.listingType === 'rental' ? <Clock className="w-3 h-3" /> :
                 <Tag className="w-3 h-3" />}
                {item.listingType.charAt(0).toUpperCase() + item.listingType.slice(1)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>

            {/* Price & Views */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-3xl font-bold text-green-600">
                  <DollarSign className="w-8 h-8" />
                  {item.estimatedValue.toLocaleString()}
                </div>
                {item.listingType !== 'barter' && item.rentalPrice && (
                  <p className="text-gray-500 mt-1">
                    Rental: ${item.rentalPrice}/{item.rentalPeriod}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="w-5 h-5" />
                <span>{item.viewCount} views</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{item.location.city}{item.location.area ? `, ${item.location.area}` : ''}</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Swap Categories */}
            {item.listingType !== 'rental' && item.preferredSwapCategories && item.preferredSwapCategories.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Looking to swap for</h3>
                <div className="flex flex-wrap gap-2">
                  {item.preferredSwapCategories.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {categoryLabels[cat] || cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            {owner && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-stone-700 flex items-center justify-center text-white text-xl font-semibold">
                  {owner.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{owner.username}</h4>
                  <p className="text-sm text-gray-500">Listed on {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{reviewStats.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{reviewStats.totalReviews} reviews</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!isOwner && item.isAvailable && (
              <div className="flex gap-3">
                {(item.listingType === 'barter' || item.listingType === 'both') && (
                  <button
                    onClick={() => {
                      setSwapType('barter');
                      setShowSwapModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Propose Swap
                  </button>
                )}
                {(item.listingType === 'rental' || item.listingType === 'both') && (
                  <button
                    onClick={() => {
                      setSwapType('rental');
                      setShowSwapModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Clock className="w-5 h-5" />
                    Request Rental
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <Link
                to={`/items/${item._id}/edit`}
                className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Edit Item
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-b border-gray-200">
          <div className="flex gap-8">
            {[
              { id: 'details', label: 'Details' },
              { id: 'matching', label: 'Smart Matches', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'reviews', label: `Reviews (${reviewStats?.totalReviews || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-4">Item Details</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium">{categoryLabels[item.category] || item.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Condition</dt>
                    <dd className="font-medium">{conditionLabels[item.condition]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Listing Type</dt>
                    <dd className="font-medium capitalize">{item.listingType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Estimated Value</dt>
                    <dd className="font-medium text-green-600">${item.estimatedValue.toLocaleString()}</dd>
                  </div>
                  {item.rentalPrice && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Rental Price</dt>
                      <dd className="font-medium">${item.rentalPrice}/{item.rentalPeriod}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-6 h-6 text-amber-700" />
                  <div>
                    <p className="font-medium">{item.location.city}</p>
                    {item.location.area && <p className="text-sm">{item.location.area}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matching' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-amber-700" />
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Swap Matches</h3>
                  <p className="text-sm text-gray-500">Items that match your swap preferences</p>
                </div>
              </div>

              {matchingItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingItems.map((matchItem) => (
                    <div key={matchItem._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <Link to={`/items/${matchItem._id}`} className="block">
                        <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                          {matchItem.images?.[0] ? (
                            <img
                              src={matchItem.images[0]}
                              alt={matchItem.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Tag className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 px-3 py-1 bg-amber-700 text-white rounded-full text-sm font-semibold">
                            {matchItem.matchScore}% Match
                          </div>
                        </div>
                      </Link>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{matchItem.title}</h4>
                        <p className="text-green-600 font-medium">${matchItem.estimatedValue.toLocaleString()}</p>
                        {matchItem.matchReasons && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {matchItem.matchReasons.map((reason, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
                  <p className="text-gray-500">We'll find great swap matches as more items are listed</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviewStats && reviewStats.totalReviews > 0 && (
                <ReviewStatsComponent stats={reviewStats} />
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Be the first to review after a successful swap!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {swapType === 'barter' ? 'Propose a Swap' : 'Request Rental'}
                </h2>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Item being requested */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">You're requesting</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-green-600 font-medium">${item.estimatedValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Barter: Select item to offer */}
                {swapType === 'barter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select an item to offer
                    </label>
                    {myItems.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {myItems.map((myItem) => (
                          <label
                            key={myItem._id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              selectedItemId === myItem._id
                                ? 'border-amber-600 bg-amber-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="offeredItem"
                              value={myItem._id}
                              checked={selectedItemId === myItem._id}
                              onChange={(e) => setSelectedItemId(e.target.value)}
                              className="sr-only"
                            />
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                              {myItem.images?.[0] && (
                                <img src={myItem.images[0]} alt={myItem.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{myItem.title}</h5>
                              <p className="text-green-600 text-sm">${myItem.estimatedValue.toLocaleString()}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-3">You don't have any items to offer</p>
                        <Link
                          to="/items/new"
                          className="text-amber-700 hover:text-amber-800 font-medium"
                        >
                          List an item first
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Rental: Date selection */}
                {swapType === 'rental' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={rentalStartDate}
                        onChange={(e) => setRentalStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={rentalEndDate}
                        onChange={(e) => setRentalEndDate(e.target.value)}
                        min={rentalStartDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message to the owner..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSwapRequest}
                  disabled={
                    submitting ||
                    (swapType === 'barter' && !selectedItemId) ||
                    (swapType === 'rental' && (!rentalStartDate || !rentalEndDate))
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
