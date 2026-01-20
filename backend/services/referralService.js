import User from "../models/User.js";
import crypto from "crypto";

const generateReferralLink = async (userId) => {
  const user = await User.findById(userId).select("+referralToken");

  if (!Array.isArray(user.referralToken)) {
    user.referralToken = [];
  }

  const referralToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(referralToken)
    .digest("hex");

  user.referralToken.push(hashedToken);

  await user.save();

  const referralLink = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/signup?ref=${referralToken}`;

  return referralLink;
};

export default {
  generateReferralLink,
};
