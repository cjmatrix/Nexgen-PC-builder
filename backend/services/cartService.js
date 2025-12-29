import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Component from "../models/Component.js";
import AppError from "../utils/AppError.js";
import { validateCoupon } from "./couponService.js";

const MAX_QTY_PER_PRODUCT = 5;

const calculateSummary = (items, cartDiscount = 0) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.product?.base_price || 0) * Number(item.quantity),
    0
  );

  const shipping = 5000;

  const itemDiscount = items.reduce((sum, item) => {
    const baseprice = item.product?.base_price || 0;
    const finalprice = item.product?.final_price || 0;

    return sum + (baseprice - finalprice) * Number(item.quantity);
  }, 0);


  const total = subtotal + shipping - itemDiscount - cartDiscount * 100;

  return {
    subtotal: subtotal / 100,
    shipping: shipping/100,
    discount: itemDiscount / 100 + cartDiscount,
    tax: 0,
    total: total > 0 ? total / 100 : 0,
    couponDiscount: cartDiscount,
  };
};

// const populateCart = async (cartId) => {
//   return await Cart.findById(cartId).populate({
//     path: "items.product",
//     select: "name base_price images category description discount",
//   });
// };
const populateCart = (cart) => {
  const formattedItems = cart.items.map((item) => {
    if (!item.product) return item;
    const product = { ...item.product.toObject() };
   
    return {
      _id: item._id,
      quantity: item.quantity,
      product,
    };
  });

  return {
    _id: cart._id,
    user: cart.user,
    items: formattedItems,
    coupon: cart.coupon,
    discount: cart.discount,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
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
      throw new AppError(
        `Stock Limit Exceeded: You need ${totalNeeded} of ${component.name}, but we only have ${component.stock} left.`,
        400
      );
    }
  }
};

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const summary = calculateSummary(cart.items,cart.discount);
  return { cart, summary };
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId).populate({
    path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (itemIndex > -1) {
    if (cart.items[itemIndex].quantity + 1 > MAX_QTY_PER_PRODUCT) {
      throw new AppError(
        `Limit reached: Maximum ${MAX_QTY_PER_PRODUCT} items allowed per product.`,
        400
      );
    }

    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: product, quantity });
  }

  await checkStockAvailability(cart.items);

  await cart.save();

  const populatedCart = populateCart(cart);
  const summary = calculateSummary(populatedCart.items);
  return { cart: populatedCart, summary };
};

export const removeFromCart = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  cart.items = cart.items.filter(
    (item) => item.product._id.toString() !== productId
  );

  await cart.save();

  const populatedCart = populateCart(cart);
  const summary = calculateSummary(populatedCart.items);
  return { cart: populatedCart, summary };
};

export const updateQuantity = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  if (quantity > MAX_QTY_PER_PRODUCT) {
    throw new AppError(
      `Limit reached: Maximum ${MAX_QTY_PER_PRODUCT} items allowed per product.`,
      400
    );
  }

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  let itemFound = false;
  const simulatedItems = cart.items.map((item) => {
    if (item.product._id.toString() === productId) {
      itemFound = true;
      return { ...item.toObject(), quantity: quantity, product: item.product };
    }
    return item;
  });

  if (!itemFound) {
    throw new AppError("Item not found in cart", 404);
  }

  await checkStockAvailability(simulatedItems);

  const itemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = populateCart(cart);
    const summary = calculateSummary(populatedCart.items);
    return { cart: populatedCart, summary };
  } else {
    throw new AppError("Item not found in cart", 404);
  }
};

export const applyCouponToCart = async (userId, couponCode) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  
  const currentSummary = calculateSummary(cart.items);

  const { coupon, discountAmount } = await validateCoupon(
    couponCode,
    currentSummary.subtotal, 
    userId
  );


  cart.coupon = coupon._id;
  cart.discount = discountAmount;

  await cart.save();

 
  const populatedCart = populateCart(cart);
 
  populatedCart.coupon = coupon; 

  const summary = calculateSummary(populatedCart.items, cart.discount);

  return { cart: populatedCart, summary };
};

export const removeCouponFromCart = async (userId) => {
    console.log('removeing')
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });



  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.coupon = null;
  cart.discount = 0;

  await cart.save();

  const populatedCart = populateCart(cart);
  const summary = calculateSummary(populatedCart.items, 0);

  return { cart: populatedCart, summary };
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
