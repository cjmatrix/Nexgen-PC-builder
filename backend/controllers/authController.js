const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { generateTokens, clearTokens } = require("../utils/generateToken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email, isDeleted: false }).select(
      "+password"
    );

    if (!user ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "suspended" || user.status === "banned") {
      return res.status(403).json({
        message:
          "Your account has been suspended or banned. Please contact support.",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = Date.now();
    await user.save();

   await generateTokens(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
   try{
      const incomingRefreshToken = req.cookies.refreshToken;
  if (incomingRefreshToken) {
    const decoded = jwt.decode(incomingRefreshToken);

    if (decoded) {
     
      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (user) {
         
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t !== incomingRefreshToken
        );

        await user.save();
      }
    }
  }


  clearTokens(res);
  res.status(200).json({ message: "Logged out successfully" });
   }
   catch(error){
    console.log('erroring')
   }
  
};

const refreshToken = async (req, res) => {
  try {
    
    const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) return res.status(401).json({ message: "No token" });


  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findOne({ _id: decoded.id }).select('+refreshTokens');
  console.log(user,'hii')

  if (!user || !user.refreshTokens.includes(incomingRefreshToken)) {

    if (user) {
        user.refreshTokens = [];
        await user.save();
    }
    return res.status(403).json({ message: "Invalid refresh token (Reuse detected)" });
  }


  const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 10});
  const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

 
  user.refreshTokens = user.refreshTokens.filter(t => t !== incomingRefreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 10000,
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Refreshed" });
  } catch (error) {
    clearTokens(res);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = {
  login,
  logout,
  register,
  refreshToken,
};
