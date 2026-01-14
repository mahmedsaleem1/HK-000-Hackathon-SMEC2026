import { Review } from "../models/review.models.js";
import { SwapRequest } from "../models/swapRequest.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a review after completed transaction
export const createReview = asyncHandler(async (req, res) => {
  const { swapRequestId, rating, detailedRatings, title, comment } = req.body;

  if (!swapRequestId || !rating) {
    throw new APIError(400, "Swap request ID and rating are required");
  }

  if (rating < 1 || rating > 5) {
    throw new APIError(400, "Rating must be between 1 and 5");
  }

  // Get the swap request
  const swapRequest = await SwapRequest.findById(swapRequestId)
    .populate("requestedItem")
    .populate("requester");

  if (!swapRequest) {
    throw new APIError(404, "Swap request not found");
  }

  if (swapRequest.status !== "completed") {
    throw new APIError(400, "You can only review completed transactions");
  }

  // Determine who is being reviewed
  const isRequester = swapRequest.requester._id.toString() === req.user._id.toString();
  const isOwner = swapRequest.requestedItem.owner.toString() === req.user._id.toString();

  if (!isRequester && !isOwner) {
    throw new APIError(403, "You are not part of this transaction");
  }

  // The reviewer reviews the other party
  const reviewedUser = isRequester
    ? swapRequest.requestedItem.owner
    : swapRequest.requester._id;

  // Check if already reviewed
  const existingReview = await Review.findOne({
    swapRequest: swapRequestId,
    reviewer: req.user._id,
  });

  if (existingReview) {
    throw new APIError(400, "You have already reviewed this transaction");
  }

  const review = await Review.create({
    swapRequest: swapRequestId,
    reviewedUser,
    reviewer: req.user._id,
    item: swapRequest.requestedItem._id,
    rating,
    detailedRatings,
    title,
    comment,
  });

  const populatedReview = await Review.findById(review._id)
    .populate("reviewer", "username")
    .populate("reviewedUser", "username")
    .populate("item", "title images");

  return res.status(201).json(
    new ApiResponse(201, populatedReview, "Review submitted successfully")
  );
});

// Get reviews for a user
export const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reviews = await Review.find({ reviewedUser: userId })
    .populate("reviewer", "username")
    .populate("item", "title images")
    .sort({ createdAt: -1 });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  // Rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    distribution[r.rating]++;
  });

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      stats: {
        averageRating: Number(averageRating),
        totalReviews: reviews.length,
        distribution,
      },
    })
  );
});

// Get reviews for an item
export const getItemReviews = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const reviews = await Review.find({ item: itemId })
    .populate("reviewer", "username")
    .sort({ createdAt: -1 });

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
    })
  );
});

// Respond to a review (item owner)
export const respondToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    throw new APIError(400, "Response text is required");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new APIError(404, "Review not found");
  }

  // Verify the user is the one being reviewed
  if (review.reviewedUser.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You can only respond to reviews about you");
  }

  if (review.response?.text) {
    throw new APIError(400, "You have already responded to this review");
  }

  review.response = {
    text,
    respondedAt: new Date(),
  };
  await review.save();

  const populatedReview = await Review.findById(review._id)
    .populate("reviewer", "username")
    .populate("reviewedUser", "username")
    .populate("item", "title images");

  return res.status(200).json(
    new ApiResponse(200, populatedReview, "Response added successfully")
  );
});

// Get my reviews (reviews I've written)
export const getMyWrittenReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user._id })
    .populate("reviewedUser", "username")
    .populate("item", "title images")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, reviews));
});

// Get reviews about me
export const getReviewsAboutMe = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewedUser: req.user._id })
    .populate("reviewer", "username")
    .populate("item", "title images")
    .sort({ createdAt: -1 });

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      stats: {
        averageRating: Number(averageRating),
        totalReviews: reviews.length,
      },
    })
  );
});

// Check if user can review a transaction
export const canReview = asyncHandler(async (req, res) => {
  const { swapRequestId } = req.params;

  const swapRequest = await SwapRequest.findById(swapRequestId).populate("requestedItem");
  if (!swapRequest) {
    throw new APIError(404, "Swap request not found");
  }

  const isRequester = swapRequest.requester.toString() === req.user._id.toString();
  const isOwner = swapRequest.requestedItem.owner.toString() === req.user._id.toString();

  if (!isRequester && !isOwner) {
    return res.status(200).json(new ApiResponse(200, { canReview: false, reason: "Not part of transaction" }));
  }

  if (swapRequest.status !== "completed") {
    return res.status(200).json(new ApiResponse(200, { canReview: false, reason: "Transaction not completed" }));
  }

  const existingReview = await Review.findOne({
    swapRequest: swapRequestId,
    reviewer: req.user._id,
  });

  if (existingReview) {
    return res.status(200).json(new ApiResponse(200, { canReview: false, reason: "Already reviewed" }));
  }

  return res.status(200).json(new ApiResponse(200, { canReview: true }));
});
