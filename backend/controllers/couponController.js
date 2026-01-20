import * as couponService from "../services/couponService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getAvailableCoupons(req.user._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const { coupons, total, page, pages } = await couponService.getAllCoupons(
      req.query,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      coupons,
      pagination: {
        total,
        page,
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (req, res, next) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.deleteCoupon(req.params.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: coupon.isActive
        ? MESSAGES.COUPON.ACTIVATED
        : MESSAGES.COUPON.DEACTIVATED,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};
