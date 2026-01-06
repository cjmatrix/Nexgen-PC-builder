import Order from "../models/Order.js";
import { Client, Environment, LogLevel, OrdersController } from "@paypal/paypal-server-sdk";

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





export const getPaypalClientId = async (req, res, next) => {
  try {
    
    res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
  } catch (error) {
    next(error);
  }
};



export const verifyPayment = async (req, res, next) => {
  
  const { r_orderID, db_orderID } = req.body; // r_orderId is paypal order id and another is db our order id
  try {
   
    const { result } = await ordersController.getOrder({
      id: r_orderID,
    });
    
  
    const orderDetails = result;
    if (orderDetails.status === "COMPLETED" || orderDetails.status === "APPROVED") {
      
      const order = await Order.findById(db_orderID);
      
      if (order) {
      
        if (order.isPaid) {
          return res.json({ verified: true, order, message: "Already paid" });
        }
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: orderDetails.id,
          status: orderDetails.status,
          update_time: orderDetails.updateTime, 
          email_address: orderDetails.payer?.emailAddress, 
        };
        await order.save();
        return res.json({ verified: true, order });
      }
    }
    throw new AppError("Payment verification failed or Status not Completed", 400);
  } catch (error) {

    next(error);
  }
};
