import * as orderService from "../services/orderService.js";

export const createOrder = async (req, res) => {
  const order = await orderService.createOrder(
    req.user._id,
    req.user,
    req.body
  );
  res.status(201).json(order);
};

export const getMyOrders = async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await orderService.getUserOrders(req.user._id, {
    search,
    page,
    limit,
  });
  res.status(200).json(result);
};

export const getOrderById = async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
};

export const getAllOrders = async (req, res) => {
  const { page, limit, search, status } = req.query;
  const result = await orderService.getAllOrders({
    page,
    limit,
    search,
    status,
  });
  res.json(result);
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const updatedOrder = await orderService.updateOrderStatus(
    req.params.id,
    status
  );
  res.json(updatedOrder);
};

export const cancelOrder = async (req, res) => {
  const { itemId, reason } = req.body;
  const updatedOrder = await orderService.cancelOrder(
    req.params.id,
    itemId,
    reason
  );
  res.json(updatedOrder);
};

export const requestReturn = async (req, res) => {
  const { itemId, reason } = req.body;
  const updatedOrder = await orderService.requestReturn(
    req.params.id,
    itemId,
    reason
  );
  res.json(updatedOrder);
};

export const approveReturn = async (req, res) => {
  const { itemId } = req.body;
  const updatedOrder = await orderService.approveReturn(req.params.id, itemId);
  res.json(updatedOrder);
};

export const rejectReturn = async (req, res) => {
  const { itemId } = req.body;
  const updatedOrder = await orderService.rejectReturn(req.params.id, itemId);
  res.json(updatedOrder);
};
