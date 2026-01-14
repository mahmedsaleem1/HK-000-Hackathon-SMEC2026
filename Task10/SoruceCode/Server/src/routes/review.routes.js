import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createReview,
  getUserReviews,
  getItemReviews,
  respondToReview,
  getMyWrittenReviews,
  getReviewsAboutMe,
  canReview,
} from "../controllers/review.controller.js";

const router = Router();

// Public routes
router.get("/user/:userId", getUserReviews);
router.get("/item/:itemId", getItemReviews);

// Protected routes
router.use(verifyJWT);
router.post("/", createReview);
router.patch("/:id/respond", respondToReview);
router.get("/my-reviews", getMyWrittenReviews);
router.get("/about-me", getReviewsAboutMe);
router.get("/can-review/:swapRequestId", canReview);

export default router;
