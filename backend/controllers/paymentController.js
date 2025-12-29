import Razorpay from "razorpay";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import { createOrder, updateOrderStatus } from "../services/orderService.js";
import User from "../models/User.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrder = async (req, res) => {
  const { orderData } = req.body;
  const userId = req.user._id;
  // 1. Create the Local Database Order first (Pending Payment)
  // We use your existing service, but force the payment method to "Online"
  orderData.paymentMethod = "Online"; 
  const user = await User.findById(userId);
  const newOrder = await createOrder(userId, user, orderData);
  // 2. Create Razorpay Order
  const options = {
    amount: Math.round(newOrder.totalPrice), // Amount in paise
    currency: "INR",
    receipt: newOrder.orderId,
    payment_capture: 1, // Auto capture
  };
  try {
    const razorpayOrder = await razorpay.orders.create(options);
    
    // Return both the DB Order and Razorpay Order details
    res.status(200).json({
      success: true,
      order: newOrder,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    // Optional: Cancel the local order if Razorpay fails
    throw new AppError("Payment initiation failed", 500);
  }
};
// 2. Verify Payment (Webhook or Callback)
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  // 1. Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  if (expectedSignature === razorpay_signature) {
    // 2. Update Order Status to "Paid"
    await updateOrderStatus(orderId, "Paid");
    res.status(200).json({
      success: true,
      message: "Payment verified and order updated",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
};