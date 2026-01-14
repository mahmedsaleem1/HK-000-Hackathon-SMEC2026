import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  Clock, 
  RefreshCw, 
  MessageSquare, 
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { SwapRequest, Item, ItemOwner } from '../types';

interface SwapRequestCardProps {
  request: SwapRequest;
  type: 'sent' | 'received';
  onRespond?: (id: string, status: 'accepted' | 'rejected', message?: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReview?: (id: string) => void;
}

const statusColors: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: <Check className="w-4 h-4" /> },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <X className="w-4 h-4" /> },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Star className="w-4 h-4" /> },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <X className="w-4 h-4" /> },
};

export default function SwapRequestCard({
  request,
  type,
  onRespond,
  onComplete,
  onCancel,
  onReview,
}: SwapRequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseInput, setShowResponseInput] = useState(false);

  const requestedItem = request.requestedItem as Item;
  const offeredItem = request.offeredItem as Item | undefined;
  const requester = request.requester as ItemOwner;
  const statusInfo = statusColors[request.status];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAccept = () => {
    onRespond?.(request._id, 'accepted', responseMessage);
    setShowResponseInput(false);
  };

  const handleReject = () => {
    onRespond?.(request._id, 'rejected', responseMessage);
    setShowResponseInput(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusInfo.bg}`}>
              {statusInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  request.requestType === 'barter' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.requestType === 'barter' ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Barter
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Rental
                    </span>
                  )}
                </span>
                {request.matchScore && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {request.matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {type === 'sent' ? 'Sent' : 'Received'} on {formatDate(request.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Requested Item */}
          <Link to={`/items/${requestedItem._id}`} className="flex-1 group">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {requestedItem.images?.[0] ? (
                  <img
                    src={requestedItem.images[0]}
                    alt={requestedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Requested</p>
                <h4 className="font-medium text-gray-900 truncate group-hover:text-indigo-600">
                  {requestedItem.title}
                </h4>
                <p className="text-sm text-green-600 font-medium">
                  ${requestedItem.estimatedValue?.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Offered Item (for barter) or Rental Details */}
          {request.requestType === 'barter' && offeredItem ? (
            <Link to={`/items/${offeredItem._id}`} className="flex-1 group">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {offeredItem.images?.[0] ? (
                    <img
                      src={offeredItem.images[0]}
                      alt={offeredItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Offered</p>
                  <h4 className="font-medium text-gray-900 truncate group-hover:text-amber-700">
                    {offeredItem.title}
                  </h4>
                  <p className="text-sm text-green-600 font-medium">
                    ${offeredItem.estimatedValue?.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ) : request.rentalDetails ? (
            <div className="flex-1 p-3 rounded-lg bg-blue-50">
              <p className="text-xs text-blue-600 mb-1">Rental Period</p>
              <p className="font-medium text-gray-900">
                {formatDate(request.rentalDetails.startDate)} - {formatDate(request.rentalDetails.endDate)}
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">
                ${request.rentalDetails.totalPrice?.toLocaleString()} total
              </p>
            </div>
          ) : null}
        </div>

        {/* Requester Info (for received requests) */}
        {type === 'received' && requester && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-stone-700 flex items-center justify-center text-white text-xs font-semibold">
              {requester.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span>From: <strong>{requester.username}</strong></span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Message */}
          {request.message && (
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <MessageSquare className="w-4 h-4" />
                Message
              </div>
              <p className="text-gray-700">{request.message}</p>
            </div>
          )}

          {/* Owner Response */}
          {request.ownerResponse && (
            <div className="p-3 rounded-lg bg-amber-50">
              <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
                <MessageSquare className="w-4 h-4" />
                Response
                {request.ownerResponse.respondedAt && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {formatDate(request.ownerResponse.respondedAt)}
                  </span>
                )}
              </div>
              <p className="text-gray-700">{request.ownerResponse.message || 'No message provided'}</p>
            </div>
          )}

          {/* Response Input (for received pending requests) */}
          {type === 'received' && request.status === 'pending' && showResponseInput && (
            <div className="space-y-3">
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Add a message with your response (optional)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {/* Received pending requests - Accept/Reject */}
            {type === 'received' && request.status === 'pending' && (
              <>
                {!showResponseInput ? (
                  <button
                    onClick={() => setShowResponseInput(true)}
                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
                  >
                    Respond
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAccept}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setShowResponseInput(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}

            {/* Sent pending requests - Cancel */}
            {type === 'sent' && request.status === 'pending' && (
              <button
                onClick={() => onCancel?.(request._id)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel Request
              </button>
            )}

            {/* Accepted requests - Complete */}
            {request.status === 'accepted' && (
              <button
                onClick={() => onComplete?.(request._id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Mark as Completed
              </button>
            )}

            {/* Completed requests - Review */}
            {request.status === 'completed' && (
              <button
                onClick={() => onReview?.(request._id)}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" /> Leave a Review
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
