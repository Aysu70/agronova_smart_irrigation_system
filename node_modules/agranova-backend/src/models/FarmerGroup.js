const mongoose = require('mongoose');

const groupPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const farmerGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '/images/default-group.png'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  category: {
    type: String,
    enum: ['irrigation', 'crops', 'livestock', 'equipment', 'marketing', 'general'],
    default: 'general'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  posts: [groupPostSchema],
  rules: [String],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add creator as admin member on creation
farmerGroupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({
      user: this.creator,
      role: 'admin',
      joinedAt: new Date()
    });
  }
  next();
});

// Virtual for member count
farmerGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for post count
farmerGroupSchema.virtual('postCount').get(function() {
  return this.posts.length;
});

module.exports = mongoose.model('FarmerGroup', farmerGroupSchema);
