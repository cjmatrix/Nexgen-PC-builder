import Coupon from "../models/Coupons.js";
import AppError from "../utils/AppError.js";

const createCoupon = async (data) => {
  const {
    code,
    discountType,
    discountValue,
    expiryDate,
    minOrderValue,
    allowedUsers,
    maxDiscountAmount,
    usageLimit,
  } = data;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new AppError("Coupon code already exists", 400);
  }
  console.log(discountType, discountValue, minOrderValue);
  if (discountType === "fixed" && discountValue >= minOrderValue) {
    throw new AppError(
      "Fixed discount value cannot exceed or equal minimum order value",
      400
    );
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    expiryDate,
    minOrderValue: minOrderValue || 0,
    maxDiscountAmount: discountType === "percentage" ? maxDiscountAmount : null,
    usageLimit: usageLimit || 1000,
    allowedUsers,
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

  // let newDiscount=updateData.discountValue || coupon.discountValue
  // let newMinOrder=updateData.minOrderValue || coupon.minOrderValue
  // let newType=updateData.discountType|| coupon.discountType

  // if(newType==="fixed" && newDiscount>=newMinOrder ){
  //   throw new AppError('Fixed discount value cannot exceed or equal minimum order value',400)
  // }

  // if (!coupon) {
  //   throw new AppError("Coupon not found", 404);
  // }

  if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {
    const existing = await Coupon.findOne({
      code: updateData.code.toUpperCase(),
    });
    if (existing) throw new AppError("Coupon code already exists", 400);

    updateData.code = updateData.code.toUpperCase();
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

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return coupon;
};

const validateCoupon = async (code, cartTotal, userId) => {
  if (!code) throw new AppError("Coupon code is required", 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) throw new AppError("Invalid coupon code", 404);

  if (!coupon.isActive) throw new AppError("Coupon is inactive", 400);

  if (coupon.usedBy.includes(userId)) {
    throw new AppError("You have already used this coupon", 400);
  }

  if (new Date() > new Date(coupon.expiryDate)) {
    throw new AppError("Coupon has expired", 400);
  }

  if (coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit reached", 400);
  }

  if (cartTotal < coupon.minOrderValue) {
    throw new AppError(
      `Minimum order value of ₹${coupon.minOrderValue} required`,
      400
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);

    // Check for maximum discount amount (if applicable)
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  if (discountAmount > cartTotal) {
    discountAmount = cartTotal;
  }

  return {
    coupon,
    discountAmount,
  };
};

const getAvailableCoupons = async (userId) => {
  const currentDate = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: currentDate },
    $expr: { $lt: ["$usageCount", "$usageLimit"] },
    usedBy: { $ne: userId },
  });

  const validCoupons = coupons.filter((coupon) => {
    if (!coupon.allowedUsers || coupon.allowedUsers.length === 0) return true;

    return coupon.allowedUsers.includes(userId);
  });

  return validCoupons;
};

export {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAvailableCoupons,
};
