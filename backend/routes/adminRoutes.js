const express = require("express");
const router = express.Router();
const {
  getUsers,
  blockUser,
  updateUser,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.use(protect);
router.use(admin);

router.get("/users", getUsers);
router.patch("/users/:id/block", blockUser);

router.put("/users/:id/update", updateUser);

module.exports = router;
