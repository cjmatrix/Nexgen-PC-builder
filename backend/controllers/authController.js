import * as authService from "../services/authService.js";
import AppError from "../utils/AppError.js";

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(200).json(result);
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const { user } = await authService.verifyOTP(email, otp);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendOTP(email);
  res.status(200).json(result);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );

  setCookies(res, accessToken, refreshToken);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  await authService.logoutUser(refreshToken);

  res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });

  res.status(200).json({ message: "Logged out successfully" });
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const { newAccessToken, newRefreshToken } =
      await authService.refreshAccessToken(refreshToken);

    setCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ message: "Refreshed" });
  } catch (error) {
    res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
    res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
    throw error;
  }
};

const getProfile = async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json(user);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json(result);
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const result = await authService.resetPassword(resetToken, password);
  res.status(200).json(result);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  res.status(200).json(result);
};

// --- Admin Auth Functions ---

const setAdminCookies = (res, accessToken, refreshToken) => {
  res.cookie("adminAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("adminRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );

  if (user.role !== "admin") {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }

  setAdminCookies(res, accessToken, refreshToken);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const adminLogout = async (req, res) => {
  // Ideally, invalidate refresh token in DB if you track them
  const { adminRefreshToken } = req.cookies;
  await authService.logoutUser(adminRefreshToken);

  res.cookie("adminAccessToken", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("adminRefreshToken", "", { httpOnly: true, expires: new Date(0) });

  res.status(200).json({ message: "Admin logged out successfully" });
};

const refreshAdminToken = async (req, res) => {
  try {
    const { adminRefreshToken } = req.cookies;
    if (!adminRefreshToken) {
      return res
        .status(401)
        .json({ message: "Not authorized, no refresh token" });
    }
    const { newAccessToken, newRefreshToken } =
      await authService.refreshAccessToken(adminRefreshToken);

    setAdminCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ message: "Admin token refreshed" });
  } catch (error) {
    res.cookie("adminAccessToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie("adminRefreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    throw error; // Let global error handler catch it
  }
};

const getAdminProfile = async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json(user);
};

export {
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
};
