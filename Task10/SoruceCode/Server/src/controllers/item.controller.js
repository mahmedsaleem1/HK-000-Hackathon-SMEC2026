import { Item } from "../models/item.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createItem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    condition,
    estimatedValue,
    listingType,
    rentalPrice,
    rentalPeriod,
    preferredSwapCategories,
    location,
    tags,
  } = req.body;

  if (!title || !description || !category || !condition || !estimatedValue || !listingType) {
    throw new APIError(400, "All required fields must be provided");
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadedImage = await uploadOnCloudinary(file.path);
      if (uploadedImage) {
        images.push(uploadedImage.url);
      }
    }
  }

  if (images.length === 0) {
    throw new APIError(400, "At least one image is required");
  }

  const item = await Item.create({
    owner: req.user._id,
    title,
    description,
    category,
    condition,
    images,
    estimatedValue,
    listingType,
    rentalPrice: listingType !== "barter" ? rentalPrice : undefined,
    rentalPeriod: listingType !== "barter" ? rentalPeriod : undefined,
    preferredSwapCategories: preferredSwapCategories 
      ? (typeof preferredSwapCategories === "string" ? JSON.parse(preferredSwapCategories) : preferredSwapCategories) 
      : ["any"],
    location: typeof location === "string" ? JSON.parse(location) : location,
    tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
  });

  return res.status(201).json(new ApiResponse(201, item, "Item listed successfully"));
});

export const getItems = asyncHandler(async (req, res) => {
  const {
    category,
    listingType,
    condition,
    city,
    minValue,
    maxValue,
    search,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isAvailable: true };

  if (category) query.category = category;
  if (listingType) query.listingType = listingType;
  if (condition) query.condition = condition;
  if (city) query["location.city"] = { $regex: city, $options: "i" };
  if (minValue || maxValue) {
    query.estimatedValue = {};
    if (minValue) query.estimatedValue.$gte = Number(minValue);
    if (maxValue) query.estimatedValue.$lte = Number(maxValue);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [items, total] = await Promise.all([
    Item.find(query)
      .populate("owner", "username email")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Item.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    })
  );
});

export const getItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id).populate("owner", "username email");
  if (!item) {
    throw new APIError(404, "Item not found");
  }

  item.viewCount += 1;
  await item.save();

  return res.status(200).json(new ApiResponse(200, item));
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const item = await Item.findById(id);
  if (!item) {
    throw new APIError(404, "Item not found");
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You can only update your own items");
  }

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (const file of req.files) {
      const uploadedImage = await uploadOnCloudinary(file.path);
      if (uploadedImage) {
        newImages.push(uploadedImage.url);
      }
    }
    if (newImages.length > 0) {
      updates.images = [...(item.images || []), ...newImages];
    }
  }

  if (updates.location && typeof updates.location === "string") {
    updates.location = JSON.parse(updates.location);
  }
  if (updates.tags && typeof updates.tags === "string") {
    updates.tags = JSON.parse(updates.tags);
  }
  if (updates.preferredSwapCategories && typeof updates.preferredSwapCategories === "string") {
    updates.preferredSwapCategories = JSON.parse(updates.preferredSwapCategories);
  }

  const updatedItem = await Item.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("owner", "username email");

  return res.status(200).json(new ApiResponse(200, updatedItem, "Item updated successfully"));
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id);
  if (!item) {
    throw new APIError(404, "Item not found");
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You can only delete your own items");
  }

  await Item.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, null, "Item deleted successfully"));
});

export const getMyItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, items));
});

export const getUserItems = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const items = await Item.find({ owner: userId, isAvailable: true })
    .populate("owner", "username email")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, items));
});

export const getMatchingItems = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sourceItem = await Item.findById(id);
  if (!sourceItem) {
    throw new APIError(404, "Item not found");
  }

  const matchQuery = {
    _id: { $ne: id },
    owner: { $ne: sourceItem.owner },
    isAvailable: true,
    listingType: { $in: ["barter", "both"] },
  };

  if (sourceItem.preferredSwapCategories && !sourceItem.preferredSwapCategories.includes("any")) {
    matchQuery.category = { $in: sourceItem.preferredSwapCategories };
  }

  const potentialMatches = await Item.find(matchQuery)
    .populate("owner", "username email")
    .limit(20);

  const matchedItems = potentialMatches.map((item) => {
    let score = 0;

    if (
      item.preferredSwapCategories?.includes("any") ||
      item.preferredSwapCategories?.includes(sourceItem.category)
    ) {
      score += 30;
    }

    const valueDiff = Math.abs(sourceItem.estimatedValue - item.estimatedValue);
    const valueRatio = 1 - valueDiff / Math.max(sourceItem.estimatedValue, item.estimatedValue);
    score += Math.round(valueRatio * 40);

    if (sourceItem.location?.city?.toLowerCase() === item.location?.city?.toLowerCase()) {
      score += 20;
    }

    if (sourceItem.condition === item.condition) {
      score += 10;
    }

    return {
      item,
      matchScore: Math.min(score, 100),
    };
  });

  matchedItems.sort((a, b) => b.matchScore - a.matchScore);

  return res.status(200).json(new ApiResponse(200, matchedItems));
});

export const toggleAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id);
  if (!item) {
    throw new APIError(404, "Item not found");
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You can only update your own items");
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  return res.status(200).json(
    new ApiResponse(200, item, `Item ${item.isAvailable ? "listed" : "unlisted"} successfully`)
  );
});
