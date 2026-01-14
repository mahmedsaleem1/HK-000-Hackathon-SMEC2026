import mongoose, { Schema } from "mongoose";

const swapRequestSchema = new Schema(
  {
    // The user making the swap/rental request
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The item they want
    requestedItem: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    // For barter: the item they're offering in exchange
    offeredItem: {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
    requestType: {
      type: String,
      required: true,
      enum: ["barter", "rental"],
    },
    // For rental requests
    rentalDetails: {
      startDate: Date,
      endDate: Date,
      totalPrice: Number,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    // Match score calculated by the system
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Response from the item owner
    ownerResponse: {
      message: String,
      respondedAt: Date,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

swapRequestSchema.index({ requester: 1, status: 1 });
swapRequestSchema.index({ requestedItem: 1, status: 1 });

export const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);
