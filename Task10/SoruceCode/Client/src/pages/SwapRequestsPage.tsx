import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Clock, 
  Check, 
  X, 
  Star,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { swapRequestsApi, reviewsApi } from '../lib/barterApi';
import { SwapRequest, SwapRequestStatus } from '../types';
import SwapRequestCard from '../components/SwapRequestCard';

export default function SwapRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<SwapRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SwapRequestStatus | 'all'>('all');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [detailedRatings, setDetailedRatings] = useState({
    itemCondition: 5,
    communication: 5,
    punctuality: 5,
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        swapRequestsApi.getReceived(),
        swapRequestsApi.getSent(),
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id: string, status: 'accepted' | 'rejected', message?: string) => {
    try {
      const updated = await swapRequestsApi.respond(id, status, message);
      setReceivedRequests((prev) =>
        prev.map((req) => (req._id === id ? updated : req))
      );
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const updated = await swapRequestsApi.complete(id);
      setReceivedRequests((prev) =>
        prev.map((req) => (req._id === id ? updated : req))
      );
      setSentRequests((prev) =>
        prev.map((req) => (req._id === id ? updated : req))
      );
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete request');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      const updated = await swapRequestsApi.cancel(id);
      setSentRequests((prev) =>
        prev.map((req) => (req._id === id ? updated : req))
      );
    } catch (error) {
      console.error('Error canceling request:', error);
      alert('Failed to cancel request');
    }
  };

  const handleOpenReview = async (id: string) => {
    try {
      const { canReview, reason } = await reviewsApi.canReview(id);
      if (!canReview) {
        alert(reason || 'You cannot review this transaction');
        return;
      }
      setReviewingRequestId(id);
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      await reviewsApi.create({
        swapRequestId: reviewingRequestId,
        rating: reviewRating,
        detailedRatings,
        comment: reviewComment,
      });
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
      setDetailedRatings({ itemCondition: 5, communication: 5, punctuality: 5 });
      alert('Review submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.userMessage || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;
  const filteredRequests = statusFilter === 'all'
    ? currentRequests
    : currentRequests.filter((req) => req.status === statusFilter);

  const getStatusCounts = (requests: SwapRequest[]) => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  });

  const counts = getStatusCounts(currentRequests);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-stone-800 to-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold">Swap Requests</h1>
          <p className="text-amber-100 mt-2">
            Manage your barter and rental requests
          </p>

          {/* Tab Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'received'
                  ? 'bg-white text-amber-800'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowDownLeft className="w-5 h-5" />
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === 'sent'
                  ? 'bg-white text-amber-800'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowUpRight className="w-5 h-5" />
              Sent ({sentRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: 'all', label: 'All', icon: <Filter className="w-4 h-4" /> },
            { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
            { value: 'accepted', label: 'Accepted', icon: <Check className="w-4 h-4" /> },
            { value: 'completed', label: 'Completed', icon: <Star className="w-4 h-4" /> },
            { value: 'rejected', label: 'Rejected', icon: <X className="w-4 h-4" /> },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value as typeof statusFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status.value
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.icon}
              {status.label} ({counts[status.value as keyof typeof counts]})
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1 h-24 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <SwapRequestCard
                key={request._id}
                request={request}
                type={activeTab}
                onRespond={handleRespond}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onReview={handleOpenReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {statusFilter !== 'all' ? statusFilter : ''} requests
            </h3>
            <p className="text-gray-500">
              {activeTab === 'received'
                ? "You haven't received any swap requests yet"
                : "You haven't sent any swap requests yet"}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= reviewRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Ratings */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">Detailed Ratings</p>
                  
                  {[
                    { key: 'itemCondition', label: 'Item Condition' },
                    { key: 'communication', label: 'Communication' },
                    { key: 'punctuality', label: 'Punctuality' },
                  ].map((rating) => (
                    <div key={rating.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{rating.label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setDetailedRatings((prev) => ({
                                ...prev,
                                [rating.key]: star,
                              }))
                            }
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= detailedRatings[rating.key as keyof typeof detailedRatings]
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="flex-1 px-4 py-3 bg-amber-800 text-white rounded-xl hover:bg-amber-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
