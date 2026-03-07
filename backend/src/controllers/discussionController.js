const Discussion = require('../models/Discussion');
const UserReputation = require('../models/UserReputation');

// Helper function to award points
const awardPoints = async (userId, action) => {
  try {
    let reputation = await UserReputation.findOne({ user: userId });
    if (!reputation) {
      reputation = new UserReputation({ user: userId });
    }
    reputation.addPoints(action);
    
    // Update statistics
    if (action === 'post') {
      reputation.statistics.totalPosts += 1;
    } else if (action === 'reply') {
      reputation.statistics.totalAnswers += 1;
    } else if (action === 'helpful-vote') {
      reputation.statistics.helpfulAnswers += 1;
      reputation.statistics.totalHelpfulVotes += 1;
    }
    
    await reputation.save();
  } catch (error) {
    console.error('Error awarding points:', error);
  }
};

// Get all discussions with filters
exports.getDiscussions = async (req, res) => {
  try {
    const { category, problemType, search, sort = 'recent', page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by problem type
    if (problemType && problemType !== 'all') {
      query.problemType = problemType;
    }
    
    // Search in title and content
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'active':
        sortOption = { lastActivityAt: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'solved':
        query.isSolved = true;
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const discussions = await Discussion.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email')
      .populate('replies.author', 'name email')
      .lean();
    
    const total = await Discussion.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        discussions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions'
    });
  }
};

// Get single discussion by ID
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name email')
      .populate('replies.author', 'name email');
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion'
    });
  }
};

// Create new discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required'
      });
    }
    
    const discussion = new Discussion({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id
    });
    
    await discussion.save();
    await discussion.populate('author', 'name email');
    
    // Award points for creating post
    await awardPoints(req.user._id, 'post');
    
    res.status(201).json({
      success: true,
      data: discussion,
      message: 'Discussion created successfully'
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion'
    });
  }
};

// Add reply to discussion
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    discussion.replies.push({
      author: req.user._id,
      content
    });
    
    await discussion.updateActivity();
    await discussion.populate('replies.author', 'name email');
    
    // Award points for replying
    await awardPoints(req.user._id, 'reply');
    
    res.json({
      success: true,
      data: discussion,
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
};

// Like discussion
exports.likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    const userIndex = discussion.likes.indexOf(req.user._id);
    
    if (userIndex > -1) {
      // Unlike
      discussion.likes.splice(userIndex, 1);
    } else {
      // Like
      discussion.likes.push(req.user._id);
    }
    
    await discussion.save();
    
    res.json({
      success: true,
      data: {
        likes: discussion.likes.length,
        isLiked: userIndex === -1
      }
    });
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
};

// Mark reply as helpful
exports.markReplyHelpful = async (req, res) => {
  try {
    const { replyId } = req.params;
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Only author can mark reply as helpful
    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only discussion author can mark replies as helpful'
      });
    }
    
    const reply = discussion.replies.id(replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Toggle helpful status
    reply.isHelpful = !reply.isHelpful;
    reply.markedHelpfulBy = reply.isHelpful ? req.user._id : null;
    
    // Mark discussion as solved if any reply is helpful
    discussion.isSolved = discussion.replies.some(r => r.isHelpful);
    discussion.solvedBy = discussion.isSolved ? reply.author : null;
    
    await discussion.save();
    
    // Award points if marked as helpful
    if (reply.isHelpful) {
      await awardPoints(reply.author, 'helpful-vote');
    }
    
    res.json({
      success: true,
      data: discussion,
      message: reply.isHelpful ? 'Reply marked as helpful' : 'Helpful mark removed'
    });
  } catch (error) {
    console.error('Mark reply helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark reply as helpful'
    });
  }
};

// Get discussion statistics
exports.getStatistics = async (req, res) => {
  try {
    const total = await Discussion.countDocuments();
    const solved = await Discussion.countDocuments({ isSolved: true });
    const byCategory = await Discussion.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentActivity = await Discussion.find()
      .sort({ lastActivityAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .select('title lastActivityAt replies');
    
    res.json({
      success: true,
      data: {
        total,
        solved,
        unsolved: total - solved,
        byCategory,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
