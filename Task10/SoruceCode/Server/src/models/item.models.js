import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "electronics",
        "furniture",
        "vehicles",
        "sports",
        "tools",
        "clothing",
        "books",
        "home-appliances",
        "musical-instruments",
        "outdoor-gear",
        "baby-kids",
        "other",
      ],
    },
    condition: {
      type: String,
      required: true,
      enum: ["new", "like-new", "good", "fair", "poor"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    estimatedValue: {
      type: Number,
      required: true,
      min: 0,
    },
    listingType: {
      type: String,
      required: true,
      enum: ["barter", "rental", "both"],
    },
    // For rental items
    rentalPrice: {
      type: Number,
      min: 0,
    },
    rentalPeriod: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly"],
    },
    // For barter items
    preferredSwapCategories: [
      {
        type: String,
        enum: [
          "electronics",
          "furniture",
          "vehicles",
          "sports",
          "tools",
          "clothing",
          "books",
          "home-appliances",
          "musical-instruments",
          "outdoor-gear",
          "baby-kids",
          "other",
          "any",
        ],
      },
    ],
    location: {
      city: {
        type: String,
        required: true,
      },
      area: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search
itemSchema.index({ title: "text", description: "text", tags: "text" });
itemSchema.index({ category: 1, isAvailable: 1 });
itemSchema.index({ owner: 1 });
itemSchema.index({ "location.city": 1 });

export const Item = mongoose.model("Item", itemSchema);
