const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  createComment,
  getComments,
  deleteComment
} = require('../controllers/commentController');

router.use(auth);

router.post('/post/:postId', createComment);
router.get('/post/:postId', getComments);
router.delete('/:id', deleteComment);

module.exports = router;
