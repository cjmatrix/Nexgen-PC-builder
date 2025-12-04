// backend/controllers/adminController.js
const userService = require("../services/userService");

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await userService.getAllUsers(page, limit, search);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await userService.toggleBlockStatus(req.params.id);
    res.status(200).json({ message: `User status updated to ${user.status}`, user });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.params.id, req.body);
    res.status(200).json({ success: true, message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, blockUser, updateUser };