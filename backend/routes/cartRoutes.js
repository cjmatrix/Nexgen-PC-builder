const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/:productId", removeFromCart);
router.put("/update", updateQuantity);

module.exports = router;
