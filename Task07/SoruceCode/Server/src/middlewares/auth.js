const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || 
                  req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', expired: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = auth;
