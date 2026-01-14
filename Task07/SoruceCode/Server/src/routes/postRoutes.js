const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload } = require('../middlewares/multer.middleware');
const {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  deletePost,
  toggleLike
} = require('../controllers/postController');

router.use(auth);

router.post('/', upload.array('images', 1), createPost);
router.get('/feed', getFeed);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);
router.delete('/:id', deletePost);
router.post('/:id/like', toggleLike);

module.exports = router;
