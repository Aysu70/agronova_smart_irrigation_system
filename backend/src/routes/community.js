const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGroups,
  createGroup,
  joinGroup,
  getMessages,
  sendMessage,
  getQuestions,
  createQuestion,
  addAnswer,
  markBestAnswer
} = require('../controllers/communityController');

// Group routes
router.get('/groups', protect, getGroups);
router.post('/groups', protect, createGroup);
router.post('/groups/:groupId/join', protect, joinGroup);

// Message routes
router.get('/groups/:groupId/messages', protect, getMessages);
router.post('/groups/:groupId/messages', protect, sendMessage);

// Q&A routes
router.get('/questions', protect, getQuestions);
router.post('/questions', protect, createQuestion);
router.post('/questions/:questionId/answers', protect, addAnswer);
router.put('/questions/:questionId/answers/:answerId/best', protect, markBestAnswer);

module.exports = router;
