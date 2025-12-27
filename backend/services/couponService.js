import Coupon from "../models/Coupons.js";
import AppError from "../utils/AppError.js";

const createCoupon = async (data) => {
  const {
    code,
    discountType,
    discountValue,
    expiryDate,
    minOrderValue,
    usageLimit,
  } = data;

  // Check if coupon exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new AppError("Coupon code already exists", 400);
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    expiryDate,
    minOrderValue: minOrderValue || 0,
    usageLimit: usageLimit || 1000,
    isActive: true,
  });

  return coupon;
};

const getAllCoupons = async ({ page = 1, limit = 10, search, status }) => {
  const query = {};

  if (search) {
    query.code = { $regex: search, $options: "i" };
  }

  if (status) {
    if (status === "Active") query.isActive = true;
    if (status === "Inactive") query.isActive = false;
  }

  const count = await Coupon.countDocuments(query);
  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  return {
    coupons,
    total: count,
    page: Number(page),
    pages: Math.ceil(count / limit),
  };
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  return coupon;
};

const updateCoupon = async (id, updateData) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  // prevent duplicate code update
  if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {
    const existing = await Coupon.findOne({
      code: updateData.code.toUpperCase(),
    });
    if (existing) throw new AppError("Coupon code already exists", 400);
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedCoupon;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  // Toggle isActive
  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return coupon;
};

export {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
