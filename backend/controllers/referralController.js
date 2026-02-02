import referralService from "../services/referralService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const generateReferral = async (req, res) => {
  const referralLink = await referralService.generateReferralLink(req.user._id);

  res.status(HTTP_STATUS.OK).json({ success: true, referralLink });
};
