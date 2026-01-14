const express = require('express');
const router = express.Router();
const { 
  connectFriend, 
  getFriends, 
  removeFriend 
} = require('../controllers/friendController');

router.post('/connect', connectFriend);

router.get('/:userId', getFriends);

router.delete('/remove', removeFriend);

module.exports = router;
