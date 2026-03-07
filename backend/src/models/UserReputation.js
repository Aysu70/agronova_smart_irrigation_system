const mongoose = require('mongoose');

const userReputationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  badge: {
    type: String,
    enum: ['beginner-farmer', 'active-helper', 'expert-farmer', 'community-leader'],
    default: 'beginner-farmer'
  },
  statistics: {
    totalAnswers: { type: Number, default: 0 },
    helpfulAnswers: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalHelpfulVotes: { type: Number, default: 0 }
  },
  achievements: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  rank: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate badge based on points
userReputationSchema.methods.updateBadge = function() {
  if (this.points >= 1000) {
    this.badge = 'community-leader';
  } else if (this.points >= 500) {
    this.badge = 'expert-farmer';
  } else if (this.points >= 100) {
    this.badge = 'active-helper';
  } else {
    this.badge = 'beginner-farmer';
  }
};

// Add points for various actions
userReputationSchema.methods.addPoints = function(action) {
  const pointValues = {
    'post': 5,
    'reply': 10,
    'helpful-vote': 15,
    'best-answer': 25,
    'daily-login': 1
  };
  
  this.points += pointValues[action] || 0;
  this.updateBadge();
};

// Pre-save hook to update badge
userReputationSchema.pre('save', function(next) {
  this.updateBadge();
  next();
});

module.exports = mongoose.model('UserReputation', userReputationSchema);
