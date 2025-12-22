import * as cartService from "../services/cartService.js";

const MAX_QTY_PER_PRODUCT=5;

export const getCart = async (req, res) => {
  try {
    const result = await cartService.getCart(req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity > MAX_QTY_PER_PRODUCT) {
       return res.status(400).json({ 
         message: `You cannot add more than ${MAX_QTY_PER_PRODUCT} of this item.` 
       });
    }

    const result = await cartService.addToCart(
      req.user._id,
      productId,
      quantity
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Stock Limit Exceeded")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message});
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await cartService.removeFromCart(req.user._id, productId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    if (error.message === "Cart not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const result = await cartService.updateQuantity(
      req.user._id,
      productId,
      quantity
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    if (error.message === "Quantity must be at least 1") {
      return res.status(400).json({ message: error.message });
    }
    if (
      error.message === "Cart not found" ||
      error.message === "Item not found in cart"
    ) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Stock Limit Exceeded")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validate = async (req, res) => {
  try {
    await cartService.validateCart(req.user._id);
    res.status(200).json({ success: true, message: "valid" });
  } catch (error) {
    if (error.message.includes("Stock Limit Exceeded")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
