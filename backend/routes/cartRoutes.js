import express from "express";
const router = express.Router();
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  validate,
  applyCoupon,
  removeCoupon,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);

router.post("/apply-coupon", applyCoupon);
router.delete("/remove-coupon", removeCoupon);


router.delete("/:productId", removeFromCart);
router.put("/update", updateQuantity);

router.get("/validate", protect, validate);

export default router;
