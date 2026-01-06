import * as walletService from "../services/walletService.js";

const getWalletDetails = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const walletData = await walletService.getWalletDetails(
    req.user._id,
    page,
    limit
  );

  res.status(200).json({
    success: true,
    data: walletData,
  });
};

export { getWalletDetails };
