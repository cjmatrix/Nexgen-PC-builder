import express from "express";
const router = express.Router();
import passport from "passport";
import "../config/passport.js";
import * as authService from "../services/authService.js";
import {
  register,
  login,
  logout,
  refreshToken,
  verifyOTP,
  resendOTP,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  adminLogin,
  adminLogout,
  refreshAdminToken,
  getAdminProfile,
} from "../controllers/authController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/authValidators.js";

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);
router.post("/resend-otp", validate(resendOTPSchema), resendOTP);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.put(
  "/reset-password/:resetToken",
  validate(resetPasswordSchema),
  resetPassword,
);
router.put(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword,
);
router.get("/profile", protect, getProfile);

// Admin Routes
router.post("/admin/login", validate(loginSchema), adminLogin);
router.post("/admin/logout", adminLogout);
router.post("/admin/refresh", refreshAdminToken);
router.get("/admin/profile", protectAdmin, getAdminProfile);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const { accessToken, refreshToken } = await authService.generateTokens(
        req.user._id,
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15m
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      res.redirect(`${process.env.CLIENT_URL}/products`);
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }
  },
);

export default router;
