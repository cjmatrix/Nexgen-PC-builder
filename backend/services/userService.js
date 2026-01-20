import User from "../models/User.js";
import Address from "../models/Address.js";
import sendEmail from "../utils/sendEmail.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const getAllUsers = async (page, limit, search, status, sort) => {
  const query = { isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  let sortOptions = { createdAt: -1 };

  if (sort === "oldest") {
    sortOptions = { createdAt: 1 };
  } else if (sort === "newest") {
    sortOptions = { createdAt: -1 };
  }

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  const users = await User.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-password");

  return { users, totalUsers, totalPages, page };
};

const toggleBlockStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  user.status = user.status === "active" ? "suspended" : "active";
  await user.save();
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await User.findOne({ email: updateData.email });
    if (emailExists)
      throw new AppError(MESSAGES.USER.EMAIL_IN_USE, HTTP_STATUS.BAD_REQUEST);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    user.tempEmail = updateData.email;
    user.otp = otp;
    user.otpExpires = otpExpires;

    if (updateData.name) user.name = updateData.name;

    await user.save();

    console.log("sending email to ", user.email);

    try {
      await sendEmail({
        email: updateData.email,
        subject: "NexGen PC Builder - Verify Your New Email",
        message: `Your verification code for email update is: ${otp}. It expires in 10 minutes.`,
      });
    } catch (error) {
      console.error("Email send failed:", error);

      throw new AppError(
        MESSAGES.USER.EMAIL_SEND_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return { user, emailChanged: true, pendingMail: updateData.email };
  } else {
    if (updateData.name) user.name = updateData.name;

    await user.save();
    return { user, emailChanged: false };
  }
};

const createAddress = async (id, payload) => {
  const address = await Address.create({ ...payload, user: id });
  return address;
};

const updateAddress = async (userId, addressId, updateData) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new AppError(MESSAGES.ADDRESS.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (updateData.isDefault) {
    await Address.updateMany(
      { user: userId, _id: { $ne: addressId } },
      { isDefault: false },
    );
  }

  Object.assign(address, updateData);
  await address.save();
  return address;
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new AppError(MESSAGES.ADDRESS.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  address.isDeleted = true;
  address.deletedAt = new Date();
  await address.save();
  return address;
};

const getAddressesByUserId = async (userId) => {
  const addresses = await Address.find({ user: userId, isDeleted: false }).sort(
    {
      isDefault: -1,
      createdAt: -1,
    },
  );
  return addresses;
};

const verifyEmailChangeOTP = async (tempEmail, otp) => {
  const user = await User.findOne({
    tempEmail: tempEmail,
  }).select("+otp +otpExpires +tempEmail");

  if (!user) {
    throw new AppError(
      MESSAGES.USER.VERIFICATION_INVALID,
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (!user.otp || !user.otpExpires) {
    throw new AppError(MESSAGES.USER.OTP_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (user.otp !== otp) {
    throw new AppError(MESSAGES.USER.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
  }

  if (user.otpExpires < Date.now()) {
    throw new AppError(MESSAGES.USER.OTP_EXPIRED, HTTP_STATUS.BAD_REQUEST);
  }

  const existingUser = await User.findOne({ email: tempEmail });
  if (existingUser) {
    throw new AppError(MESSAGES.USER.EMAIL_TAKEN, HTTP_STATUS.BAD_REQUEST);
  }

  user.email = user.tempEmail;
  user.tempEmail = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  return { message: MESSAGES.USER.EMAIL_UPDATED, user };
};

export {
  getAllUsers,
  toggleBlockStatus,
  updateUserProfile,
  createAddress,
  getAddressesByUserId,
  updateAddress,
  deleteAddress,
  verifyEmailChangeOTP,
};
