import * as authService from "../services/authService.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

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
  res.status(HTTP_STATUS.OK).json(result);
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const { user } = await authService.verifyOTP(email, otp);

  res.status(HTTP_STATUS.OK).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendOTP(email);
  res.status(HTTP_STATUS.OK).json(result);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );

  setCookies(res, accessToken, refreshToken);

  res.status(HTTP_STATUS.OK).json({
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
 
  res.status(HTTP_STATUS.OK).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const { newAccessToken, newRefreshToken } =
      await authService.refreshAccessToken(refreshToken);

    setCookies(res, newAccessToken, newRefreshToken);

    res.status(HTTP_STATUS.OK).json({ message: MESSAGES.AUTH.REFRESH_SUCCESS });
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
  res.status(HTTP_STATUS.OK).json(user);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(HTTP_STATUS.OK).json(result);
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const result = await authService.resetPassword(resetToken, password);
  res.status(HTTP_STATUS.OK).json(result);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  res.status(HTTP_STATUS.OK).json(result);
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
    res.status(HTTP_STATUS.UNAUTHORIZED);
    throw new Error(MESSAGES.AUTH.ADMIN_UNAUTHORIZED);
  }

  setAdminCookies(res, accessToken, refreshToken);

  res.status(HTTP_STATUS.OK).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const adminLogout = async (req, res) => {
  const { adminRefreshToken } = req.cookies;
  await authService.logoutUser(adminRefreshToken);

  res.cookie("adminAccessToken", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("adminRefreshToken", "", { httpOnly: true, expires: new Date(0) });

  res
    .status(HTTP_STATUS.OK)
    .json({ message: MESSAGES.AUTH.ADMIN_LOGOUT_SUCCESS });
};

const refreshAdminToken = async (req, res) => {
  try {
    const { adminRefreshToken } = req.cookies;
    if (!adminRefreshToken) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.AUTH.NO_REFRESH_TOKEN });
    }
    const { newAccessToken, newRefreshToken } =
      await authService.refreshAccessToken(adminRefreshToken);

    setAdminCookies(res, newAccessToken, newRefreshToken);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: MESSAGES.AUTH.ADMIN_REFRESH_SUCCESS });
  } catch (error) {
    res.cookie("adminAccessToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie("adminRefreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    throw error;
  }
};

const getAdminProfile = async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(HTTP_STATUS.OK).json(user);
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
