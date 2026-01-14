import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    // The swap request this review is for
    swapRequest: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
    },
    // Who is being reviewed
    reviewedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who is writing the review
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The item involved in the transaction
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Detailed ratings
    detailedRatings: {
      itemCondition: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    // Owner's response to the review
    response: {
      text: String,
      respondedAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: true, // Only users who completed a swap can review
    },
  },
  { timestamps: true }
);

// Ensure one review per swap request per reviewer
reviewSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewedUser: 1 });
reviewSchema.index({ item: 1 });

export const Review = mongoose.model("Review", reviewSchema);
