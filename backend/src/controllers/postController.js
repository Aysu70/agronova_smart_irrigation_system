const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/posts');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp/;
  const allowedVideos = /mp4|mov|avi|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (file.fieldname === 'images' && allowedImages.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'videos' && allowedVideos.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}: ${ext}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
    files: 7 // Max 5 images + 2 videos
  }
});

// Middleware for handling file uploads
exports.uploadMedia = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, problemType, category, tags } = req.body;
    const userId = req.user._id;

    if (!title || !description || !problemType || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, problem type, and category are required'
      });
    }

    // Process uploaded files
    const media = {
      images: [],
      videos: []
    };

    if (req.files) {
      if (req.files.images) {
        media.images = req.files.images.map(file => ({
          url: `/uploads/posts/${file.filename}`,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }));
      }
      if (req.files.videos) {
        media.videos = req.files.videos.map(file => ({
          url: `/uploads/posts/${file.filename}`,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }));
      }
    }

    const post = new Post({
      authorId: userId,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      title: title.trim(),
      description: description.trim(),
      problemType,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      media
    });

    await post.save();

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('newPost', {
        post: post.toJSON(),
        author: {
          _id: userId,
          name: req.user.name,
          avatar: req.user.avatar
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: post.toJSON()
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Get all posts with filtering and pagination
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      problemType,
      category,
      authorId,
      sort = 'recent',
      search
    } = req.query;

    const query = {};

    if (problemType) query.problemType = problemType;
    if (category) query.category = category;
    if (authorId) query.authorId = authorId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Determine sort order
    let sortQuery = {};
    switch (sort) {
      case 'popular':
        sortQuery = { likes: -1, views: -1, createdAt: -1 };
        break;
      case 'discussed':
        sortQuery = { comments: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortQuery = { isPinned: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(query)
    ]);

    // Add computed fields
    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0,
      isLikedByUser: req.user ? post.likes?.some(id => id.toString() === req.user._id.toString()) : false
    }));

    res.json({
      success: true,
      posts: postsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const postWithCounts = {
      ...post,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0,
      isLikedByUser: req.user ? post.likes?.some(id => id.toString() === req.user._id.toString()) : false
    };

    res.json({
      success: true,
      post: postWithCounts
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, problemType, category, tags, status } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check authorization
    if (post.authorId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this post'
      });
    }

    // Update fields
    if (title) post.title = title.trim();
    if (description) post.description = description.trim();
    if (problemType) post.problemType = problemType;
    if (category) post.category = category;
    if (tags) post.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (status) post.status = status;

    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: post.toJSON()
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check authorization
    if (post.authorId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this post'
      });
    }

    // Delete associated files
    const uploadDir = path.join(__dirname, '../../uploads/posts');
    const filesToDelete = [
      ...(post.media?.images || []).map(img => img.filename),
      ...(post.media?.videos || []).map(vid => vid.filename)
    ];

    await Promise.all(
      filesToDelete.map(filename =>
        fs.unlink(path.join(uploadDir, filename)).catch(() => {})
      )
    );

    await Post.findByIdAndDelete(id);

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('postDeleted', { postId: id });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Toggle like on a post
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const result = await post.toggleLike(userId);

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('postLikeToggled', {
        postId: id,
        userId,
        liked: result.liked,
        likeCount: result.likeCount
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await post.addComment(
      userId,
      req.user.name,
      req.user.avatar,
      content.trim()
    );

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('postCommentAdded', {
        postId: id,
        comment: {
          _id: comment._id,
          authorId: userId,
          authorName: req.user.name,
          authorAvatar: req.user.avatar,
          content: comment.content,
          createdAt: comment.createdAt
        },
        commentCount: post.comments.length
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        _id: comment._id,
        authorId: userId,
        authorName: req.user.name,
        authorAvatar: req.user.avatar,
        content: comment.content,
        createdAt: comment.createdAt
      },
      commentCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const post = await Post.findById(id).select('comments').lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comments = post.comments || [];
    const total = comments.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedComments = comments.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      comments: paginatedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.deleteComment(commentId, userId);

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('postCommentDeleted', {
        postId: id,
        commentId,
        commentCount: post.comments.length
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentCount: post.comments.length
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete comment',
      error: error.message
    });
  }
};

// Get post statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await Post.aggregate([
      {
        $group: {
          _id: '$problemType',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalPosts = await Post.countDocuments();

    res.json({
      success: true,
      stats: {
        byProblemType: stats,
        total: totalPosts
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
