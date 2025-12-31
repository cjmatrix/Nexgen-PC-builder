import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { addToCart } from "../services/cartService.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  const userId = req.user._id;

  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "items.product",
    select:
      "name base_price images description final_price applied_offer stock default_config",
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  res.status(200).json({
    success: true,
    data: wishlist,
  });
};

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  
  const exists = wishlist.items.find(
    (item) => item.product.toString() === productId
  );

  if (exists) {
    throw new AppError("Product already in wishlist", 400);
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

 
  await wishlist.populate({
    path: "items.product",
    select:
      "name base_price images description final_price applied_offer stock default_config",
  });

  res.status(200).json({
    success: true,
    message: "Added to wishlist",
    data: wishlist,
  });
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new AppError("Wishlist not found", 404);
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );

  await wishlist.save();

  await wishlist.populate({
    path: "items.product",
    select:
      "name base_price images description final_price applied_offer stock default_config",
  });

  res.status(200).json({
    success: true,
    message: "Removed from wishlist",
    data: wishlist,
  });
};

// Move to Cart
export const moveToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  console.log("pata")

  await addToCart(userId, productId, 1);

 
  const wishlist = await Wishlist.findOne({ user: userId });
  if (wishlist) {
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );
    await wishlist.save();
  }

  res.status(200).json({
    success: true,
    message: "Moved to cart successfully",
  });
};
