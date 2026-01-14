import { Router } from "express";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getMyItems,
  getMatchingItems,
  toggleAvailability,
  getUserItems,
} from "../controllers/item.controller.js";

const router = Router();

// Protected routes (must come before /:id routes)
router.get("/user/my-items", verifyJWT, getMyItems);
router.post("/", verifyJWT, upload.array("images", 5), createItem);

// Public routes
router.get("/", getItems);
router.get("/user/:userId", getUserItems);
router.get("/:id", getItem);
router.get("/:id/matching", getMatchingItems);

// Protected routes for specific items
router.patch("/:id", verifyJWT, upload.array("images", 5), updateItem);
router.delete("/:id", verifyJWT, deleteItem);
router.patch("/:id/toggle-availability", verifyJWT, toggleAvailability);

export default router;
