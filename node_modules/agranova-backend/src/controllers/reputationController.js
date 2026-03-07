const UserReputation = require('../models/UserReputation');
const User = require('../models/User');

// Get current user's reputation
exports.getMyReputation = async (req, res) => {
  try {
    let reputation = await UserReputation.findOne({ user: req.user.userId })
      .populate('user', 'name email region');

    if (!reputation) {
      // Create reputation record if doesn't exist
      reputation = new UserReputation({
        user: req.user.userId
      });
      await reputation.save();
      await reputation.populate('user', 'name email region');
    }

    res.json({
      success: true,
      data: reputation
    });
  } catch (error) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reputation'
    });
  }
};

// Get leaderboard (top farmers)
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, timeframe = 'all' } = req.query;

    let query = {};
    
    // Filter by timeframe if specified
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch(timeframe) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        query.updatedAt = { $gte: startDate };
      }
    }

    const leaderboard = await UserReputation.find(query)
      .populate('user', 'name email region')
      .sort({ points: -1, 'statistics.helpfulAnswers': -1 })
      .limit(parseInt(limit));

    // Update ranks
    leaderboard.forEach((rep, index) => {
      rep.rank = index + 1;
    });

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

// Award points to user
exports.awardPoints = async (req, res) => {
  try {
    const { userId, action, amount } = req.body;

    let reputation = await UserReputation.findOne({ user: userId });

    if (!reputation) {
      reputation = new UserReputation({ user: userId });
    }

    if (action) {
      reputation.addPoints(action);
    } else if (amount) {
      reputation.points += amount;
      reputation.updateBadge();
    }

    // Update statistics based on action
    if (action === 'reply') {
      reputation.statistics.totalAnswers += 1;
    } else if (action === 'helpful-vote') {
      reputation.statistics.helpfulAnswers += 1;
      reputation.statistics.totalHelpfulVotes += 1;
    } else if (action === 'post') {
      reputation.statistics.totalPosts += 1;
    }

    await reputation.save();

    res.json({
      success: true,
      data: reputation
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points'
    });
  }
};

// Get badge info
exports.getBadges = async (req, res) => {
  try {
    const badges = [
      {
        id: 'beginner-farmer',
        name: 'Beginner Farmer',
        description: 'Welcome to the community!',
        icon: '🌱',
        pointsRequired: 0,
        color: 'gray'
      },
      {
        id: 'active-helper',
        name: 'Active Helper',
        description: 'Helping other farmers regularly',
        icon: '🤝',
        pointsRequired: 100,
        color: 'blue'
      },
      {
        id: 'expert-farmer',
        name: 'Expert Farmer',
        description: 'Recognized expert in the community',
        icon: '⭐',
        pointsRequired: 500,
        color: 'purple'
      },
      {
        id: 'community-leader',
        name: 'Community Leader',
        description: 'Top contributor and leader',
        icon: '👑',
        pointsRequired: 1000,
        color: 'gold'
      }
    ];

    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges'
    });
  }
};

// Get user's reputation by ID
exports.getUserReputation = async (req, res) => {
  try {
    const { userId } = req.params;

    let reputation = await UserReputation.findOne({ user: userId })
      .populate('user', 'name email region');

    if (!reputation) {
      reputation = new UserReputation({ user: userId });
      await reputation.save();
      await reputation.populate('user', 'name email region');
    }

    res.json({
      success: true,
      data: reputation
    });
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reputation'
    });
  }
};

// Get community statistics
exports.getCommunityStats = async (req, res) => {
  try {
    const totalUsers = await UserReputation.countDocuments();
    const totalPoints = await UserReputation.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    
    const badgeDistribution = await UserReputation.aggregate([
      { $group: { _id: '$badge', count: { $sum: 1 } } }
    ]);

    const topContributors = await UserReputation.find()
      .populate('user', 'name')
      .sort({ points: -1 })
      .limit(3);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPoints: totalPoints[0]?.total || 0,
        badgeDistribution,
        topContributors
      }
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community statistics'
    });
  }
};

module.exports = exports;
