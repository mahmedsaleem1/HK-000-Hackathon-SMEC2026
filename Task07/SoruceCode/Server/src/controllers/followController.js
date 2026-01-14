const Follow = require('../models/Follow');
const User = require('../models/User');


const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);

    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.userId
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    await Follow.create({
      follower: req.user._id,
      following: req.params.userId
    });

    res.json({ success: true, message: `Now following ${userToFollow.username}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const result = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: req.params.userId
    });

    if (!result) {
      return res.status(400).json({ success: false, message: 'Not following this user' });
    }

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get followers
const getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.userId })
      .populate('follower', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: followers.map(f => f.follower)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get following
const getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.userId })
      .populate('following', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: following.map(f => f.following)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
