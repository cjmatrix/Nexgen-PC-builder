import * as cartService from "../services/cartService.js";

export const getCart = async (req, res) => {
  const result = await cartService.getCart(req.user._id);
  res.status(200).json({ success: true, ...result });
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const result = await cartService.addToCart(req.user._id, productId, quantity);
  res.status(200).json({ success: true, ...result });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const result = await cartService.removeFromCart(req.user._id, productId);
  res.status(200).json({ success: true, ...result });
};

export const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await cartService.updateQuantity(
    req.user._id,
    productId,
    quantity
  );
  res.status(200).json({ success: true, ...result });
};

export const validate = async (req, res) => {
  await cartService.validateCart(req.user._id);
  res.status(200).json({ success: true, message: "valid" });
};
