import express from "express";

const router = express.Router();

import { aiController } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

router.use(protect);

router.post("/generate-pc", aiController);

export default router;
