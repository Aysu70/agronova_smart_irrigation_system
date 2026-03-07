const FarmerGroup = require('../models/FarmerGroup');
const UserReputation = require('../models/UserReputation');

// Get all groups (public groups, or user's groups)
exports.getGroups = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    const userId = req.user.userId;

    let query = { isActive: true };

    // Filter by type
    if (type === 'my-groups') {
      query['members.user'] = userId;
    } else if (type === 'public') {
      query.type = 'public';
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await FarmerGroup.find(query)
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups'
    });
  }
};

// Get single group
exports.getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id)
      .populate('creator', 'name email region')
      .populate('members.user', 'name email region')
      .populate('posts.author', 'name email')
      .populate('posts.comments.author', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user has access (public group or member)
    const isMember = group.members.some(m => m.user._id.toString() === userId);
    if (group.type === 'private' && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: group,
      userRole: group.members.find(m => m.user._id.toString() === userId)?.role || 'visitor'
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group'
    });
  }
};

// Create group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, type, category, rules, tags } = req.body;
    const userId = req.user.userId;

    const group = new FarmerGroup({
      name,
      description,
      type: type || 'public',
      category: category || 'general',
      creator: userId,
      rules: rules || [],
      tags: tags || []
    });

    await group.save();
    await group.populate('creator', 'name email');

    // Award points for creating group
    const reputation = await UserReputation.findOne({ user: userId });
    if (reputation) {
      reputation.points += 10;
      await reputation.save();
    }

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group'
    });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, category, rules, tags, image } = req.body;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    const member = group.members.find(m => m.user.toString() === userId);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update group'
      });
    }

    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;
    if (type) group.type = type;
    if (category) group.category = category;
    if (rules) group.rules = rules;
    if (tags) group.tags = tags;
    if (image) group.image = image;

    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
};

// Join group
exports.joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member'
      });
    }

    // Add member
    group.members.push({
      user: userId,
      role: 'member'
    });

    await group.save();
    await group.populate('members.user', 'name email');

    res.json({
      success: true,
      message: 'Joined group successfully',
      data: group
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group'
    });
  }
};

// Leave group
exports.leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Can't leave if you're the creator
    if (group.creator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot leave the group'
      });
    }

    // Remove member
    group.members = group.members.filter(m => m.user.toString() !== userId);

    await group.save();

    res.json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group'
    });
  }
};

// Create post in group
exports.createPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, image } = req.body;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Must be a member to post'
      });
    }

    // Add post
    group.posts.unshift({
      author: userId,
      content,
      image: image || null,
      likes: [],
      comments: []
    });

    await group.save();
    await group.populate('posts.author', 'name email');

    res.json({
      success: true,
      data: group.posts[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Like post
exports.likePost = async (req, res) => {
  try {
    const { id, postId } = req.params;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const post = group.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Toggle like
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await group.save();

    res.json({
      success: true,
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post'
    });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { id, postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const post = group.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add comment
    post.comments.push({
      author: userId,
      content
    });

    await group.save();
    await group.populate('posts.comments.author', 'name email');

    res.json({
      success: true,
      data: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Delete group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const group = await FarmerGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Only creator can delete
    if (group.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only creator can delete group'
      });
    }

    await FarmerGroup.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group'
    });
  }
};

module.exports = exports;
