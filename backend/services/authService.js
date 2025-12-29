import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import AppError from "../utils/AppError.js";

const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
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
    throw new AppError("Please add all fields", 400);
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.isVerified) {
    } else {
      throw new AppError("User already exists", 400);
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
      console.log("Referral rewards distributed successfully");
    } catch (err) {
      console.error("Failed to distribute referral rewards:", err);
    }
  }

  try {
    await sendEmail({
      email: user.email,
      subject: "NexGen PC Builder - Verify Your Email",
      message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    throw new AppError("Email could not be sent", 500);
  }

  return { message: "OTP sent to email" };
};

const verifyOTP = async (email, otp) => {
  const user = await User.findOne({
    email: email,
  }).select("+otp +otpExpires"); 
  if (!user) {
    throw new AppError("User not found", 404);
  }

  console.log(user);
  if (!user.otp || !user.otpExpires) {
    throw new AppError("No OTP found", 404);
  }

  if (user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (user.otpExpires < Date.now()) {
    throw new AppError("OTP expired", 400);
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
    throw new AppError("User not found", 404);
  }

  console.log(email, "this wone");

  console.log(user, "this");
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

  return { message: "OTP resent" };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.status === "suspended" || user.status === "banned") {
    throw new AppError(
      "Your account has been suspended or banned. Please contact support.",
      403
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
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
          (t) => t !== incomingRefreshToken
        );
        await user.save();
      }
    }
  }
  return true;
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new AppError("No token", 401);

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findOne({ _id: decoded.id }).select("+refreshTokens");

  if (!user || !user.refreshTokens.includes(incomingRefreshToken)) {
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
    throw new AppError("Invalid refresh token (Reuse detected)", 403);
  }

  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t !== incomingRefreshToken
  );
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { newAccessToken, newRefreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    return { message: "Email sent" };
  } catch (error) {
    console.error("Send Email Error:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new AppError("Email could not be sent", 500);
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
    throw new AppError("Invalid token", 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: "Password updated success" };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Invalid current password", 401);
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  return { message: "Password changed successfully" };
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
