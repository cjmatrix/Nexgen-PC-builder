import * as cartService from "../services/cartService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

export const getCart = async (req, res) => {
  const result = await cartService.getCart(req.user._id);
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export const addToCart = async (req, res) => {
  const { productId, quantity, customBuild } = req.body;

  const result = await cartService.addToCart(
    req.user._id,
    productId,
    quantity,
    customBuild,
  );
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const result = await cartService.removeFromCart(req.user._id, productId);
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await cartService.updateQuantity(
    req.user._id,
    productId,
    quantity,
  );
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export const validate = async (req, res) => {
  await cartService.validateCart(req.user._id);
  res
    .status(HTTP_STATUS.OK)
    .json({ success: true, message: MESSAGES.CART.VALID_CART });
};

export const applyCoupon = async (req, res) => {
  const { couponCode } = req.body;
  const result = await cartService.applyCouponToCart(req.user._id, couponCode);
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export const removeCoupon = async (req, res) => {
  const result = await cartService.removeCouponFromCart(req.user._id);
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};
