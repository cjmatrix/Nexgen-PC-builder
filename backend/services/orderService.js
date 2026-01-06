import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Component from "../models/Component.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import Wallet from "../models/WalletTransaction.js";
import * as walletService from "../services/walletService.js";

import { PRICING } from "../constants/pricing.js";

const calculateRefundAmount = (order, itemId) => {
  if (!itemId) {
    return order.totalPrice;
  }

  const item = order.orderItems.find(
    (i) => i._id.toString() === itemId.toString()
  );
  if (!item) return 0;

  const itemPriceAfterOffer = item.price * (1 - (item.discount || 0) / 100);
  const itemEffectiveTotal = itemPriceAfterOffer * item.qty;

  if (!order.couponDiscount || order.couponDiscount === 0) {
    return Math.round(itemEffectiveTotal);
  }

  const totalItemsPrice = order.orderItems.reduce((acc, i) => {
    const effectivePrice = i.price * (1 - (i.discount || 0) / 100);
    return acc + effectivePrice * i.qty;
  }, 0);

  if (totalItemsPrice === 0) return 0;

  const itemShareParams = itemEffectiveTotal / totalItemsPrice;
  const proRatedDiscount = order.couponDiscount * 100 * itemShareParams;

  return Math.round(itemEffectiveTotal - proRatedDiscount);
};

