
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m", // Production standard
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  const user = await User.findById(userId).select("+refreshTokens");
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw new Error("Please add all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });

  
  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status === "suspended" || user.status === "banned") {
    throw new Error("Your account has been suspended or banned. Please contact support.");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }


  user.lastLogin = Date.now();
  await user.save();

  const tokens = await generateTokens(user._id);

  return { user, ...tokens };
};

const logoutUser = async (incomingRefreshToken) => {
  if (incomingRefreshToken) {
    const decoded = jwt.decode(incomingRefreshToken);
    if (decoded) {
      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (user) {
        // Remove the specific token from the array
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t !== incomingRefreshToken
        );
        await user.save();
      }
    }
  }
  return true;
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new Error("No token");

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findOne({ _id: decoded.id }).select('+refreshTokens');

  if (!user || !user.refreshTokens.includes(incomingRefreshToken)) {
    if (user) {

        user.refreshTokens = [];
        await user.save();
    }
    throw new Error("Invalid refresh token (Reuse detected)");
  }

  const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m'});
  const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  user.refreshTokens = user.refreshTokens.filter(t => t !== incomingRefreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { newAccessToken, newRefreshToken };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};