const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload } = require('../middlewares/multer.middleware');
const {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  getProfile,
  updateProfile
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);

router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.get('/profile/:username', auth, getProfile);
router.put('/profile', auth, upload.single('avatar'), updateProfile);

module.exports = router;
