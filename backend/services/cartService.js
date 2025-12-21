import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Component from "../models/Component.js";

const calculateSummary = (items) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.product?.base_price || 0) * Number(item.quantity),
    0
  );

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

const populateCart = async (cartId) => {
  return await Cart.findById(cartId).populate({
    path: "items.product",
    select: "name base_price images category description",
  });
};

const checkStockAvailability = async (cartItems, newItem = null) => {
  const requiredStock = {};
  const addToMap = (compId, qty) => {
    if (!compId) return;
    const id = compId.toString();
    requiredStock[id] = (requiredStock[id] || 0) + Number(qty);
  };

  cartItems.forEach((item) => {
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

  if (newItem) {
    const { product, quantity } = newItem;
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
  }

  for (const [compId, totalNeeded] of Object.entries(requiredStock)) {
    const component = await Component.findById(compId);
    if (component && component.stock < totalNeeded) {
      throw new Error(
        `Stock Limit Exceeded: You need ${totalNeeded} of ${component.name}, but we only have ${component.stock} left.`
      );
    }
  }
};

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name base_price images category description",
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

 

  const summary = calculateSummary(cart.items);
  return { cart, summary };
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId).populate({
    path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
  });

  if (!product) {
    throw new Error("Product not found");
  }

 
  const cartForValidation = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  const currentItems = cartForValidation ? cartForValidation.items : [];

 
  await checkStockAvailability(currentItems, { product, quantity });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
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

  const populatedCart = await populateCart(cart._id);
  const summary = calculateSummary(populatedCart.items);
  return { cart: populatedCart, summary };
};

export const removeFromCart = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  const populatedCart = await populateCart(cart._id);
  const summary = calculateSummary(populatedCart.items);
  return { cart: populatedCart, summary };
};

export const updateQuantity = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }


  const cartForValidation = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cartForValidation) {
    throw new Error("Cart not found");
  }

 
  let itemFound = false;
  const simulatedItems = cartForValidation.items.map((item) => {
    if (item.product._id.toString() === productId) {
      itemFound = true;
      return { ...item.toObject(), quantity: quantity, product: item.product };
    }
    return item;
  });

  if (!itemFound) {
    throw new Error("Item not found in cart");
  }


  await checkStockAvailability(simulatedItems);


  let cart = await Cart.findOne({ user: userId });
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await populateCart(cart._id);
    const summary = calculateSummary(populatedCart.items);
    return { cart: populatedCart, summary };
  } else {
    throw new Error("Item not found in cart");
  }
};

export const validateCart = async (userId) => {
  const cartForValidation = await Cart.findOne({
    user: userId,
  }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (cartForValidation) {
    await checkStockAvailability(cartForValidation.items);
  }

  return true;
};
