const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDatabaseConnected } = require('../config/database');
const { getDemoUser } = require('../controllers/authController');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret_key');
      
      if (isDatabaseConnected()) {
        req.user = await User.findById(decoded.id);
      } else {
        // Demo mode - get user from in-memory storage
        const user = getDemoUser(decoded.id);
        if (user) {
          const { password, ...userData } = user;
          req.user = userData;
        }
      }
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Admin middleware - must be used after protect middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

module.exports = { protect, adminOnly };
