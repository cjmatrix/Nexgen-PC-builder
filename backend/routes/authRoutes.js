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

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);
router.put("/change-password", protect, changePassword);
router.get("/profile", protect, getProfile);
 
// Admin Routes
router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);
router.post("/admin/refresh", refreshAdminToken);
router.get("/admin/profile", protectAdmin, getAdminProfile);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
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
        req.user._id
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

      res.redirect("http://localhost:5173/products");
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.redirect("http://localhost:5173/login?error=google_auth_failed");
    }
  }
);

export default router;
