const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  getStats,
  uploadMedia
} = require('../controllers/postController');

// Post CRUD routes
router.post('/', protect, uploadMedia, createPost);
router.get('/', getPosts); // Public - no auth required to view
router.get('/stats', getStats); // Public stats
router.get('/:id', getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Like routes
router.post('/:id/like', protect, toggleLike);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
