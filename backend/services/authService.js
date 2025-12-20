import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

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

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw new Error("Please add all fields");
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.isVerified) {
    } else {
      throw new Error("User already exists");
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

 
  if (user) {
    user.name = name;
    user.password = password;
    user.otp = otp;
    user.otpExpires = otpExpires;
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

  try {
    await sendEmail({
      email: user.email,
      subject: "NexGen PC Builder - Verify Your Email",
      message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Email could not be sent");
  }

  return { message: "OTP sent to email" };
};

const verifyOTP = async (email, otp) => {
  const user = await User.findOne({
    $or: [{ email: email }, { tempEmail: email }],
  }).select("+otp +otpExpires +tempEmail");
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.otp || !user.otpExpires) {
    throw new Error("No OTP found");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpires < Date.now()) {
    throw new Error("OTP expired");
  }

  if (user.otp === otp) {
    if (user.tempEmail) {
      user.email = user.tempEmail;
      user.tempEmail = undefined;
    }
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const tokens = await generateTokens(user._id);
  return { user, ...tokens };
};

const resendOTP = async (email) => {
  const user = await User.findOne({
    $or: [{ email: email }, { tempEmail: email }],
  });
  if (!user) {
    throw new Error("User not found");
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
    throw new Error("Invalid credentials");
  }

  if (user.status === "suspended" || user.status === "banned") {
    throw new Error(
      "Your account has been suspended or banned. Please contact support."
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
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
  if (!incomingRefreshToken) throw new Error("No token");

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
    throw new Error("Invalid refresh token (Reuse detected)");
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
    throw new Error("User not found");
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
    throw new Error("Email could not be sent");
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
    throw new Error("Invalid token");
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
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new Error("Invalid current password");
  }

  user.password = newPassword;
  user.passwordChangedAt= Date.now();
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
