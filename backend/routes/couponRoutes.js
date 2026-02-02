import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getAvailableCoupons,
  getCouponById,
  updateCoupon,
} from "../controllers/couponController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/available", protect, getAvailableCoupons);

router
  .route("/")
  .get(protectAdmin, getAllCoupons)
  .post( protectAdmin, createCoupon);
router
  .route("/:id")
  .get(protectAdmin, getCouponById)
  .patch( protectAdmin, updateCoupon)
  .delete( protectAdmin, deleteCoupon);

export default router;
