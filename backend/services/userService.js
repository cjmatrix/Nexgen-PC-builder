const User = require("../models/User");

const getAllUsers = async (page, limit, search, status, sort) => {
  const query = { isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  let sortOptions = { createdAt: -1 };

  if (sort === "oldest") {
    sortOptions = { createdAt: 1 };
  } else if (sort === "newest") {
    sortOptions = { createdAt: -1 };
  }

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  const users = await User.find(query)
    .sort(sortOptions)
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
