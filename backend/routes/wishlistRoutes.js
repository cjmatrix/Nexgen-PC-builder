import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.use(protect); 

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);
router.post("/move-to-cart", moveToCart);

export default router;
