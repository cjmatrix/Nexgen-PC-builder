import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getAvailableCoupons,
  getCouponById,
  updateCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/available", protect, getAvailableCoupons);

router
  .route("/")
  .get(protect, admin, getAllCoupons)
  .post(protect, admin, createCoupon);
router
  .route("/:id")
  .get(protect, admin, getCouponById)
  .patch(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
