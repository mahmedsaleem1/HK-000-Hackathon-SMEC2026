const User = require('../models/User');
const Follow = require('../models/Follow');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 
};

const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;


    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email ? 'Email already exists' : 'Username already taken' 
      });
    }

    const user = await User.create({ username, email, password, fullName });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      data: { user, accessToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({ 
      success: true, 
      message: 'Login successful',
      data: { user, accessToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({ 
      success: true, 
      data: { accessToken }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followersCount = await Follow.countDocuments({ following: req.user._id });
    const followingCount = await Follow.countDocuments({ follower: req.user._id });

    res.json({ 
      success: true, 
      data: { 
        ...user.toJSON(),
        followersCount,
        followingCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });
    
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower: req.user._id, following: user._id });
      isFollowing = !!follow;
    }

    res.json({ 
      success: true, 
      data: { 
        ...user.toJSON(),
        followersCount,
        followingCount,
        isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    let avatarUrl = undefined;

    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.path);
      if (uploadedImage) {
        avatarUrl = uploadedImage.url;
      }
      
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    const updateData = { fullName, bio };
    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  getProfile,
  updateProfile
};
