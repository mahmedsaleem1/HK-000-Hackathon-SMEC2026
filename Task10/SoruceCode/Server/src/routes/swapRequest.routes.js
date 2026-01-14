import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createSwapRequest,
  getMyRequests,
  getIncomingRequests,
  respondToRequest,
  completeRequest,
  cancelRequest,
  getRequest,
} from "../controllers/swapRequest.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Specific routes first
router.get("/sent", getMyRequests);
router.get("/received", getIncomingRequests);
router.post("/", createSwapRequest);

// ID-based routes
router.get("/:id", getRequest);
router.patch("/:id/respond", respondToRequest);
router.patch("/:id/complete", completeRequest);
router.patch("/:id/cancel", cancelRequest);

export default router;
