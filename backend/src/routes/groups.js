const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Group routes
router.get('/', groupController.getGroups);
router.post('/', groupController.createGroup);
router.get('/:id', groupController.getGroup);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Membership routes
router.post('/:id/join', groupController.joinGroup);
router.post('/:id/leave', groupController.leaveGroup);

// Post routes
router.post('/:id/posts', groupController.createPost);
router.post('/:id/posts/:postId/like', groupController.likePost);
router.post('/:id/posts/:postId/comments', groupController.addComment);

module.exports = router;
