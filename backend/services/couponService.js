import Coupon from "../models/Coupons.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

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
    throw new AppError(MESSAGES.COUPON.ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
  }
  console.log(discountType, discountValue, minOrderValue);
  if (
    discountType === "fixed" &&
    Number(discountValue) >= Number(minOrderValue)
  ) {
    throw new AppError(
      "Fixed discount must be less than Minimum Order Value",
      HTTP_STATUS.BAD_REQUEST,
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

  const totalPages = Math.ceil(count / limit);

  console.log(totalPages, "Inside serv");

  return {
    coupons,
    total: count,
    page,
    totalPages,
  };
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError(MESSAGES.COUPON.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
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
    if (existing)
      throw new AppError(
        MESSAGES.COUPON.ALREADY_EXISTS,
        HTTP_STATUS.BAD_REQUEST,
      );

    updateData.code = updateData.code.toUpperCase();
  }

  Object.assign(coupon, updateData);

  if (
    coupon.discountType === "fixed" &&
    Number(coupon.discountValue) >= Number(coupon.minOrderValue)
  ) {
    throw new AppError(
      "Fixed discount must be less than Minimum Order Value",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updatedCoupon = await coupon.save();

  return updatedCoupon;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError(MESSAGES.COUPON.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return coupon;
};

const validateCoupon = async (code, cartTotal, userId) => {
  if (!code)
    throw new AppError(MESSAGES.COUPON.CODE_REQUIRED, HTTP_STATUS.BAD_REQUEST);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon)
    throw new AppError(MESSAGES.COUPON.INVALID_CODE, HTTP_STATUS.NOT_FOUND);

  if (!coupon.isActive)
    throw new AppError(MESSAGES.COUPON.INACTIVE, HTTP_STATUS.BAD_REQUEST);

  if (coupon.usedBy.includes(userId)) {
    throw new AppError(MESSAGES.COUPON.ALREADY_USED, HTTP_STATUS.BAD_REQUEST);
  }

  if (new Date() > new Date(coupon.expiryDate)) {
    throw new AppError(MESSAGES.COUPON.EXPIRED, HTTP_STATUS.BAD_REQUEST);
  }

  if (coupon.usageCount >= coupon.usageLimit) {
    throw new AppError(MESSAGES.COUPON.LIMIT_REACHED, HTTP_STATUS.BAD_REQUEST);
  }

  if (cartTotal < coupon.minOrderValue) {
    throw new AppError(
      MESSAGES.COUPON.MIN_ORDER_VALUE(coupon.minOrderValue),
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);

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
