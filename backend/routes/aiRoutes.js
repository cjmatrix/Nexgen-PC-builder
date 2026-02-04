import express from "express";

const router = express.Router();

import { aiController } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimitMiddleware.js";

router.use(protect);
// router.use(aiLimiter);

router.post("/generate-pc", aiController);

export default router;
