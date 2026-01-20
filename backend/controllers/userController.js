import User from "../models/User.js";
import {
  createAddress,
  getAddressesByUserId,
  updateUserProfile,
  updateAddress,
  deleteAddress,
  verifyEmailChangeOTP,
} from "../services/userService.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const getProfile = async (req, res) => {
  const profile = await User.findById(req.user._id).select(
    "name email passwordChangedAt",
  );

  res.status(HTTP_STATUS.OK).json({ success: true, profile });
};

const postAddress = async (req, res) => {
  const result = await createAddress(req.user._id, req.body);

  res.status(HTTP_STATUS.CREATED).json({ success: true, profile: result });
};

const getAddresses = async (req, res) => {
  const addresses = await getAddressesByUserId(req.user._id);
  res.status(HTTP_STATUS.OK).json({ success: true, addresses });
};

const updateAddresses = async (req, res) => {
  const { id } = req.params;
  const result = await updateAddress(req.user._id, id, req.body);
  res.status(HTTP_STATUS.OK).json({ success: true, address: result });
};

const deleteAddresses = async (req, res) => {
  const { id } = req.params;
  const result = await deleteAddress(req.user._id, id);
  res
    .status(HTTP_STATUS.OK)
    .json({ success: true, message: MESSAGES.ADDRESS.DELETED });
};

const updateProfile = async (req, res) => {
  const result = await updateUserProfile(req.user._id, req.body);
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

const verifyEmailChange = async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyEmailChangeOTP(email, otp);
  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export {
  getProfile,
  postAddress,
  getAddresses,
  updateProfile,
  updateAddresses,
  deleteAddresses,
  verifyEmailChange,
};
