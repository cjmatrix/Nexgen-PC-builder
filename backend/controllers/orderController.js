import * as orderService from "../services/orderService.js";

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.user._id,
      req.user,
      req.body
    );
    res.status(201).json(order);
  } catch (error) {
    if (error.message === "Cart is empty") {
      return res.status(400).json({ message: error.message });
    }
   
    console.error(error);
    res.status(500).json({
      message: "Order Failed: " + error.message,
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const result = await orderService.getUserOrders(req.user._id, {
      search,
      page,
      limit,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    console.error(error);
    if (error.message === "Order not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await orderService.getAllOrders({
      page,
      limit,
      search,
      status,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await orderService.updateOrderStatus(
      req.params.id,
      status
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (error.message === "Order not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Cannot change status")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { itemId, reason } = req.body;
    const updatedOrder = await orderService.cancelOrder(
      req.params.id,
      itemId,
      reason
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (
      error.message === "Order not found" ||
      error.message === "Item not found in order"
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes("Cannot cancel") ||
      error.message === "Item already cancelled"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const { itemId, reason } = req.body;
    const updatedOrder = await orderService.requestReturn(
      req.params.id,
      itemId,
      reason
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (error.message === "Return reason is mandatory") {
      return res.status(400).json({ message: error.message });
    }
    if (
      error.message === "Order not found" ||
      error.message === "Item not found"
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message === "Can only request return for delivered orders" ||
      error.message === "Return already requested or processed for item"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const approveReturn = async (req, res) => {
  try {
    const { itemId } = req.body;
    const updatedOrder = await orderService.approveReturn(
      req.params.id,
      itemId
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (
      error.message === "Order not found" ||
      error.message === "Item not found"
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message === "Item is not in Return Requested state" ||
      error.message === "Order is not in Return Requested state"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const rejectReturn = async (req, res) => {
  try {
    const { itemId } = req.body;
    const updatedOrder = await orderService.rejectReturn(req.params.id, itemId);
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (
      error.message === "Order not found" ||
      error.message === "Item not found"
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Item is not in Return Requested state") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};
