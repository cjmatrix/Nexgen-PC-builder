import express from "express";
const router = express.Router();

import { generateReferral } from "../controllers/referralController.js";

import { protect } from "../middleware/authMiddleware.js";

router.post("/generate", protect, generateReferral);

export default router;
