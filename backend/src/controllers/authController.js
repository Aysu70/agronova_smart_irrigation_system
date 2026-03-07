const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isDatabaseConnected } = require('../config/database');

// In-memory user store for demo mode (when database is not connected)
const demoUsers = new Map();

// Initialize demo admin user
(async () => {
  const adminPassword = await bcrypt.hash('admin123', 12);
  demoUsers.set('admin@agranova.com', {
    _id: 'admin_001',
    name: 'Admin User',
    email: 'admin@agranova.com',
    password: adminPassword,
    role: 'admin',
    region: 'Baku',
    crops: [],
    createdAt: new Date()
  });
})();

// Export for use in middleware
exports.getDemoUser = (id) => {
  return Array.from(demoUsers.values()).find(u => u._id === id);
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'demo_secret_key', {
    expiresIn: '30d'
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, region, crops } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    // Validation
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Determine role - admin@agranova.com gets admin role automatically
    const role = normalizedEmail === 'admin@agranova.com' ? 'admin' : 'user';

    if (isDatabaseConnected()) {
      // Database mode
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role,
        region,
        crops
      });

      // Log user creation
      if (req.logChange) {
        req.logChange({
          action: 'CREATE',
          collectionName: 'User',
          documentId: user._id,
          newValues: { name, email, role, region, crops },
          reason: 'User self-registration'
        }).catch(err => console.error('Audit log error:', err));
      }

      // Log registration behavior
      if (req.logBehavior) {
        req.logBehavior({
          action: 'USER_REGISTERED',
          category: 'AUTHENTICATION',
          relatedEntityType: 'User',
          relatedEntityId: user._id,
          description: `New user registered: ${normalizedEmail}`,
          result: 'SUCCESS',
          data: { role, region },
          severity: 'LOW'
        }).catch(err => console.error('Audit log error:', err));
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          region: user.region,
          crops: user.crops,
          token: generateToken(user._id)
        }
      });
    } else {
      // Demo mode - in-memory storage
      if (demoUsers.has(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = Date.now().toString();
      
      const user = {
        _id: userId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        region: region || '',
        crops: crops || [],
        createdAt: new Date()
      };

      demoUsers.set(normalizedEmail, user);

      res.status(201).json({
        success: true,
        message: 'Registration successful (Demo Mode)',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          region: user.region,
          crops: user.crops,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    // Check if email and password provided
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (isDatabaseConnected()) {
      // Database mode
      let user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        if (normalizedEmail === 'admin@agranova.com' && password === 'admin123') {
          user = await User.create({
            name: 'Admin User',
            email: normalizedEmail,
            password,
            role: 'admin',
            region: 'Baku',
            crops: []
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      }

      const isMatch = user.password ? await user.comparePassword(password) : true;
      if (!isMatch) {
        // Log failed login attempt
        if (req.logBehavior) {
          req.logBehavior({
            action: 'LOGIN_FAILED_INVALID_CREDENTIALS',
            category: 'AUTHENTICATION',
            description: `Failed login attempt for: ${normalizedEmail}`,
            result: 'FAILED',
            severity: 'HIGH'
          }).catch(err => console.error('Audit log error:', err));
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Log successful login
      if (req.logBehavior) {
        req.logBehavior({
          action: 'USER_LOGIN_SUCCESS',
          category: 'AUTHENTICATION',
          relatedEntityType: 'User',
          relatedEntityId: user._id,
          description: `User ${normalizedEmail} logged in successfully`,
          result: 'SUCCESS',
          data: { role: user.role },
          severity: 'LOW'
        }).catch(err => console.error('Audit log error:', err));
      }

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          region: user.region,
          crops: user.crops,
          token: generateToken(user._id)
        }
      });
    } else {
      // Demo mode - in-memory storage
      let user = demoUsers.get(normalizedEmail);
      if (!user) {
        if (normalizedEmail === 'admin@agranova.com' && password === 'admin123') {
          const hashedPassword = await bcrypt.hash(password, 12);
          user = {
            _id: 'admin_001',
            name: 'Admin User',
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin',
            region: 'Baku',
            crops: [],
            createdAt: new Date()
          };
          demoUsers.set(normalizedEmail, user);
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          region: user.region,
          crops: user.crops,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const user = await User.findById(req.user._id);
      res.status(200).json({
        success: true,
        data: user
      });
    } else {
      // Demo mode - find user in memory
      const user = Array.from(demoUsers.values()).find(u => u._id === req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      const { password, ...userData } = user;
      res.status(200).json({
        success: true,
        data: userData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, region, crops } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, region, crops },
      { new: true, runValidators: true }
    );

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
