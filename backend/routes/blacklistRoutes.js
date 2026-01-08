import express from "express";
import { getBlacklistedItems } from "../controllers/blacklistController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getBlacklistedItems);

export default router;
