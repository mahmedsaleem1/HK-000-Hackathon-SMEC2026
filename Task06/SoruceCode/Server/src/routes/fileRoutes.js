const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middlewares/uploadMiddleware');

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/download/:filename', fileController.downloadFile);
router.get('/room/:roomId', fileController.getRoomFiles);

module.exports = router;
