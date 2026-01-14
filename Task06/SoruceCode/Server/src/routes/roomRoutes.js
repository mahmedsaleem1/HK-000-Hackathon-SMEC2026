const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/:roomId/valid', roomController.checkRoom);

module.exports = router;
