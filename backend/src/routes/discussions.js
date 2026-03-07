const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', discussionController.getDiscussions);
router.get('/statistics', discussionController.getStatistics);
router.get('/:id', discussionController.getDiscussionById);

// Protected routes
router.use(protect);
router.post('/', discussionController.createDiscussion);
router.post('/:id/replies', discussionController.addReply);
router.post('/:id/like', discussionController.likeDiscussion);
router.put('/:id/replies/:replyId/helpful', discussionController.markReplyHelpful);

module.exports = router;
