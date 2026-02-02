import express from "express";
import { getWalletDetails } from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWalletDetails);

export default router;
