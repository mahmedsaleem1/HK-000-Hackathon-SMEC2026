import { useState } from 'react';
import { Star, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { Review, ItemOwner, Item } from '../types';

interface ReviewCardProps {
  review: Review;
  isOwner?: boolean;
  onRespond?: (reviewId: string, text: string) => void;
}

const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewCard({ review, isOwner, onRespond }: ReviewCardProps) {
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseText, setResponseText] = useState('');

  const reviewer = review.reviewer as ItemOwner;
  const reviewedUser = review.reviewedUser as ItemOwner;
  const item = review.item as Item | undefined;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSubmitResponse = () => {
    if (responseText.trim()) {
      onRespond?.(review._id, responseText);
      setShowResponseInput(false);
      setResponseText('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Reviewer Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-stone-700 flex items-center justify-center text-white text-lg font-semibold">
              {reviewer?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">
                  {reviewer?.username || 'Anonymous'}
                </h4>
                {review.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="text-right">
            {renderStars(review.rating)}
            <p className="text-sm text-gray-600 mt-1">
              {ratingLabels[review.rating - 1] || 'No Rating'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        {review.title && (
          <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
        )}

        {/* Comment */}
        <p className="text-gray-700 mb-4">{review.comment}</p>

        {/* Detailed Ratings */}
        {review.detailedRatings && (
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Item Condition</p>
              {renderStars(review.detailedRatings.itemCondition, 'sm')}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Communication</p>
              {renderStars(review.detailedRatings.communication, 'sm')}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Punctuality</p>
              {renderStars(review.detailedRatings.punctuality, 'sm')}
            </div>
          </div>
        )}

        {/* Item Reference */}
        {item && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>For item:</span>
            <span className="font-medium text-indigo-600">{item.title}</span>
          </div>
        )}

        {/* Owner Response */}
        {review.response && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
            <div className="flex items-center gap-2 text-sm text-indigo-600 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Response from {reviewedUser?.username || 'Owner'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {formatDate(review.response.respondedAt)}
              </span>
            </div>
            <p className="text-gray-700">{review.response.text}</p>
          </div>
        )}

        {/* Response Input (for owner) */}
        {isOwner && !review.response && (
          <div className="mt-4">
            {!showResponseInput ? (
              <button
                onClick={() => setShowResponseInput(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Respond to this review
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!responseText.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Response
                  </button>
                  <button
                    onClick={() => {
                      setShowResponseInput(false);
                      setResponseText('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Review Stats Component
interface ReviewStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(stats.ratingDistribution));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{stats.totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-3">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
