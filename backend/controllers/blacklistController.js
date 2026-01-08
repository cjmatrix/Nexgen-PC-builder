import Blacklist from "../models/Blacklist.js";
import AppError from "../utils/AppError.js";

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

  res.status(200).json({
    items,
    page: pageNum,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
};
