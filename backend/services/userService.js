import User from "../models/User.js";
import Address from "../models/Address.js";
import sendEmail from "../utils/sendEmail.js";
import AppError from "../utils/AppError.js";

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
  if (!user) throw new AppError("User not found", 404);

  user.status = user.status === "active" ? "suspended" : "active";
  await user.save();
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await User.findOne({ email: updateData.email });
    if (emailExists) throw new AppError("Email already in use", 400);

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

      throw new AppError("Email could not be sent", 500);
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
    throw new AppError("Address not found or unauthorized", 404);
  }

  // If setting as default, unset other default addresses for this user
  if (updateData.isDefault) {
    await Address.updateMany(
      { user: userId, _id: { $ne: addressId } },
      { isDefault: false }
    );
  }

  Object.assign(address, updateData);
  await address.save();
  return address;
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new AppError("Address not found or unauthorized", 404);
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
    }
  );
  return addresses;
};

export {
  getAllUsers,
  toggleBlockStatus,
  updateUserProfile,
  createAddress,
  getAddressesByUserId,
  updateAddress,
  deleteAddress,
};
