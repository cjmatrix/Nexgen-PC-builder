
const User = require("../models/User");

const getAllUsers = async (page, limit, search) => {
  const query = { isDeleted: { $ne: true } }; // Handle soft delete check

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-password");

  return { users, totalUsers, totalPages, page };
};

const toggleBlockStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.status = user.status === "active" ? "suspended" : "active";
  await user.save();
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) throw new Error("User not found");
  return user;
};

module.exports = { getAllUsers, toggleBlockStatus, updateUserProfile };