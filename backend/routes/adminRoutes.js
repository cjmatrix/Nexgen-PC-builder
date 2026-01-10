import express from "express";
const router = express.Router();
import {
  getUsers,
  blockUser,
  updateUser,
  getSalesReport,
  getSalesInsights,
} from "../controllers/adminController.js";

import {
  createComponent,
  getAdminComponents,
  deleteComponent,
  getComponentById,
  updateComponent,
  getComponents,
} from "../controllers/componentController.js";

import {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../controllers/categoryController.js";

router.get("/componentspublic", getComponents);

router.use(protectAdmin);

router.get("/users", getUsers);
router.get("/sales-report", getSalesReport);

router.post("/sales-insights", getSalesInsights);
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
router.patch("/products/:id", deleteProduct);
router.get("/category", getCategories);
router.get("/category/:id", getCategoryById);
router.post("/category", createCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

export default router;
