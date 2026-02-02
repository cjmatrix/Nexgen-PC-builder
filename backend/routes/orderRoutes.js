import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  approveReturn,
  rejectReturn,
  getOrderItemDetail,
} from "../controllers/orderController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protectAdmin, getAllOrders);

router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/:id/items/:itemId", protect, getOrderItemDetail);
router.put("/:id/status", protectAdmin, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, requestReturn);
router.put("/:id/return/approve", protectAdmin, approveReturn);
router.put("/:id/return/reject", protectAdmin, rejectReturn);

export default router;
