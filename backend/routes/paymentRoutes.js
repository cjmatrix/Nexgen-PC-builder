import express from "express";
import { getPaypalClientId } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/paypal", protect, getPaypalClientId);

export default router;
    