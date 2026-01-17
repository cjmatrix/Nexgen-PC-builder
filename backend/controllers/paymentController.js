import paymentService from "../services/paymentService.js";
import { getInrToUsdRate } from "../services/currencyService.js";
export const getPaypalClientId = async (req, res, next) => {
  try {
    const config = paymentService.getPaypalConfig();
    res.send(config);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  const { r_orderID, db_orderID } = req.body; // r_orderId is paypal order id and another is db our order id
  try {
    const result = await paymentService.processPaymentVerification(
      r_orderID,
      db_orderID
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrencyConfig = async (req, res) => {
  const rate = await getInrToUsdRate();
  res.json({ 
    rate,
    currency: "USD" 
  });
};