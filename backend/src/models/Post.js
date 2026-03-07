const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorAvatar: String,
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorAvatar: String,
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  problemType: {
    type: String,
    required: true,
    enum: [
      'crop-health',
      'irrigation',
      'soil-fertility',
      'equipment-tech',
      'weather-climate',
      'harvesting',
      'general',
      'other'
    ],
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  media: {
    images: [{
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    }],
    videos: [{
      url: String,
      filename: String,
      mimetype: String,
      size: Number
    }]
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
postSchema.index({ createdAt: -1 });
postSchema.index({ problemType: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Include virtuals in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Methods
postSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const index = this.likes.findIndex(id => id.toString() === userIdStr);
  
  if (index > -1) {
    // Unlike
    this.likes.splice(index, 1);
    await this.save();
    return { liked: false, likeCount: this.likes.length };
  } else {
    // Like
    this.likes.push(userId);
    await this.save();
    return { liked: true, likeCount: this.likes.length };
  }
};

postSchema.methods.addComment = async function(userId, userName, userAvatar, content) {
  this.comments.push({
    authorId: userId,
    authorName: userName,
    authorAvatar: userAvatar,
    content
  });
  await this.save();
  return this.comments[this.comments.length - 1];
};

postSchema.methods.deleteComment = async function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  if (comment.authorId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to delete this comment');
  }
  comment.remove();
  await this.save();
  return true;
};

postSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(id => id.toString() === userId.toString());
};

module.exports = mongoose.model('Post', postSchema);
