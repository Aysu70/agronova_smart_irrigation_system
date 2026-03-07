const User = require('../models/User');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single user (Admin only)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Promote user to admin (Admin only)
exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    user.role = 'admin';
    await user.save();

    // Log role change
    if (req.logChange) {
      req.logChange({
        action: 'UPDATE',
        collectionName: 'User',
        documentId: user._id,
        oldValues: { role: 'user' },
        newValues: { role: 'admin' },
        changedFields: ['role'],
        reason: `User promoted to admin by ${req.user.email}`
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log admin action
    if (req.logBehavior) {
      req.logBehavior({
        action: 'USER_PROMOTED_ADMIN',
        category: 'ADMIN_ACTION',
        relatedEntityType: 'User',
        relatedEntityId: user._id,
        description: `Promoted user ${user.email} to admin`,
        severity: 'HIGH'
      }).catch(err => console.error('Audit log error:', err));
    }
    
    res.status(200).json({
      success: true,
      message: `${user.name} has been promoted to admin`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Demote admin to user (Admin only)
exports.demoteToUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'User is already a regular user'
      });
    }

    // Prevent demoting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote yourself'
      });
    }

    user.role = 'user';
    await user.save();

    // Log role change
    if (req.logChange) {
      req.logChange({
        action: 'UPDATE',
        collectionName: 'User',
        documentId: user._id,
        oldValues: { role: 'admin' },
        newValues: { role: 'user' },
        changedFields: ['role'],
        reason: `User demoted from admin by ${req.user.email}`
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log admin action
    if (req.logBehavior) {
      req.logBehavior({
        action: 'USER_DEMOTED_ADMIN',
        category: 'ADMIN_ACTION',
        relatedEntityType: 'User',
        relatedEntityId: user._id,
        description: `Demoted user ${user.email} from admin`,
        severity: 'HIGH'
      }).catch(err => console.error('Audit log error:', err));
    }
    
    res.status(200).json({
      success: true,
      message: `${user.name} has been demoted to regular user`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete yourself'
      });
    }

    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
