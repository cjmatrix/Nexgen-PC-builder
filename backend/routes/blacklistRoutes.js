import express from "express";
import { getBlacklistedItems } from "../controllers/blacklistController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";
import {
  restoreComponent,
  getBlacklistItemById,
} from "../controllers/blacklistController.js";
const router = express.Router();

router.get("/", protectAdmin, getBlacklistedItems);
router.get("/:id", protectAdmin, getBlacklistItemById);
router.post("/:id/restore", protectAdmin, restoreComponent);

export default router;
