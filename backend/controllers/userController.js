import User from "../models/User.js";
import {
  createAddress,
  getAddressesByUserId,
  updateUserProfile,
  updateAddress,
  deleteAddress,
} from "../services/userService.js";

const getProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.user._id);

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const postAddress = async (req, res) => {
  try {
    const result = await createAddress(req.user._id, req.body);

    res.status(201).json({ success: true, profile: result });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await getAddressesByUserId(req.user._id);
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateAddress(req.user._id, id, req.body);
    res.status(200).json({ success: true, address: result });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(400).json({ message: error.message });
  }
};

const deleteAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteAddress(req.user._id, id);
    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await updateUserProfile(req.user._id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({ message: error.message });
  }
};

export {
  getProfile,
  postAddress,
  getAddresses,
  updateProfile,
  updateAddresses,
  deleteAddresses,
};