export const createOrder = async (userId, user, orderData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { shippingAddress, paymentMethod } = orderData;

    const shippingPrice = PRICING.SHIPPING_CHARGE;
    const taxPrice = PRICING.TAX_CHARGE;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: {
          path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
        },
      })
      .populate("coupon")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    const orderItems = [];
    const stockToDecrement = {};

    const addToStockMap = (compId, qty) => {
      if (!compId) return;
      const id = compId.toString();
      stockToDecrement[id] = (stockToDecrement[id] || 0) + Number(qty);
    };

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.default_config) continue;

      const createSnapshot = (comp) => {
        if (!comp) return null;
        return {
          componentId: comp._id,
          name: comp.name,
          price: comp.price,
          image: comp.images?.[0] || "https://placehold.co/100",
          specs: comp.specs || {},
        };
      };

      const config = product.default_config;
      const compList = [
        config.cpu,
        config.gpu,
        config.motherboard,
        config.ram,
        config.storage,
        config.case,
        config.psu,
        config.cooler,
      ];
      compList.forEach((c) => {
        if (c && c._id) addToStockMap(c._id, item.quantity);
      });

      orderItems.push({
        name: product.name,
        qty: item.quantity,
        image: product.images?.[0] || "https://placehold.co/100",
        price: product.base_price,
        discount: product.applied_offer || 0,
        product: product._id,
        components: {
          cpu: createSnapshot(config.cpu),
          gpu: createSnapshot(config.gpu),
          motherboard: createSnapshot(config.motherboard),
          ram: createSnapshot(config.ram),
          storage: createSnapshot(config.storage),
          case: createSnapshot(config.case),
          psu: createSnapshot(config.psu),
          cooler: createSnapshot(config.cooler),
        },
      });
    }

    for (const [compId, totalNeeded] of Object.entries(stockToDecrement)) {
      const updatedComponent = await Component.findOneAndUpdate(
        {
          _id: compId,
          stock: { $gte: totalNeeded },
        },
        { $inc: { stock: -totalNeeded } },
        { new: true, session }
      );

      if (!updatedComponent) {
        throw new AppError(
          `Stock insufficient for component ID: ${compId}. Found while processing.`,
          400
        );
      }
    }

    const itemsPrice = orderItems.reduce((acc, item) => {
      const price = item.price || 0;
      const discount = item.discount || 0;
      const discountedPrice = price * (1 - discount / 100);
      return acc + discountedPrice * item.qty;
    }, 0);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${dateStr}-${randomStr}`;

    const order = new Order({
      user: userId,
      userName: user.name,
      userEmail: user.email,
      orderId,
      orderItems: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice:
        itemsPrice + shippingPrice + taxPrice - (cart.discount * 100 || 0),
      coupon: cart.coupon,
      couponDiscount: cart.discount || 0,
      isPaid: false,
      paidAt: null,
      paymentResult: {},
    });

    const createdOrder = await order.save({ session });
    if (cart.coupon) {
      cart.coupon.usageCount += 1;
      cart.coupon.usedBy.push(userId);
      await cart.coupon.save({ session });
    }
    cart.items = [];
    cart.coupon = null;
    cart.discount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return createdOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getUserOrders = async (
  userId,
  { search, page = 1, limit = 5 }
) => {
  let query = { user: userId };

  if (search) {
    query.$or = [{ orderId: { $regex: search, $options: "i" } }];
  }

  const totalDocument = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalDocument / limit);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  return { orders, pagination: { totalDocument, totalPages, page } };
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate({
      path: "orderItems.product",
      select: "name images",
    });

  if (!order) {
    throw new AppError("Order not found", 404);
  }
  return order;
};

export const getAllOrders = async ({
  page = 1,
  limit = 10,
  search,
  status,
}) => {
  const pageSize = Number(limit);
  const pageNum = Number(page);

  const keyword = search
    ? {
        $or: [
          {
            _id: mongoose.isValidObjectId(search) ? search : null,
          },
        ].filter(Boolean),
      }
    : {};

  if (status && status !== "All") {
    keyword.status = status;
  }

  if (search) {
    keyword.$or.push({
      userName: { $regex: search, $options: "i" },
    });
    keyword.$or.push({
      userEmail: { $regex: search, $options: "i" },
    });
  }

  const count = await Order.countDocuments({ ...keyword });
  const orders = await Order.find({ ...keyword })
    .populate("user", "id name email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (pageNum - 1));

  return {
    orders,
    page: pageNum,
    pages: Math.ceil(count / pageSize),
    total: count,
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status === "Delivered" || order.status === "Cancelled") {
    throw new AppError(`Cannot change status of a ${order.status} order.`, 400);
  }

  order.status = status;

  if (status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  if (status === "Paid") {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updatedOrder = await order.save();
  return updatedOrder;
};

export const cancelOrder = async (orderId, itemId, reason, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (
      order.status === "Shipped" ||
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      throw new AppError(
        `Cannot cancel order with status: ${order.status}`,
        400
      );
    }

    const restoreStock = async (item) => {
      if (item.status === "Cancelled") return;

      const compList = [
        item.components.cpu.componentId,
        item.components.gpu.componentId,
        item.components.motherboard.componentId,
        item.components.ram.componentId,
        item.components.storage.componentId,
        item.components.case.componentId,
        item.components.psu.componentId,
        item.components.cooler.componentId,
      ];

      for (const compId of compList) {
        if (compId) {
          await Component.findByIdAndUpdate(compId, {
            $inc: { stock: item.qty },
          }).session(session);
        }
      }
    };

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);

      let amount = calculateRefundAmount(order, itemId);
    
      
      const otherActiveItems = order.orderItems.filter(
        (i) => i.status !== "Cancelled" && i._id.toString() !== itemId
      );

      if (otherActiveItems.length === 0) {
        amount += order.shippingPrice || 0;
      }
      
      if (order.isPaid) {
        await walletService.addFunds(
          userId,
          amount,
          "CREDIT",
          order._id,
          `Refund for Order Cancellation of ${item.name}`,
          session
        );
      }

      if (!item) {
        throw new AppError("Item not found in order", 404);
      }

      if (item.status === "Cancelled") {
        throw new AppError("Item already cancelled", 400);
      }

      await restoreStock(item);
      item.status = "Cancelled";
      item.cancellationReason = reason;

      const allCancelled = order.orderItems.every(
        (i) => i.status === "Cancelled"
      );
      if (allCancelled) {
        order.status = "Cancelled";
        order.cancellationReason = "All items cancelled";
      }
    } else {
      let refundSum = 0;
      for (const item of order.orderItems) {
        if (item.status !== "Cancelled") {
          refundSum += calculateRefundAmount(order, item._id);
          await restoreStock(item);
          item.status = "Cancelled";
          item.cancellationReason = reason;
        }
      }
      order.status = "Cancelled";
      order.cancellationReason = reason;

      if (order.isPaid) {
        await walletService.addFunds(
          userId,
          refundSum,
          "CREDIT",
          order._id,
          "Refund for Order Cancellation",
          session
        );
      }
    }

    const updatedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const requestReturn = async (orderId, itemId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!reason) {
      throw new AppError("Return reason is mandatory", 400);
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "Delivered" && order.status !== "Return Requested") {
      throw new AppError("Can only request return for delivered orders", 400);
    }

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new AppError("Item not found", 404);
      }

      if (
        item.status === "Returned" ||
        item.status === "Return Requested" ||
        item.status === "Return Approved"
      ) {
        throw new AppError(
          "Return already requested or processed for item",
          400
        );
      }

      item.status = "Return Requested";
      item.returnReason = reason;

      const allRequested = order.orderItems.every(
        (i) =>
          i.status === "Return Requested" ||
          i.status === "Cancelled" ||
          i.status === "Returned"
      );
      if (allRequested) {
        order.status = "Return Requested";
      }
    } else {
      for (const item of order.orderItems) {
        if (
          item.status !== "Returned" &&
          item.status !== "Cancelled" &&
          item.status !== "Return Requested"
        ) {
          item.status = "Return Requested";
          item.returnReason = reason;
        }
      }
      order.status = "Return Requested";
      order.returnReason = reason;
    }

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const approveReturn = async (orderId, itemId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const restoreStock = async (item) => {
      const compList = [
        item.components.cpu.componentId,
        item.components.gpu.componentId,
        item.components.motherboard.componentId,
        item.components.ram.componentId,
        item.components.storage.componentId,
        item.components.case.componentId,
        item.components.psu.componentId,
        item.components.cooler.componentId,
      ];

      for (const compId of compList) {
        if (compId) {
          await Component.findByIdAndUpdate(compId, {
            $inc: { stock: item.qty },
          }).session(session);
        }
      }
    };

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      const amount = calculateRefundAmount(order, itemId);

      await walletService.addFunds(
        userId,
        amount,
        "CREDIT",
        order._id,
        "Refund for Order return",
        session
      );

      if (!item) {
        throw new AppError("Item not found", 404);
      }

      if (item.status !== "Return Requested") {
        throw new AppError("Item is not in Return Requested state", 400);
      }

      await restoreStock(item);
      item.status = "Return Approved";

      const allReturned = order.orderItems.every(
        (i) => i.status === "Return Approved" || i.status === "Cancelled"
      );
      if (allReturned) {
        order.status = "Return Approved";
        order.isReturned = true;
      }
    } else {
      let refundSum = 0;
      if (order.status !== "Return Requested") {
        const hasRequestedItems = order.orderItems.some(
          (i) => i.status === "Return Requested"
        );
        if (!hasRequestedItems) {
          throw new AppError("Order is not in Return Requested state", 400);
        }
      }

      for (const item of order.orderItems) {
        if (item.status === "Return Requested") {
          refundSum += calculateRefundAmount(order, item._id);

          await restoreStock(item);
          item.status = "Return Approved";
        }
      }

      const allReturned = order.orderItems.every(
        (i) => i.status === "Return Approved" || i.status === "Cancelled"
      );
      if (allReturned) {
        order.status = "Return Approved";
        order.isReturned = true;
      }

      await walletService.addFunds(
        userId,
        refundSum,
        "CREDIT",
        order._id,
        "Refund for Order return",
        session
      );
    }

    const updatedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const rejectReturn = async (orderId, itemId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new AppError("Item not found", 404);
      }

      if (item.status !== "Return Requested") {
        throw new AppError("Item is not in Return Requested state", 400);
      }

      item.status = "Return Rejected";

      if (order.status === "Return Requested") {
        const otherRequested = order.orderItems.some(
          (i) => i.status === "Return Requested" && i._id.toString() !== itemId
        );
        if (!otherRequested) {
          order.status = "Delivered";
        }
      }
    } else {
      for (const item of order.orderItems) {
        if (item.status === "Return Requested") {
          item.status = "Return Rejected";
        }
      }
      if (order.status === "Return Requested") {
        order.status = "Delivered";
      }
    }

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
