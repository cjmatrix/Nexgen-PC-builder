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
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, admin, getAllOrders);

router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, requestReturn);
router.put("/:id/return/approve", protect, admin, approveReturn);
router.put("/:id/return/reject", protect, admin, rejectReturn);

export default router;
