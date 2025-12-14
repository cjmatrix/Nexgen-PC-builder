import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Component from "../models/Component.js";

const calculateSummary = (items) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.product?.base_price || 0) * Number(item.quantity),
    0
  );
  console.log(subtotal, "priceeeeeeee");

  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return {
    subtotal: subtotal / 100,
    shipping: 50,
    discount,
    tax: 0,
    total: total / 100,
  };
};

export const getCart = async (req, res) => {
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

    res.status(200).json({ success: true, cart, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
   
    const product = await Product.findById(productId).populate({
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

   
    const cartForValidation = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      populate: {
        path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
      },
    });

   
    const requiredStock = {};
    const addToMap = (compId, qty) => {
      if (!compId) return;
      const id = compId.toString();
      requiredStock[id] = (requiredStock[id] || 0) + Number(qty);
    };

   
    if (cartForValidation) {
      cartForValidation.items.forEach((item) => {
        const p = item.product;
        if (p && p.default_config) {
          const allComps = [
            p.default_config.cpu,
            p.default_config.gpu,
            p.default_config.motherboard,
            p.default_config.ram,
            p.default_config.storage,
            p.default_config.case,
            p.default_config.psu,
            p.default_config.cooler,
          ];
          allComps.forEach((c) => {
            if (c && c._id) addToMap(c._id, item.quantity);
          });
        }
      });
    }

 
    if (product.default_config) {
      const newComps = [
        product.default_config.cpu,
        product.default_config.gpu,
        product.default_config.motherboard,
        product.default_config.ram,
        product.default_config.storage,
        product.default_config.case,
        product.default_config.psu,
        product.default_config.cooler,
      ];
      newComps.forEach((c) => {
        if (c && c._id) addToMap(c._id, quantity);
      });
    }

  
    for (const [compId, totalNeeded] of Object.entries(requiredStock)) {
      const component = await Component.findById(compId);
      if (component && component.stock < totalNeeded) {
        return res.status(400).json({
          success: false,
          message: `Stock Limit Exceeded: You need ${totalNeeded} of ${component.name} (Cart + New), but we only have ${component.stock} left.`,
        });
      }
    }

   
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

    res.status(200).json({ success: true, cart: populatedCart, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const removeFromCart = async (req, res) => {
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
    res.status(200).json({ success: true, cart: populatedCart, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

 
    const cartForValidation = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      populate: {
        path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
      },
    });

    if (!cartForValidation) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

  
    const requiredStock = {};
    const addToMap = (compId, qty) => {
      if (!compId) return;
      const id = compId.toString();
      requiredStock[id] = (requiredStock[id] || 0) + Number(qty);
    };

    let itemFound = false;
    cartForValidation.items.forEach((item) => {
      const p = item.product;
      const qtyToCount =
        item.product._id.toString() === productId ? quantity : item.quantity;

      if (item.product._id.toString() === productId) itemFound = true;

      if (p && p.default_config) {
        const allComps = [
          p.default_config.cpu,
          p.default_config.gpu,
          p.default_config.motherboard,
          p.default_config.ram,
          p.default_config.storage,
          p.default_config.case,
          p.default_config.psu,
          p.default_config.cooler,
        ];
        allComps.forEach((c) => {
          if (c && c._id) addToMap(c._id, qtyToCount);
        });
      }
    });

    if (!itemFound) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    
    for (const [compId, totalNeeded] of Object.entries(requiredStock)) {
      const component = await Component.findById(compId);
      if (component && component.stock < totalNeeded) {
        return res.status(400).json({
          success: false,
          message: `Stock Limit Exceeded: You need ${totalNeeded} of ${component.name} (Cart + Update), but we only have ${component.stock} left.`,
        });
      }
    }

    
    let cart = await Cart.findOne({ user: req.user._id });

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

      res.status(200).json({ success: true, cart: populatedCart, summary });
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
