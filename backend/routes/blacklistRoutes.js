import express from "express";
import { getBlacklistedItems } from "../controllers/blacklistController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectAdmin, getBlacklistedItems);

export default router;
