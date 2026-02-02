import * as wishlistService from "../services/wishlistService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: wishlist,
  });
};

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.addToWishlist(req.user._id, productId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.WISHLIST.ADDED,
    data: wishlist,
  });
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const wishlist = await wishlistService.removeFromWishlist(
    req.user._id,
    productId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.WISHLIST.REMOVED,
    data: wishlist,
  });
};

// Move to Cart
export const moveToCart = async (req, res) => {
  const { productId } = req.body;
  await wishlistService.moveToCart(req.user._id, productId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.WISHLIST.MOVED_TO_CART,
  });
};
