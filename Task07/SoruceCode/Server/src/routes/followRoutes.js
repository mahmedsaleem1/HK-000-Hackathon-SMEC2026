const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/followController');

router.use(auth);

router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;
