import WalletTransaction from "../models/WalletTransaction.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const addFunds = async (
  userId,
  amount,
  type,
  orderId,
  description,
  session,
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: amount } },
    { new: true, session },
  );

  const wallet = await WalletTransaction.create(
    [
      {
        user: userId,
        amount,
        type,
        orderId,
        description,
      },
    ],
    { session },
  );

  return wallet;
};

const deductFunds = async (
  userId,
  amount,
  type,
  orderId,
  description,
  session,
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: -amount } },
    { new: true, session },
  );

  const wallet = await WalletTransaction.create(
    [
      {
        user: userId,
        amount,
        type,
        orderId,
        description,
      },
    ],
    { session },
  );

  return wallet;
};

const getWalletDetails = async (userId, page = 1, limit = 10) => {
  const user = await User.findById(userId).select("walletBalance");
  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const totalTransactions = await WalletTransaction.countDocuments({
    user: userId,
  });
  const totalPages = Math.ceil(totalTransactions / limit);

  const transactions = await WalletTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    balance: user.walletBalance,
    transactions,
    pagination: {
      currentPage: page,
      totalPages,
      totalTransactions,
    },
  };
};

export { addFunds, getWalletDetails, deductFunds };
