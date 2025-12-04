const express = require("express");
const router = express.Router();
const {
  getUsers,
  blockUser,
  updateUser,
} = require("../controllers/adminController");

const {createComponent,getAdminComponents, deleteComponent}=require('../controllers/componentController')

const { protect, admin } = require("../middleware/authMiddleware");

router.use(protect);
router.use(admin);

router.get("/users", getUsers);
router.patch("/users/:id/block", blockUser);

router.put("/users/:id/update", updateUser);
router.post("/components", createComponent);
router.get("/components" ,getAdminComponents)
router.patch("/components/:id/delete",deleteComponent)

module.exports = router;
