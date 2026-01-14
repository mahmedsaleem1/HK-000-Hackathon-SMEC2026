import { SwapRequest } from "../models/swapRequest.models.js";
import { Item } from "../models/item.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a swap/rental request
export const createSwapRequest = asyncHandler(async (req, res) => {
  const { requestedItemId, offeredItemId, requestType, rentalDetails, message } = req.body;

  if (!requestedItemId || !requestType) {
    throw new APIError(400, "Requested item and request type are required");
  }

  // Get the requested item
  const requestedItem = await Item.findById(requestedItemId).populate("owner");
  if (!requestedItem) {
    throw new APIError(404, "Requested item not found");
  }

  if (!requestedItem.isAvailable) {
    throw new APIError(400, "This item is not available");
  }

  // Can't request your own item
  if (requestedItem.owner._id.toString() === req.user._id.toString()) {
    throw new APIError(400, "You cannot request your own item");
  }

  // Validate based on request type
  if (requestType === "barter") {
    if (!offeredItemId) {
      throw new APIError(400, "You must offer an item for barter");
    }

    const offeredItem = await Item.findById(offeredItemId);
    if (!offeredItem) {
      throw new APIError(404, "Offered item not found");
    }

    if (offeredItem.owner.toString() !== req.user._id.toString()) {
      throw new APIError(403, "You can only offer your own items");
    }

    if (!offeredItem.isAvailable) {
      throw new APIError(400, "Your offered item is not available");
    }
  }

  if (requestType === "rental") {
    if (!rentalDetails?.startDate || !rentalDetails?.endDate) {
      throw new APIError(400, "Rental start and end dates are required");
    }

    if (requestedItem.listingType === "barter") {
      throw new APIError(400, "This item is only available for barter");
    }
  }

  // Calculate match score for barter
  let matchScore = 50; // Base score
  if (requestType === "barter" && offeredItemId) {
    const offeredItem = await Item.findById(offeredItemId);
    if (offeredItem) {
      // Category preference match
      if (
        requestedItem.preferredSwapCategories?.includes("any") ||
        requestedItem.preferredSwapCategories?.includes(offeredItem.category)
      ) {
        matchScore += 25;
      }

      // Value similarity
      const valueDiff = Math.abs(requestedItem.estimatedValue - offeredItem.estimatedValue);
      const valueRatio = 1 - valueDiff / Math.max(requestedItem.estimatedValue, offeredItem.estimatedValue);
      matchScore += Math.round(valueRatio * 25);
    }
  }

  // Check for existing pending request
  const existingRequest = await SwapRequest.findOne({
    requester: req.user._id,
    requestedItem: requestedItemId,
    status: "pending",
  });

  if (existingRequest) {
    throw new APIError(400, "You already have a pending request for this item");
  }

  const swapRequest = await SwapRequest.create({
    requester: req.user._id,
    requestedItem: requestedItemId,
    offeredItem: offeredItemId,
    requestType,
    rentalDetails: requestType === "rental" ? {
      startDate: new Date(rentalDetails.startDate),
      endDate: new Date(rentalDetails.endDate),
      totalPrice: rentalDetails.totalPrice,
    } : undefined,
    message,
    matchScore: Math.min(matchScore, 100),
  });

  const populatedRequest = await SwapRequest.findById(swapRequest._id)
    .populate("requester", "username email")
    .populate("requestedItem")
    .populate("offeredItem");

  return res.status(201).json(
    new ApiResponse(201, populatedRequest, "Request sent successfully")
  );
});

// Get requests I've sent
export const getMyRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const query = { requester: req.user._id };
  if (status) query.status = status;

  const requests = await SwapRequest.find(query)
    .populate("requester", "username email")
    .populate("requestedItem")
    .populate("offeredItem")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, requests));
});

// Get requests for my items
export const getIncomingRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  // First get all my item IDs
  const myItems = await Item.find({ owner: req.user._id }).select("_id");
  const myItemIds = myItems.map((item) => item._id);

  const query = { requestedItem: { $in: myItemIds } };
  if (status) query.status = status;

  const requests = await SwapRequest.find(query)
    .populate("requester", "username email")
    .populate("requestedItem")
    .populate("offeredItem")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, requests));
});

// Respond to a request (accept/reject)
export const respondToRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, message } = req.body;

  if (!["accept", "reject"].includes(action)) {
    throw new APIError(400, "Invalid action");
  }

  const swapRequest = await SwapRequest.findById(id).populate("requestedItem");
  if (!swapRequest) {
    throw new APIError(404, "Request not found");
  }

  // Verify the user owns the requested item
  if (swapRequest.requestedItem.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You can only respond to requests for your items");
  }

  if (swapRequest.status !== "pending") {
    throw new APIError(400, "This request has already been processed");
  }

  swapRequest.status = action === "accept" ? "accepted" : "rejected";
  swapRequest.ownerResponse = {
    message,
    respondedAt: new Date(),
  };

  // If accepted, mark items as unavailable
  if (action === "accept") {
    await Item.findByIdAndUpdate(swapRequest.requestedItem._id, { isAvailable: false });
    if (swapRequest.offeredItem) {
      await Item.findByIdAndUpdate(swapRequest.offeredItem, { isAvailable: false });
    }
  }

  await swapRequest.save();

  const populatedRequest = await SwapRequest.findById(swapRequest._id)
    .populate("requester", "username email")
    .populate("requestedItem")
    .populate("offeredItem");

  return res.status(200).json(
    new ApiResponse(200, populatedRequest, `Request ${action}ed successfully`)
  );
});

// Complete a swap/rental
export const completeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const swapRequest = await SwapRequest.findById(id).populate("requestedItem");
  if (!swapRequest) {
    throw new APIError(404, "Request not found");
  }

  // Either party can mark as complete
  const isRequester = swapRequest.requester.toString() === req.user._id.toString();
  const isOwner = swapRequest.requestedItem.owner.toString() === req.user._id.toString();

  if (!isRequester && !isOwner) {
    throw new APIError(403, "You are not part of this transaction");
  }

  if (swapRequest.status !== "accepted") {
    throw new APIError(400, "Only accepted requests can be completed");
  }

  swapRequest.status = "completed";
  swapRequest.completedAt = new Date();
  await swapRequest.save();

  const populatedRequest = await SwapRequest.findById(swapRequest._id)
    .populate("requester", "username email")
    .populate("requestedItem")
    .populate("offeredItem");

  return res.status(200).json(
    new ApiResponse(200, populatedRequest, "Transaction completed successfully")
  );
});

// Cancel a request (only requester can cancel pending requests)
export const cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const swapRequest = await SwapRequest.findById(id);
  if (!swapRequest) {
    throw new APIError(404, "Request not found");
  }

  if (swapRequest.requester.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You can only cancel your own requests");
  }

  if (swapRequest.status !== "pending") {
    throw new APIError(400, "Only pending requests can be cancelled");
  }

  swapRequest.status = "cancelled";
  await swapRequest.save();

  return res.status(200).json(new ApiResponse(200, swapRequest, "Request cancelled"));
});

// Get single request details
export const getRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const swapRequest = await SwapRequest.findById(id)
    .populate("requester", "username email")
    .populate("requestedItem")
    .populate("offeredItem");

  if (!swapRequest) {
    throw new APIError(404, "Request not found");
  }

  return res.status(200).json(new ApiResponse(200, swapRequest));
});
