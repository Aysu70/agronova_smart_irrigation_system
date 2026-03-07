const express = require('express');
const router = express.Router();
const reputationController = require('../controllers/reputationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get current user's reputation
router.get('/me', reputationController.getMyReputation);

// Get leaderboard
router.get('/leaderboard', reputationController.getLeaderboard);

// Get badges information
router.get('/badges', reputationController.getBadges);

// Get user's reputation by ID
router.get('/user/:userId', reputationController.getUserReputation);

// Award points (used by other controllers)
router.post('/award', reputationController.awardPoints);

// Get community statistics
router.get('/stats', reputationController.getCommunityStats);

module.exports = router;
