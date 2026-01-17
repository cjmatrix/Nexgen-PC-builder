import Order from "../models/Order.js";
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import AppError from "../utils/AppError.js";

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
      throw new AppError("Order not found", 404);
    }


    const paidAmount = parseFloat(orderDetails.purchase_units[0].amount.value);
    const orderTotal = parseFloat(order.totalPrice);

   
    if (Math.abs(paidAmount - orderTotal) > 0.01) {
      throw new AppError(
        `Payment verification failed: Amount mismatch. Paid: ${paidAmount}, Expected: ${orderTotal}`,
        400
      );
    }

    if (order.isPaid) {
      return { verified: true, order, message: "Already paid" };
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
    "Payment verification failed or Status not Completed",
    400
  );
};

export default {
  getPaypalConfig,
  processPaymentVerification,
};
