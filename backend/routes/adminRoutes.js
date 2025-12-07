const express = require("express");
const router = express.Router();
const {
  getUsers,
  blockUser,
  updateUser,
} = require("../controllers/adminController");

const {
  createComponent,
  getAdminComponents,
  deleteComponent,
  getComponentById,
  updateComponent,
  getComponents,
} = require("../controllers/componentController");

const {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/componentspublic", getComponents);

router.use(protect);
router.use(admin);

router.get("/users", getUsers);
router.patch("/users/:id/block", blockUser);

router.put("/users/:id/update", updateUser);
router.post("/components", createComponent);
router.get("/components", getAdminComponents);
router.get("/components/:id", getComponentById);
router.put("/components/:id", updateComponent);
router.patch("/components/:id/delete", deleteComponent);

router.post("/products", createProduct);
router.get("/products", getAdminProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct);
router.patch("/products/:id", deleteProduct); // Mapped to Soft Delete in controller

module.exports = router;
