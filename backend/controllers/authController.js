
const authService = require("../services/authService");

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
  try {
    const result = await authService.registerUser(req.body);
    res.status(200).json(result); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyOTP(
      email,
      otp
    );

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOTP(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
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
  } catch (error) {
    const statusCode = error.message === "Invalid credentials" ? 401 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    await authService.logoutUser(refreshToken);

    res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
    res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
    res.status(403).json({ message: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;
    const result = await authService.resetPassword(resetToken, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyOTP,
  resendOTP,
  getProfile,
  forgotPassword,
  resetPassword,
};
