import Order from "../models/Order.js";
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";
import { getInrToUsdRate } from "./currencyService.js";

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
  logLevel: LogLevel.INFO,
});

const ordersController = new OrdersController(client);

const getPaypalConfig = () => {
  return { clientId: process.env.PAYPAL_CLIENT_ID };
};

const getCurrencyConfig = async () => {
  const rate = await getInrToUsdRate();
  return { rate, currency: "USD" };
};

const processPaymentVerification = async (paypalOrderId, dbOrderId) => {
  const { result } = await ordersController.getOrder({
    id: paypalOrderId,
  });

  const orderDetails = result;
  if (
    orderDetails.status === "COMPLETED" ||
    orderDetails.status === "APPROVED"
  ) {
    const order = await Order.findById(dbOrderId);

    if (!order) {
      throw new AppError(MESSAGES.PAYMENT.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const paidAmount = parseFloat(orderDetails.purchaseUnits[0].amount.value);
    const orderTotal = parseFloat(order.totalPrice);

    const usdRate = await getCurrencyConfig();
   

    if (Math.abs(paidAmount - orderTotal * usdRate) > 0.01) {
      throw new AppError(
        MESSAGES.PAYMENT.AMOUNT_MISMATCH(paidAmount, orderTotal*usdRate),
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (order.isPaid) {
      return { verified: true, order, message: MESSAGES.PAYMENT.ALREADY_PAID };
    }
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: orderDetails.id,
      status: orderDetails.status,
      update_time: orderDetails.update_time || new Date().toISOString(), // Handling potential missing field in sandbox
      email_address: orderDetails.payer?.email_address, // Snake_case is standard for PayPal v2 API result used here
    };
    await order.save();
    return { verified: true, order };
  }
  throw new AppError(
    MESSAGES.PAYMENT.VERIFICATION_FAILED,
    HTTP_STATUS.BAD_REQUEST,
  );
};

export default {
  getPaypalConfig,
  processPaymentVerification,
  getCurrencyConfig,
};
