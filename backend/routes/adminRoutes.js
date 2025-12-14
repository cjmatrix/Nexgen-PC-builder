import express from "express";
const router = express.Router();
import {
  getUsers,
  blockUser,
  updateUser,
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

import { protect, admin } from "../middleware/authMiddleware.js";

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
router.patch("/products/:id", deleteProduct);

export default router;
