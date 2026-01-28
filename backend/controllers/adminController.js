import * as userService from "../services/userService.js";
import Order from "../models/Order.js";
import { generateResponse } from "../config/gemini.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";
import Redis from "ioredis";
import { redisConfig } from "../config/redis.js";

const redisSubscriber = new Redis(redisConfig);
const localSalesClients = new Set();

redisSubscriber.subscribe("sales_updates");

redisSubscriber.on("message", (channel, message) => {
  if (channel === "sales_updates") {
    localSalesClients.forEach((res) => {
      res.write(`data: ${message}\n\n`);
    });
  }
});

const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const status = req.query.status || "";
  const sort = req.query.sort || "";

  const result = await userService.getAllUsers(
    page,
    limit,
    search,
    status,
    sort,
  );
  res.status(HTTP_STATUS.OK).json(result);
};

const blockUser = async (req, res) => {
  const user = await userService.toggleBlockStatus(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json({ message: MESSAGES.ADMIN.BLOCK_STATUS_UPDATED(user.status), user });
};

const updateUser = async (req, res) => {
  const user = await userService.updateUserProfile(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json({ success: true, message: MESSAGES.ADMIN.USER_UPDATED, user });
};

const getSalesReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      interval = "daily",
      componentType = "all",
    } = req.query;

    let dateFilter = {
      isPaid: true,
      status: { $nin: ["Cancelled", "Returned", "Return Approved"] },
    };

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else {
      const today = new Date();
      let pastDate = new Date();

      switch (interval) {
        case "weekly":
          pastDate.setDate(today.getDate() - 7 * 12); // Last 12 weeks
          break;
        case "monthly":
          pastDate.setMonth(today.getMonth() - 12); // Last 12 months
          break;
        case "yearly":
          pastDate.setFullYear(today.getFullYear() - 5); // Last 5 years
          break;
        default:
          pastDate.setDate(today.getDate() - 30); // Last 30 days
      }
      dateFilter.createdAt = { $gte: pastDate };
    }

    const totalSales = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.status": {
            $nin: ["Cancelled", "Returned", "Return Approved"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },

          ordersSet: { $addToSet: "$_id" },
          totalProductDiscount: {
            $sum: {
              $multiply: [
                {
                  $multiply: [
                    "$orderItems.price",
                    { $divide: ["$orderItems.discount", 100] },
                  ],
                },
                "$orderItems.qty",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalRevenue: { $divide: ["$totalRevenue", 100] },
          totalOrders: { $size: "$ordersSet" },

          avgOrderValue: {
            $cond: [
              { $eq: [{ $size: "$ordersSet" }, 0] },
              0,
              {
                $divide: [
                  { $divide: ["$totalRevenue", 100] },
                  { $size: "$ordersSet" },
                ],
              },
            ],
          },
          totalDiscount: { $divide: ["$totalProductDiscount", 100] },
        },
      },
    ]);

    let format = "%Y-%m-%d";
    if (interval === "weekly") format = "%Y-W%U";
    if (interval === "monthly") format = "%Y-%m";
    if (interval === "yearly") format = "%Y";

    const salesOverTime = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.status": {
            $nin: ["Cancelled", "Returned", "Return Approved"],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$createdAt" } },
          dailyRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },

          dailyOrdersSet: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 1,
          dailyRevenue: { $divide: ["$dailyRevenue", 100] },
          dailyOrders: { $size: "$dailyOrdersSet" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.status": {
            $nin: ["Cancelled", "Returned", "Return Approved"],
          },
        },
      },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.qty" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
        },
      },
      {
        $addFields: {
          revenue: { $divide: ["$revenue", 100] },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const topCategories = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.status": {
            $nin: ["Cancelled", "Returned", "Return Approved"],
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData.name",
          totalSold: { $sum: "$orderItems.qty" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
        },
      },
      {
        $addFields: {
          revenue: { $divide: ["$revenue", 100] },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const topComponents = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.status": {
            $nin: ["Cancelled", "Returned", "Return Approved"],
          },
        },
      },
      {
        $project: {
          components: { $objectToArray: "$orderItems.components" },
          orderQty: "$orderItems.qty",
        },
      },
      { $unwind: "$components" },
      {
        $match: {
          "components.v.name": { $exists: true },
          ...(componentType !== "all"
            ? { "components.k": componentType.toLowerCase() }
            : {}),
        },
      },
      {
        $group: {
          _id: "$components.v.name",
          totalSold: { $sum: "$orderQty" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const orderStatusStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

   
    const refundFilter = { ...dateFilter };
    delete refundFilter.status;

    const refundStats = await Order.aggregate([
      { $match: refundFilter },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.status": { $in: ["Returned", "Return Approved"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRefundedAmount: {
            $sum: {
              $multiply: [
                "$orderItems.price",
                "$orderItems.qty",
                { $subtract: [1, { $divide: ["$orderItems.discount", 100] }] },
              ],
            },
          },
          totalRefundedOrders: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRefundedAmount: { $divide: ["$totalRefundedAmount", 100] },
          totalRefundedOrders: { $size: "$totalRefundedOrders" },
        },
      },
    ]);

    const refunds = refundStats[0] || {
      totalRefundedAmount: 0,
      totalRefundedOrders: 0,
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      stats: {
        ...(totalSales[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          totalDiscount: 0,
        }),
        ...refunds,
      },
      salesOverTime,
      topProducts,
      topCategories,
      topComponents,
      orderStatusStats,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const getSalesInsights = async (req, res) => {
  try {
    const { stats, topProducts, salesOverTime } = req.body;

    console.log(req.body);

    const productNames = topProducts
      .slice(0, 5)
      .map((p) => p.name)
      .join(", ");

    const salesTrend =
      salesOverTime.length > 1
        ? salesOverTime[salesOverTime.length - 1].dailyRevenue >
          salesOverTime[0].dailyRevenue
          ? "increasing"
          : "decreasing"
        : "stable";

    const prompt = `
      Analyze this PC store sales data and give 3 distinct, concise, action-oriented insights (max 1 sentence each, bullet points).
      Data:
      - Total Revenue: ₹${stats.totalRevenue}
      - Total Orders: ${stats.totalOrders}
      - Top Selling Products: ${productNames}
      - Recent Trend: Sales are ${salesTrend} over the last 30 days.

      Return ONLY the insights in plain text bullet points. No intro.
    `;

    const insights = await generateResponse(prompt);

    res.status(HTTP_STATUS.OK).json({ success: true, insights });
  } catch (error) {
    console.error("AI Insight Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.ADMIN.INSIGHTS_FAILURE });
  }
};

const streamSalesUpdates = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  localSalesClients.add(res);

  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  req.on("close", () => {
    localSalesClients.delete(res);
  });
};

export {
  getUsers,
  blockUser,
  updateUser,
  getSalesReport,
  getSalesInsights,
  streamSalesUpdates,
};
