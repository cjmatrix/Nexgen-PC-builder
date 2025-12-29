import User from "../models/User.js";

import crypto from "crypto";

export const generateReferral = async (req, res) => {
  const user = await User.findById(req.user._id).select("+referralToken");

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

  res.status(200).json({ success: true, referralLink });
};
