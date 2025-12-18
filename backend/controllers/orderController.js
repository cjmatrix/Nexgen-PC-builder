import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Component from "../models/Component.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      shippingAddress,
      paymentMethod,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        populate: {
          path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
        },
      })
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cart is empty" });
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

    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${dateStr}-${randomStr}`;

    const order = new Order({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
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

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({
      message: "Order Failed: " + error.message,
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { user: req.user._id };

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },

        // { "orderItems.name": { $regex: search, $options: "i" } }
      ];
    }

    const orders = await Order.find(query).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.search
      ? {
          $or: [
            {
              _id: mongoose.isValidObjectId(req.query.search)
                ? req.query.search
                : null,
            },
          ].filter(Boolean),
        }
      : {};

    if (req.query.status && req.query.status !== "All") {
      keyword.status = req.query.status;
    }

    // if (req.query.search && !keyword.$or?.length) {

    //   const users = await User.find({
    //     $or: [
    //       { name: { $regex: req.query.search, $options: "i" } },
    //       { email: { $regex: req.query.search, $options: "i" } },
    //     ],
    //   }).select("_id");

    //   const userIds = users.map((u) => u._id);
    //   keyword.user = { $in: userIds };
    // }

    if (req.query.search) {
      keyword.$or.push({
        userName: { $regex: req.query.search, $options: "i" },
      });
      keyword.$or.push({
        userEmail: { $regex: req.query.search, $options: "i" },
      });
    }

    console.log(keyword);
    const count = await Order.countDocuments({ ...keyword });
    const orders = await Order.find({ ...keyword })
      .populate("user", "id name email")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res
        .status(400)
        .json({ message: `Cannot change status of a ${order.status} order.` });
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
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { itemId, reason } = req.body;
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.status === "Shipped" ||
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: `Cannot cancel order with status: ${order.status}` });
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
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Item not found in order" });
      }

      if (item.status === "Cancelled") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Item already cancelled" });
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

    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const returnOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { itemId, reason } = req.body;
    if (!reason) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Return reason is mandatory" });
    }

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Can only return delivered orders" });
    }

    const restoreStock = async (item) => {
      if (item.status === "Returned" || item.status === "Cancelled") return;

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
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.status === "Returned") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Item already returned" });
      }

      await restoreStock(item);
      item.status = "Returned";
      item.returnReason = reason;

      const allReturned = order.orderItems.every(
        (i) => i.status === "Returned" || i.status === "Cancelled"
      );
      if (allReturned) {
        order.status = "Returned";
        order.isReturned = true;
      }
    } else {
      for (const item of order.orderItems) {
        if (item.status !== "Returned" && item.status !== "Cancelled") {
          await restoreStock(item);
          item.status = "Returned";
          item.returnReason = reason;
        }
      }
      order.status = "Returned";
      order.isReturned = true;
      order.returnReason = reason;
    }

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

