const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { uploadOnCloudinary } = require("../utils/cloudinary.js");


const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least 1 image is required" });
    }

    if (req.files.length > 1) {
      return res.status(400).json({ success: false, message: "At most 1 image is allowed" });
    }

    console.log("Received files:", req.files.length);
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      });
    });

    const uploadedImage = await uploadOnCloudinary(req.files[0].path);

    if (!uploadedImage) {
      return res.status(400).json({ success: false, message: "Failed to upload image" });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      image: uploadedImage.url
    });

    await post.populate('user', 'username fullName avatar');

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('user', 'username fullName avatar');

    res.json({
      success: true,
      data: post,
      liked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  deletePost,
  toggleLike
};
