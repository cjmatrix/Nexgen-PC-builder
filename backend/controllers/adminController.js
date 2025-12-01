const User = require("../models/User");

// @desc    Get all users (with pagination, search, sort)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      isDeleted: false, // Filter out soft-deleted users
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 }) // Sort Descending (Newest first)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password"); // Exclude password

    res.status(200).json({
      users,
      page,
      totalPages,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Block Status (Suspend/Active)
// @route   PATCH /api/admin/users/:id/block
// @access  Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle between active and suspended
    if (user.status === "active") {
      user.status = "suspended";
    } else {
      user.status = "active";
    }

    await user.save();

    res
      .status(200)
      .json({ message: `User status updated to ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user);
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  blockUser,

  updateUser,
};
