import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Component from "../models/Component.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createOrder = async (userId, user, orderData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { shippingAddress, paymentMethod } = orderData;

    const shippingPrice = 5000;
    const taxPrice = 0;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: {
          path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
        },
      })
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
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
        discount: product.discount || 0,
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
        throw new Error(
          `Stock insufficient for component ID: ${compId}. Found while processing.`
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
      totalPrice: itemsPrice + shippingPrice + taxPrice,
    });

    const createdOrder = await order.save({ session });

    cart.items = [];
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
    throw new Error("Order not found");
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
    throw new Error("Order not found");
  }

  if (order.status === "Delivered" || order.status === "Cancelled") {
    throw new Error(`Cannot change status of a ${order.status} order.`);
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

export const cancelOrder = async (orderId, itemId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (
      order.status === "Shipped" ||
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
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
        throw new Error("Item not found in order");
      }

      if (item.status === "Cancelled") {
        throw new Error("Item already cancelled");
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
      for (const item of order.orderItems) {
        if (item.status !== "Cancelled") {
          await restoreStock(item);
          item.status = "Cancelled";
          item.cancellationReason = reason;
        }
      }
      order.status = "Cancelled";
      order.cancellationReason = reason;
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
      throw new Error("Return reason is mandatory");
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "Delivered" && order.status !== "Return Requested") {
      throw new Error("Can only request return for delivered orders");
    }

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      if (
        item.status === "Returned" ||
        item.status === "Return Requested" ||
        item.status === "Return Approved"
      ) {
        throw new Error("Return already requested or processed for item");
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

export const approveReturn = async (orderId, itemId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error("Order not found");
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
      if (!item) {
        throw new Error("Item not found");
      }

      if (item.status !== "Return Requested") {
        throw new Error("Item is not in Return Requested state");
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
      if (order.status !== "Return Requested") {
        const hasRequestedItems = order.orderItems.some(
          (i) => i.status === "Return Requested"
        );
        if (!hasRequestedItems) {
          throw new Error("Order is not in Return Requested state");
        }
      }

      for (const item of order.orderItems) {
        if (item.status === "Return Requested") {
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
      throw new Error("Order not found");
    }

    if (itemId) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      if (item.status !== "Return Requested") {
        throw new Error("Item is not in Return Requested state");
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
