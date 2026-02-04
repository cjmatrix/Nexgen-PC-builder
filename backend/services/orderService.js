import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Component from "../models/Component.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import Wallet from "../models/WalletTransaction.js";
import * as walletService from "../services/walletService.js";
import Blacklist from "../models/Blacklist.js";

import { PRICING } from "../constants/pricing.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";
import Redis from "ioredis";
import { redisConfig } from "../config/redis.js";

const redisPublisher = new Redis(redisConfig);

const calculateRefundAmount = (order, itemId) => {
  if (!itemId) {
    return order.totalPrice;
  }

  const item = order.orderItems.find(
    (i) => i._id.toString() === itemId.toString(),
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
      throw new AppError(MESSAGES.ORDER.CART_EMPTY, HTTP_STATUS.BAD_REQUEST);
    }

    const orderItems = [];
    const stockToDecrement = {};

    const addToStockMap = (compId, qty) => {
      if (!compId) return;
      const id = compId.toString();
      stockToDecrement[id] = (stockToDecrement[id] || 0) + Number(qty);
    };

    for (const item of cart.items) {
      if (item.isCustomBuild) {
        const cb = item.customBuild;

        const compList = Object.values(cb.components || {});
        compList.forEach((comp) => {
          if (comp && comp.componentId)
            addToStockMap(comp.componentId, item.quantity);
        });

        orderItems.push({
          name: cb.name, // "Custom PC Build"
          qty: item.quantity,
          image: cb.aiImages || "/custom-pc.png",
          price: cb.totalPrice,
          discount: 0,
          isCustomBuild: true,
          isAiBuild: item.isAiBuild || false,
          product: null,
          components: cb.components,
          aiImages: cb.aiImages,
        });
      } else {
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
          isCustomBuild: false,
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
    }

    for (const [compId, totalNeeded] of Object.entries(stockToDecrement)) {
      const updatedComponent = await Component.findOneAndUpdate(
        {
          _id: compId,
          stock: { $gte: totalNeeded },
        },
        { $inc: { stock: -totalNeeded } },
        { new: true, session },
      );

      if (!updatedComponent) {
        throw new AppError(
          MESSAGES.ORDER.STOCK_INSUFFICIENT(compId),
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }

    const itemsPrice = orderItems.reduce((acc, item) => {
      const price = item.price || 0;
      const discount = item.discount || 0;
      const discountedPrice = price * (1 - discount / 100);
      return acc + discountedPrice * item.qty;
    }, 0);

    // Dynamic Coupon Validation & Calculation
    let couponDiscount = 0;
    const billableTotalRupees = itemsPrice / 100;

    if (cart.coupon) {
      const coupon = await import("../models/Coupons.js").then((m) =>
        m.default.findById(cart.coupon._id).session(session),
      );

      if (!coupon) {
        throw new AppError(
          "Applied coupon no longer exists",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      if (!coupon.isActive)
        throw new AppError(MESSAGES.COUPON.INACTIVE, HTTP_STATUS.BAD_REQUEST);
      if (new Date() > new Date(coupon.expiryDate))
        throw new AppError(MESSAGES.COUPON.EXPIRED, HTTP_STATUS.BAD_REQUEST);
      if (coupon.usageCount >= coupon.usageLimit)
        throw new AppError(
          MESSAGES.COUPON.LIMIT_REACHED,
          HTTP_STATUS.BAD_REQUEST,
        );
      if (coupon.usedBy.includes(userId))
        throw new AppError(
          MESSAGES.COUPON.ALREADY_USED,
          HTTP_STATUS.BAD_REQUEST,
        );

      if (billableTotalRupees < coupon.minOrderValue) {
        throw new AppError(
          MESSAGES.COUPON.MIN_ORDER_VALUE(coupon.minOrderValue),
          HTTP_STATUS.BAD_REQUEST,
        );
      }

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
      if (couponDiscount > billableTotalRupees)
        couponDiscount = billableTotalRupees;

      coupon.usageCount += 1;
      coupon.usedBy.push(userId);
      await coupon.save({ session });
    }

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
      totalPrice: itemsPrice + shippingPrice + taxPrice - couponDiscount * 100, // couponDiscount is Rupees
      coupon: cart.coupon ? cart.coupon._id : null,
      couponDiscount: couponDiscount, // Rupees
      isPaid: false,
      paidAt: null,
      paymentResult: {},
    });

    if (paymentMethod === "wallet") {
      if (user.walletBalance < order.totalPrice) {
        throw new AppError(
          MESSAGES.ORDER.WALLET_BALANCE_LOW,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      await walletService.deductFunds(
        userId,
        order.totalPrice,
        "DEBIT",
        order._id,
        "Order Payment",
        session,
      );

      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const createdOrder = await order.save({ session });

    cart.items = [];
    cart.coupon = null;
    cart.discount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    redisPublisher.publish(
      "sales_updates",
      JSON.stringify({ type: "NEW_ORDER" }),
    );

    return createdOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getUserOrders = async (
  userId,
  { search, page = 1, limit = 5 },
) => {
  let query = { user: userId };

  if (search) {
    query.$or = [{ orderId: { $regex: search, $options: "i" } }];
  }

  const totalDocument = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalDocument / limit);

  const orders = await Order.find(query)
    .select(
      "orderId status totalPrice createdAt shippingAddress shippingPrice couponDiscount orderItems.image orderItems.name orderItems.qty orderItems.price orderItems.discount orderItems.isAiBuild orderItems.isCustomBuild",
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  return { orders, pagination: { totalDocument, totalPages, page } };
};

export const getOrderById = async (orderId, user) => {
  let order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate({
      path: "orderItems.product",
      select: "name images",
    });

  if (!order) {
    throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (
    user.role !== "admin" &&
    order.user._id.toString() !== user._id.toString()
  ) {
    throw new AppError(MESSAGES.ORDER.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN);
  }

  order = order.toObject();

  order.orderItems = order.orderItems.map((item) => {
    if (!item.isCustomBuild && !item.isAiBuild) {
      delete item.components;
    }
    return item;
  });

  return order;
};

export const getOrderItemDetail = async (orderId, itemId, user) => {
  const order = await Order.findById(orderId).select(
    "orderItems._id orderItems.components user",
  );

  if (!order) {
    throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (user.role !== "admin" && order.user.toString() !== user._id.toString()) {
    throw new AppError(MESSAGES.ORDER.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN);
  }

  const item = order.orderItems.find((i) => i._id.toString() === itemId);
  if (!item) {
    throw new AppError(MESSAGES.ORDER.ITEM_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return item.components;
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
    .select(
      "orderId user userName totalPrice status isPaid createdAt paymentMethod",
    )
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
    throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (order.status === "Delivered" || order.status === "Cancelled") {
    throw new AppError(
      MESSAGES.ORDER.STATUS_CHANGE_ERROR(order.status),
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  order.status = status;

  if (status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
  }

  if (status === "Paid") {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updatedOrder = await order.save();

  if (status === "Delivered" || status === "Paid") {
    try {
      await redisPublisher.publish(
        "sales_updates",
        JSON.stringify({ type: "STATUS_UPDATE" }),
      );
    } catch (error) {
      console.error("Redis Publish Error:", error);
    }
  }

  return updatedOrder;
};

export const cancelOrder = async (orderId, itemId, reason, currentUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId)
      .populate("coupon")
      .session(session);

    if (!order) {
      throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      currentUser.role !== "admin" &&
      order.user.toString() !== currentUser._id.toString()
    ) {
      throw new AppError(MESSAGES.ORDER.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN);
    }

    if (
      order.status === "Shipped" ||
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      throw new AppError(
        MESSAGES.ORDER.CANCEL_STATUS_ERROR(order.status),
        HTTP_STATUS.BAD_REQUEST,
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

      if (!item) {
        throw new AppError(
          MESSAGES.ORDER.ITEM_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      if (
        order.coupon &&
        order.coupon.minOrderValue &&
        order.orderItems.length > 1
      ) {
        const itemEffectivePrice =
          item.price * (1 - (item.discount || 0) / 100);
        const itemTotal = itemEffectivePrice * item.qty;

        const currentBillableTotal =
          order.itemsPrice + order.shippingPrice + order.taxPrice;

        const remainingTotal = currentBillableTotal - itemTotal;

        if (remainingTotal < order.coupon.minOrderValue * 100) {
          throw new AppError(
            MESSAGES.ORDER.COUPON_LIMIT_ERROR(
              remainingTotal / 100,
              order.coupon.minOrderValue,
            ),
            HTTP_STATUS.BAD_REQUEST,
          );
        }
      }

      let amount = calculateRefundAmount(order, itemId);

      const otherActiveItems = order.orderItems.filter(
        (i) => i.status !== "Cancelled" && i._id.toString() !== itemId,
      );

      if (otherActiveItems.length === 0) {
        amount += order.shippingPrice || 0;
      }

      if (order.isPaid) {
        await walletService.addFunds(
          order.user,
          amount,
          "CREDIT",
          order._id,
          `Refund for Order Cancellation of ${item.name}`,
          session,
        );
      }

      if (item.status === "Cancelled") {
        throw new AppError(
          MESSAGES.ORDER.ALREADY_CANCELLED,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      await restoreStock(item);
      item.status = "Cancelled";
      item.cancellationReason = reason;

      const allCancelled = order.orderItems.every(
        (i) => i.status === "Cancelled",
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
          order.user,
          refundSum,
          "CREDIT",
          order._id,
          `Refund for Order Cancellation of ${order.orderItems
            .filter((i) => i.status !== "Cancelled")
            .map((i) => i.name)
            .join(", ")}`,
          session,
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

export const requestReturn = async (orderId, itemId, reason, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!reason) {
      throw new AppError(
        MESSAGES.ORDER.RETURN_REASON_REQUIRED,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session,
    );

    if (!order) {
      throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (order.status !== "Delivered" && order.status !== "Return Requested") {
      throw new AppError(
        MESSAGES.ORDER.RETURN_STATUS_ERROR,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new AppError(
          MESSAGES.ORDER.ITEM_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      if (
        item.status === "Returned" ||
        item.status === "Return Requested" ||
        item.status === "Return Approved"
      ) {
        throw new AppError(
          MESSAGES.ORDER.RETURN_ALREADY_REQUESTED,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      item.status = "Return Requested";
      item.returnReason = reason;

      const allRequested = order.orderItems.every(
        (i) =>
          i.status === "Return Requested" ||
          i.status === "Cancelled" ||
          i.status === "Returned",
      );
      if (allRequested) {
        order.status = "Return Requested";
      }
    } else {
      for (const item of order.orderItems) {
        if (
          item.status !== "Returned" &&
          item.status !== "Cancelled" &&
          item.status !== "Return Requested" &&
          item.status !== "Return Approved"
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

export const approveReturn = async (
  orderId,
  itemId,
  userId,
  addToBlacklist,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
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
        order.user,
        amount,
        "CREDIT",
        order._id,
        `Refund for Order return of ${item.name}`,
        session,
      );

      if (!item) {
        throw new AppError(
          MESSAGES.ORDER.ITEM_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      if (item.status !== "Return Requested") {
        throw new AppError(
          MESSAGES.ORDER.RETURN_NOT_REQUESTED,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      if (addToBlacklist) {
        const components = [
          { type: "cpu", componentId: item.components.cpu.componentId },
          { type: "gpu", componentId: item.components.gpu.componentId },
          {
            type: "motherboard",
            componentId: item.components.motherboard.componentId,
          },
          { type: "ram", componentId: item.components.ram.componentId },
          { type: "storage", componentId: item.components.storage.componentId },
          { type: "case", componentId: item.components.case.componentId },
          { type: "psu", componentId: item.components.psu.componentId },
          { type: "cooler", componentId: item.components.cooler.componentId },
        ];

        await Blacklist.create(
          [
            {
              productName: item.name,
              productId: item.product,
              orderId: order._id,
              itemId: item._id,
              quantity: item.qty,
              reason: item.returnReason || "Damaged/Defective",
              components,
            },
          ],
          { session },
        );
      } else {
        await restoreStock(item);
      }
      item.status = "Return Approved";

      const allReturned = order.orderItems.every(
        (i) => i.status === "Return Approved" || i.status === "Cancelled",
      );
      if (allReturned) {
        order.status = "Return Approved";
        order.isReturned = true;
      }
    } else {
      let refundSum = 0;
      if (order.status !== "Return Requested") {
        const hasRequestedItems = order.orderItems.some(
          (i) => i.status === "Return Requested",
        );
        if (!hasRequestedItems) {
          throw new AppError(
            MESSAGES.ORDER.ORDER_RETURN_NOT_REQUESTED,
            HTTP_STATUS.BAD_REQUEST,
          );
        }
      }

      for (const item of order.orderItems) {
        if (item.status === "Return Requested") {
          refundSum += calculateRefundAmount(order, item._id);

          if (addToBlacklist) {
            await Blacklist.create(
              [
                {
                  productName: item.name,
                  productId: item.product,
                  orderId: order.orderId,
                  reason: item.returnReason || "Damaged/Defective",
                  components: item.components,
                },
              ],
              { session },
            );
          } else {
            await restoreStock(item);
          }
          item.status = "Return Approved";
        }
      }

      const allReturned = order.orderItems.every(
        (i) => i.status === "Return Approved" || i.status === "Cancelled",
      );
      if (allReturned) {
        order.status = "Return Approved";
        order.isReturned = true;
      }

      await walletService.addFunds(
        order.user,
        refundSum,
        "CREDIT",
        order._id,
        `Refund for Order return of ${order.orderItems
          .filter((i) => i.status === "Return Approved")
          .map((i) => i.name)
          .join(", ")}`,
        session,
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
      throw new AppError(MESSAGES.ORDER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new AppError(
          MESSAGES.ORDER.ITEM_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      if (item.status !== "Return Requested") {
        throw new AppError(
          MESSAGES.ORDER.RETURN_NOT_REQUESTED,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      item.status = "Return Rejected";

      if (order.status === "Return Requested") {
        const otherRequested = order.orderItems.some(
          (i) => i.status === "Return Requested" && i._id.toString() !== itemId,
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
