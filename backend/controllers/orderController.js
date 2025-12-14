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

    // 1. Fetch User's Cart (PASS SESSION)
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

    // 2. Prepare Data (Same logic, no DB calls here)
    const orderItems = [];
    const stockToDecrement = {}; // Map of compId -> totalQty

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

    // 3. ATOMIC CHECK & DECREMENT (Concurrency Fix)
    // We combine Validation + Decrement into one atomic step per item.
    // If ANY item fails, the Transaction forces a rollback of everything.
    for (const [compId, totalNeeded] of Object.entries(stockToDecrement)) {
      const updatedComponent = await Component.findOneAndUpdate(
        {
          _id: compId,
          stock: { $gte: totalNeeded }, // <--- CRITICAL LOCK: Only update if stock >= needed
        },
        { $inc: { stock: -totalNeeded } },
        { new: true, session } // Pass SESSION
      );

      if (!updatedComponent) {
        // Failed! Stock was insufficient concurrently.
        throw new Error(
          `Stock insufficient for component ID: ${compId}. Found while processing.`
        );
      }
    }

    // 4. Create Order (PASS SESSION)
    // Recalculate strictly to avoid floating point errors
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const order = new Order({
      user: req.user._id,
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
      itemsPrice, // Use calculated value
      taxPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice + taxPrice, // Recalculate total
    });

    const createdOrder = await order.save({ session });

    // 5. Clear Cart (PASS SESSION)
    cart.items = [];
    await cart.save({ session });

    // COMMIT
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    // ROLLBACK on any error
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
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
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
            // We will handle user search separately below
          ].filter(Boolean),
        }
      : {};

    // Advanced Filter for Status and Date
    if (req.query.status && req.query.status !== "All") {
      keyword.status = req.query.status;
    }

    // Date Filtering Logic (e.g., 'today', 'week', 'month') can be added here if needed
    // For now assuming client sends date range or simple filter if implemented explicitly

    // User Search Handling
    if (req.query.search && !keyword.$or?.length) {
      // If query is not an ID, search Users
      const users = await User.find({
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);
      keyword.user = { $in: userIds };
    }

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

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Cascade Logic Validation
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res
        .status(400)
        .json({ message: `Cannot change status of a ${order.status} order.` });
    }

    // specific transitions check if needed, but for now allowing flexibility except for final states
    // 'Pending' -> 'Processing' -> 'Shipped' -> 'Out for Delivery' -> 'Delivered'

    order.status = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (status === "Paid") {
      // Manual override if needed
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
