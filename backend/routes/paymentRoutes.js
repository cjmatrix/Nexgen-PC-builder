import express from "express";
import { getPaypalClientId } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyPayment } from "../controllers/paymentController.js";
import { getCurrencyConfig } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/paypal/config", protect, getPaypalClientId);
router.post("/paypal/verify",protect,verifyPayment);
router.get("/config",protect,getCurrencyConfig);


export default router;
    