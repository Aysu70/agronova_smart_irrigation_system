const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isHelpful: {
    type: Boolean,
    default: false
  },
  markedHelpfulBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemType: {
    type: String,
    required: true,
    enum: [
      'irrigation',
      'plant-disease',
      'soil-issues',
      'equipment-problems',
      'weather-damage',
      'pests',
      'fertilization',
      'harvesting',
      'general',
      'other'
    ],
    default: 'general'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'irrigation-problems',
      'crop-diseases',
      'soil-fertility',
      'equipment-devices',
      'weather-climate',
      'general-questions'
    ]
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  replies: [replySchema],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGeneralChat: {
    type: Boolean,
    default: false
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ title: 'text', content: 'text' });
discussionSchema.index({ lastActivityAt: -1 });

// Update lastActivityAt when replies are added
discussionSchema.methods.updateActivity = function() {
  this.lastActivityAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Discussion', discussionSchema);
