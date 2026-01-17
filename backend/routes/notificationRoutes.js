import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { streamNotifications } from "../controllers/notificationController.js";

router.get("/stream", protect, streamNotifications);

export default router;
