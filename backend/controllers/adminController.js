import * as userService from "../services/userService.js";
import Order from "../models/Order.js";
import { generateResponse } from "../config/gemini.js";

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
    sort
  );
  res.status(200).json(result);
};

const blockUser = async (req, res) => {
  const user = await userService.toggleBlockStatus(req.params.id);
  res
    .status(200)
    .json({ message: `User status updated to ${user.status}`, user });
};

const updateUser = async (req, res) => {
  const user = await userService.updateUserProfile(req.params.id, req.body);
  res.status(200).json({ success: true, message: "User updated", user });
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, interval = "daily" } = req.query;

    let dateFilter = { isPaid: true };

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else {
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    const totalSales = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPrice" },
          totalCouponDiscount: { $sum: "$couponDiscount" },
          totalProductDiscount: {
            $sum: {
              $reduce: {
                input: "$orderItems",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $multiply: [
                        {
                          $multiply: [
                            "$$this.price",
                            { $divide: ["$$this.discount", 100] },
                          ],
                        },
                        "$$this.qty",
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalRevenue: { $divide: ["$totalRevenue", 100] },
          totalOrders: 1,
          avgOrderValue: { $divide: ["$avgOrderValue", 100] },
          totalDiscount: {
            $divide: [
              { $add: ["$totalCouponDiscount", "$totalProductDiscount"] },
              100,
            ],
          },
        },
      },
    ]);

 
    let format = "%Y-%m-%d"; 
    if (interval === "weekly") format = "%Y-W%U";
    if (interval === "monthly") format = "%Y-%m";
    if (interval === "yearly") format = "%Y";

    const salesOverTime = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$createdAt" } },
          dailyRevenue: { $sum: "$totalPrice" },
          dailyOrders: { $sum: 1 },
        },
      },
      {
        $addFields: {
          dailyRevenue: { $divide: ["$dailyRevenue", 100] },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$orderItems" },
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

    const orderStatusStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: totalSales[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalDiscount: 0,
      },
      salesOverTime,
      topProducts,
      orderStatusStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    res.status(200).json({ success: true, insights });
  } catch (error) {
    console.error("AI Insight Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate insights" });
  }
};

export { getUsers, blockUser, updateUser, getSalesReport, getSalesInsights };
