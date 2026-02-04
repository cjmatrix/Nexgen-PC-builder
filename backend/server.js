import "dotenv/config";
import "./worker/emailWorker.js";
import "./worker/aiWorker.js";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { xss } from "express-xss-sanitizer";

import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import blacklistRoutes from "./routes/blacklistRoutes.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import userRoutes from "./routes/userRoutes.js";

import wishlistRoutes from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import componentRoutes from "./routes/componentRoutes.js";

import morgan from "morgan";

import { globalLimiter } from "./middleware/rateLimitMiddleware.js";

const app = express();

app.use(helmet());

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize(req.query);

    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, sanitizedQuery);
  }
  next();
});
app.use(xss());
app.use(cookieParser());

app.use(passport.initialize());

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "https://bdghml9c-5173.euw.devtunnels.ms"],
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use("/api", globalLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/referral", referralRoutes);
app.use("/api/v1/blacklist", blacklistRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/componentspublic", componentRoutes);

app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/wallet", walletRoutes);

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use(errorMiddleware);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
