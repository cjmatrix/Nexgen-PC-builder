import express from "express";

const router = express.Router();

import {
  getPublicProducts,
  getProductById,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

router.use(protect);

router.get("/", getPublicProducts);
router.get("/:id", getProductById);

export default router;
