import express from "express";
const router = express.Router();
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/:productId", removeFromCart);
router.put("/update", updateQuantity);

export default router;
