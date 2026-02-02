import Blacklist from "../models/Blacklist.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import Component from "../models/Component.js";

export const getBlacklistedItems = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const pageSize = Number(limit);
  const pageNum = Number(page);

  const query = {};
  if (search) {
    query.$or = [
      { productName: { $regex: search, $options: "i" } },
      { orderId: { $regex: search, $options: "i" } },
      { reason: { $regex: search, $options: "i" } },
    ];
  }

  const count = await Blacklist.countDocuments(query);
  const items = await Blacklist.find(query)
    .sort({ blacklistedAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (pageNum - 1));

  res.status(HTTP_STATUS.OK).json({
    items,
    page: pageNum,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
};

export const restoreComponent = async (req, res) => {
  const { componentId, quantity } = req.body;
  const id = req.params.id;

  const component = await Component.updateOne(
    { _id: componentId },
    { $inc: { stock: quantity } },
  );

  if (!component) {
    throw new AppError(400, "No Component Found");
  }

  const blacklistitem = await Blacklist.findById(id);

  if (!blacklistitem) {
    throw new AppError(400, "No blacklist item found");
  }

  blacklistitem.components = blacklistitem.components.filter(
    (cpm) => componentId !== cpm.componentId.toString(),
  );

  await blacklistitem.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Component stock successfully added`,
  });
};

export const getBlacklistItemById = async (req, res) => {
  const { id } = req.params;
  const item = await Blacklist.findById(id).populate("components.componentId");

  if (!item) {
    throw new AppError(404, "Blacklist item not found");
  }

  res.status(HTTP_STATUS.OK).json(item);
};
