import * as userService from "../services/userService.js";

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

export { getUsers, blockUser, updateUser };
