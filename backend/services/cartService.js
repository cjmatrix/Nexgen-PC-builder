import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Component from "../models/Component.js";
import AppError from "../utils/AppError.js";
import { validateCoupon } from "./couponService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const MAX_QTY_PER_PRODUCT = 5;

const calculateSummary = async (items, coupon = null) => {
  const itemCalculations = await Promise.all(
    items.map(async (item) => {
      let price = 0;
      if (item.isCustomBuild) {
        const componentIds = Object.values(item.customBuild.components).map(
          (comp) => comp.componentId,
        );
        const components = await Component.find({
          _id: { $in: componentIds },
        }).select("price");

        price = components.reduce((sum, comp) => sum + comp.price, 0);
      } else {
        price = item.product?.base_price || 0;
      }
      return price * Number(item.quantity);
    }),
  );

  const subtotal = itemCalculations.reduce((sum, val) => sum + val, 0);

  const shipping = 5000;

  const itemDiscount = items.reduce((sum, item) => {
    if (item.isCustomBuild) return sum;

    const baseprice = item.product?.base_price || 0;
    const finalprice = item.product?.final_price || 0;

    return sum + (baseprice - finalprice) * Number(item.quantity);
  }, 0);

  let couponDiscount = 0;

  const billableTotalCents = subtotal - itemDiscount;
  const billableTotalRupees = billableTotalCents / 100;

  if (coupon && coupon.isActive) {
    const minOrder = coupon.minOrderValue || 0;

    const isExpired = new Date() > new Date(coupon.expiryDate);

    if (!isExpired && billableTotalRupees >= minOrder) {
      if (coupon.discountType === "percentage") {
        couponDiscount = Math.round(
          (billableTotalRupees * coupon.discountValue) / 100,
        );

        if (
          coupon.maxDiscountAmount &&
          couponDiscount > coupon.maxDiscountAmount
        ) {
          couponDiscount = coupon.maxDiscountAmount;
        }
      } else {
        couponDiscount = coupon.discountValue;
      }

      if (couponDiscount > billableTotalRupees) {
        couponDiscount = billableTotalRupees;
      }
    }
  }

  const total = subtotal + shipping - itemDiscount - couponDiscount * 100;

  return {
    subtotal: subtotal / 100,
    shipping: shipping / 100,
    discount: itemDiscount / 100 + couponDiscount,
    tax: 0,
    total: total > 0 ? total / 100 : 0,
    couponDiscount: couponDiscount,
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
    if (item.isCustomBuild) return item.toObject();

    if (!item.product) return item;

    const product = { ...item.product.toObject() };
    return {
      _id: item._id,
      quantity: item.quantity,
      product,
      isCustomBuild: false,
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

  const processComponents = (components, qty) => {
    if (!components) return;

    Object.values(components).forEach((comp) => {
      if (comp && comp.componentId) addToMap(comp.componentId, qty);
      else if (comp && comp._id) addToMap(comp._id, qty);
    });
  };

  cartItems.forEach((item) => {
    if (item.isCustomBuild) {
      processComponents(item.customBuild.components, item.quantity);
    } else {
      const p = item.product;
      if (p && !p.isActive)
        throw new AppError(
          MESSAGES.CART.PRODUCT_UNAVAILABLE(p.name),
          HTTP_STATUS.BAD_REQUEST,
        );
      if (p && p.default_config)
        processComponents(p.default_config, item.quantity);
    }
  });

  for (const [compId, totalNeeded] of Object.entries(requiredStock)) {
    const component = await Component.findById(compId);
    if ((component && component.stock < totalNeeded) || !component.isActive) {
      if (!component.isActive) {
        throw new AppError(MESSAGES.CART.OUT_OF_STOCK, HTTP_STATUS.BAD_REQUEST);
      }

      throw new AppError(
        MESSAGES.CART.STOCK_LIMIT_EXCEEDED(
          totalNeeded,
          component.name,
          component.stock,
        ),
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
};

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select:
        "name base_price final_price applied_offer images description isActive",
    })
    .populate("coupon")
    .sort({ createdAt: 1 });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const summary = await calculateSummary(cart.items, cart.coupon);

  if (cart.discount !== summary.couponDiscount) {
    cart.discount = summary.couponDiscount;
    await cart.save();
  }

  return { cart, summary };
};

export const addToCart = async (
  userId,
  productId,
  quantity = 1,
  customBuild = null,
) => {
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: {
        path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
      },
    })
    .populate("coupon");

  let currentCart = cart;

  if (!currentCart) {
    currentCart = await Cart.create({ user: userId, items: [] });
  }
  // SCENARIO A: Adding a Custom Build
  if (customBuild) {
    currentCart.items.unshift({
      isCustomBuild: true,
      isAiBuild: customBuild.isAiBuild || false,
      customBuild: customBuild,
      quantity: quantity,
    });
  }
  // SCENARIO B: Adding a Standard Product
  else {
    const product = await Product.findById(productId).populate({
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    });

    if (!product) {
      throw new AppError(
        MESSAGES.CART.PRODUCT_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (!product.isActive) {
      throw new AppError(
        MESSAGES.CART.PRODUCT_UNAVAILABLE(product.name),
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const itemIndex = currentCart.items.findIndex(
      (item) =>
        !item.isCustomBuild &&
        item.product &&
        item.product._id.toString() === productId,
    );

    if (itemIndex > -1) {
      if (
        currentCart.items[itemIndex].quantity + quantity >
        MAX_QTY_PER_PRODUCT
      ) {
        throw new AppError(
          MESSAGES.CART.LIMIT_REACHED(MAX_QTY_PER_PRODUCT),
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      currentCart.items[itemIndex].quantity += quantity;
    } else {
      currentCart.items.unshift({ product: product, quantity });
    }
  }

  await checkStockAvailability(currentCart.items);

  await currentCart.save();

  const populatedCart = populateCart(currentCart);

  const summary = await calculateSummary(
    populatedCart.items,
    currentCart.coupon,
  );

  if (currentCart.discount !== summary.couponDiscount) {
    currentCart.discount = summary.couponDiscount;
    await currentCart.save();
    populatedCart.discount = summary.couponDiscount;
  }

  return { cart: populatedCart, summary };
};

export const removeFromCart = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: {
        path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
      },
    })
    .populate("coupon");

  

  if (!cart) {
    throw new AppError(MESSAGES.CART.CART_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  cart.items = cart.items.filter((item) => {
    const itemIdMatch = item._id.toString() === productId;
    const isCustom = item.isCustomBuild;
    const productMatch =
      !isCustom && item.product && item.product._id.toString() === productId;

    return !itemIdMatch && !productMatch;
  });

  await cart.save();

  const populatedCart = populateCart(cart);
  const summary = await calculateSummary(populatedCart.items, cart.coupon);

  if (cart.discount !== summary.couponDiscount) {
    cart.discount = summary.couponDiscount;
    await cart.save();
    populatedCart.discount = summary.couponDiscount;
  }

  return { cart: populatedCart, summary };
};

export const updateQuantity = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new AppError(MESSAGES.CART.QUANTITY_MIN, HTTP_STATUS.BAD_REQUEST);
  }

  if (quantity > MAX_QTY_PER_PRODUCT) {
    throw new AppError(
      MESSAGES.CART.LIMIT_REACHED(MAX_QTY_PER_PRODUCT),
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: {
        path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
      },
    })
    .populate("coupon");

  if (!cart) {
    throw new AppError(MESSAGES.CART.CART_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  let itemFound = false;
  // eslint-disable-next-line
  const simulatedItems = cart.items.map((item) => {
    if (!item.isCustomBuild) {
      if (item.product && item.product._id.toString() === productId) {
        itemFound = true;
        item.quantity = quantity;
      }
    } else if (item.customBuild && item._id.toString() === productId) {
      itemFound = true;
      item.quantity = quantity;
    }

    return item;
  });

  if (!itemFound) {
    throw new AppError(MESSAGES.CART.ITEM_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  await checkStockAvailability(cart.items);

  await cart.save();

  const populatedCart = populateCart(cart);
  const summary = await calculateSummary(populatedCart.items, cart.coupon);

  if (cart.discount !== summary.couponDiscount) {
    cart.discount = summary.couponDiscount;
    await cart.save();
    populatedCart.discount = summary.couponDiscount;
  }

  return { cart: populatedCart, summary };

  // const itemIndex = cart.items.findIndex(
  //   (item) =>
  //   {
  //     if(!item.customBuild){
  //       return item.product && item.product._id.toString() === productId

  //     }
  //     else
  //     {
  //       return item
  //     }

  //   }

  // );

  // if (itemIndex > -1) {
  //   cart.items[itemIndex].quantity = quantity;
  //   await cart.save();

  //   const populatedCart = populateCart(cart);
  //   const summary =await calculateSummary(populatedCart.items);
  //   return { cart: populatedCart, summary };
  // } else {
  //   throw new AppError("Item not found in cart", 404);
  // }
};

export const applyCouponToCart = async (userId, couponCode) => {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: {
        path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
      },
    })
    .populate("coupon");

  if (!cart) {
    throw new AppError(MESSAGES.CART.CART_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const currentSummary = await calculateSummary(cart.items);

  const { coupon, discountAmount } = await validateCoupon(
    couponCode,
    currentSummary.total,
    userId,
  );

  cart.coupon = coupon._id;
  cart.discount = discountAmount;

  await cart.save();

  const populatedCart = populateCart(cart);

  populatedCart.coupon = coupon;

  const summary = await calculateSummary(populatedCart.items, coupon);

  return { cart: populatedCart, summary };
};

export const removeCouponFromCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    },
  });

  if (!cart) {
    throw new AppError(MESSAGES.CART.CART_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  cart.coupon = null;
  cart.discount = 0;

  await cart.save();

  const populatedCart = populateCart(cart);
  const summary = await calculateSummary(populatedCart.items, null);

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
