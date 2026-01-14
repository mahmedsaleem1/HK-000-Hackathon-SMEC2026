const express = require('express');
const router = express.Router();
const { 
  createUser, 
  getUserById, 
  getUserByQRCode,
  getAllUsers,
  updateUserSocials
} = require('../controllers/userController');

router.post('/', createUser);

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.get('/:id', getUserById);

router.get('/qr/:qrCode', getUserByQRCode);

router.put('/:id/socials', updateUserSocials);

module.exports = router;
