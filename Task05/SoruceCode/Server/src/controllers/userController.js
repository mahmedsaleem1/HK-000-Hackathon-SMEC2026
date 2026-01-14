const { v4: uuidv4 } = require('uuid');
const { users, friendConnections } = require('../data/store');

const generateQRCode = () => {
  return uuidv4().split('-')[0].toUpperCase();
};

const createUser = (req, res) => {
  try {
    const { name, avatar, socialInfo } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const userId = uuidv4();
    const qrCode = generateQRCode();
    
    const user = {
      id: userId,
      name: name.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      qrCode,
      socialInfo: {
        instagram: socialInfo?.instagram || '',
        snapchat: socialInfo?.snapchat || '',
        phone: socialInfo?.phone || ''
      },
      createdAt: new Date().toISOString()
    };

    users.set(userId, user);
    friendConnections.set(userId, []);

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
    
  
const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const user = users.get(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserByQRCode = (req, res) => {
  try {
    const { qrCode } = req.params;
    
    let foundUser = null;
    users.forEach((user) => {
      if (user.qrCode === qrCode.toUpperCase()) {
        foundUser = user;
      }
    });

    if (!foundUser) {
      return res.status(404).json({ success: false, message: 'User not found with this QR code' });
    }

    res.json({ success: true, data: foundUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = (req, res) => {
  try {
    const allUsers = Array.from(users.values());
    res.json({ success: true, data: allUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserSocials = (req, res) => {
  try {
    const { id } = req.params;
    const { socialInfo } = req.body;
    
    const user = users.get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.socialInfo = {
      instagram: socialInfo?.instagram || '',
      snapchat: socialInfo?.snapchat || '',
      phone: socialInfo?.phone || ''
    };

    users.set(id, user);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByQRCode,
  getAllUsers,
  updateUserSocials
};