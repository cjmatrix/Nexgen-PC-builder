const Cart = require("../models/Cart");
const Product = require("../models/Product");


const calculateSummary = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.base_price || 0) * Number(item.quantity),
    0
  );
  console.log(subtotal,'priceeeeeeee')

  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return {
    subtotal:subtotal/100,
    shipping:50,
    discount,
    tax: 0,
    total:total/100,
  };
};

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name base_price images category description",
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

   
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const summary = calculateSummary(cart.items);
    
    res.status(200).json({ success: true, cart,summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
     
      cart.items[itemIndex].quantity += quantity;
    } else {
      
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

   
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name base_price images category description",
    });

    const summary = calculateSummary(populatedCart.items);

    res.status(200).json({ success: true, cart: populatedCart ,summary});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name base_price images category description",
    });

    const summary = calculateSummary(populatedCart.items);
    res.status(200).json({ success: true, cart: populatedCart,summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate({
        path: "items.product",
        select: "name base_price images category description",
      });

      const summary = calculateSummary(populatedCart.items);

      res.status(200).json({ success: true, cart: populatedCart,summary });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
