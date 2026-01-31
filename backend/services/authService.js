import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import { addEmailJob } from "../queues/emailQueue.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const user = await User.findById(userId).select("+refreshTokens");
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

import { createCoupon } from "./couponService.js";

const registerUser = async (userData) => {
  const { name, email, password, referralToken } = userData;

  if (!name || !email || !password) {
    throw new AppError(MESSAGES.AUTH.MISSING_FIELDS, HTTP_STATUS.BAD_REQUEST);
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.isVerified) {
    } else {
      throw new AppError(MESSAGES.AUTH.USER_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  let referrer = null;
  if (referralToken) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(referralToken)
      .digest("hex");
    referrer = await User.findOne({ referralToken: hashedToken });
  }

  if (user) {
    user.name = name;
    user.password = password;
    user.otp = otp;
    user.otpExpires = otpExpires;
    // user.referralToken = [];
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires,
      isVerified: false,
    });
  }

  if (referrer && user) {
    try {
      const referrerCouponCode = `REF-${referrer.name
        .substring(0, 3)
        .toUpperCase()}-${Date.now().toString().slice(-4)}`;
      await createCoupon({
        code: referrerCouponCode,
        discountType: "fixed",
        discountValue: 500,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        minOrderValue: 2000,
        usageLimit: 1,
        allowedUsers: [referrer._id],
      });

      const newUserCouponCode = `WELCOME-${name
        .substring(0, 3)
        .toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      await createCoupon({
        code: newUserCouponCode,
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 1000,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        usageLimit: 1,
        allowedUsers: [user._id],
      });
     
    } catch (err) {
      console.error("Failed to distribute referral rewards:", err);
    }
  }

  try {
    await addEmailJob({
      email: user.email,
      subject: "NexGen PC Builder - Verify Your Email",
      message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    throw new AppError(
      MESSAGES.AUTH.EMAIL_SEND_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return { message: MESSAGES.AUTH.REGISTRATION_SUCCESS };
};

const verifyOTP = async (email, otp) => {
  const user = await User.findOne({
    email: email,
  }).select("+otp +otpExpires");
  if (!user) {
    throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }


  if (!user.otp || !user.otpExpires) {
    throw new AppError(MESSAGES.AUTH.NO_OTP, HTTP_STATUS.NOT_FOUND);
  }

  if (user.otp !== otp) {
    throw new AppError(MESSAGES.AUTH.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
  }

  if (user.otpExpires < Date.now()) {
    throw new AppError(MESSAGES.AUTH.OTP_EXPIRED, HTTP_STATUS.BAD_REQUEST);
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // const tokens = await generateTokens(user._id);
  return { user };
};

const resendOTP = async (email) => {
  const user = await User.findOne({
    $or: [{ email: email }, { tempEmail: email }],
  });
  if (!user) {
    throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

 

 
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendEmail({
    email: email,
    subject: "NexGen PC Builder - Resend Verification Code",
    message: `Your new verification code is: ${otp}. It expires in 10 minutes.`,
  });

  return { message: MESSAGES.AUTH.OTP_RESENT };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(
      MESSAGES.AUTH.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (user.status === "suspended" || user.status === "banned") {
    throw new AppError(MESSAGES.AUTH.ACCOUNT_SUSPENDED, HTTP_STATUS.FORBIDDEN);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError(
      MESSAGES.AUTH.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  user.lastLogin = Date.now();
  await user.save();

  const tokens = await generateTokens(user._id);

  return { user, ...tokens };
};

const logoutUser = async (incomingRefreshToken) => {
  if (incomingRefreshToken) {
    const decoded = jwt.decode(incomingRefreshToken);
    if (decoded) {
      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t !== incomingRefreshToken,
        );
        await user.save();
      }
    }
  }
  return true;
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken)
    throw new AppError(MESSAGES.AUTH.NO_TOKEN, HTTP_STATUS.UNAUTHORIZED);

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const user = await User.findOne({ _id: decoded.id }).select("+refreshTokens");
  if (user.status !== "active") {
    throw new AppError(MESSAGES.AUTH.ACCOUNT_SUSPENDED, HTTP_STATUS.FORBIDDEN);
  }

  if (!user || !user.refreshTokens.includes(incomingRefreshToken)) {
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
    throw new AppError(
      MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t !== incomingRefreshToken,
  );
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { newAccessToken, newRefreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    return { message: MESSAGES.AUTH.EMAIL_SENT };
  } catch (error) {
    console.error("Send Email Error:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new AppError(
      MESSAGES.AUTH.EMAIL_SEND_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

const resetPassword = async (resetToken, password) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(MESSAGES.AUTH.INVALID_TOKEN, HTTP_STATUS.BAD_REQUEST);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: MESSAGES.AUTH.PASSWORD_UPDATED };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError(
      MESSAGES.AUTH.INVALID_CURRENT_PASSWORD,
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  return { message: MESSAGES.AUTH.PASSWORD_CHANGED };
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  generateTokens,
};
