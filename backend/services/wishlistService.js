import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { addToCart } from "./cartService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "items.product",
    select:
      "name base_price images description final_price applied_offer stock default_config",
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  return wishlist;
};

const addToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(MESSAGES.PRODUCT.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  const exists = wishlist.items.find(
    (item) => item.product.toString() === productId,
  );

  if (exists) {
    throw new AppError(
      MESSAGES.WISHLIST.ALREADY_EXISTS,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

  await wishlist.populate({
    path: "items.product",
    select:
      "name base_price images description final_price applied_offer stock default_config",
  });

  return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new AppError(MESSAGES.WISHLIST.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await wishlist.save();

  await wishlist.populate({
    path: "items.product",
    select:
      "name base_price images description final_price applied_offer stock default_config",
  });

  return wishlist;
};

const moveToCart = async (userId, productId) => {
  await addToCart(userId, productId, 1);

  const wishlist = await Wishlist.findOne({ user: userId });
  if (wishlist) {
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await wishlist.save();
  }
};

export { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
