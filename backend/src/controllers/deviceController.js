const Device = require('../models/Device');

// @desc    Get all devices
// @route   GET /api/devices
// @access  Public
exports.getDevices = async (req, res) => {
  try {
    const { category, inStock, minPrice, maxPrice, search } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (inStock === 'true') query.inStock = true;
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const devices = await Device.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
};

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Public
exports.getDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device'
    });
  }
};

// @desc    Create device (Admin only)
// @route   POST /api/devices
// @access  Private/Admin
exports.createDevice = async (req, res) => {
  try {
    const device = await Device.create(req.body);

    // Log device creation
    if (req.logChange) {
      req.logChange({
        action: 'CREATE',
        collectionName: 'Device',
        documentId: device._id,
        newValues: device.toObject(),
        reason: 'New device added by admin'
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_CREATED',
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'Device',
        relatedEntityId: device._id,
        description: `Created device: ${device.name || 'Unnamed'}`,
        data: { price: device.price },
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error creating device:', error);
    
    // Log failed creation
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_CREATION_FAILED',
        category: 'DEVICE_OPERATION',
        description: 'Failed to create device',
        result: 'FAILED',
        errorDetails: error.message,
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create device'
    });
  }
};

// @desc    Update device (Admin only)
// @route   PUT /api/devices/:id
// @access  Private/Admin
exports.updateDevice = async (req, res) => {
  try {
    // Get old values
    const oldDevice = await Device.findById(req.params.id);
    if (!oldDevice) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    const oldValues = oldDevice.toObject();

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Calculate changed fields
    const changedFields = Object.keys(req.body).filter(
      key => JSON.stringify(oldValues[key]) !== JSON.stringify(req.body[key])
    );

    // Log device update
    if (req.logChange && changedFields.length > 0) {
      req.logChange({
        action: 'UPDATE',
        collectionName: 'Device',
        documentId: device._id,
        oldValues,
        newValues: device.toObject(),
        changedFields,
        reason: `Device updated: ${changedFields.join(', ')}`
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log behavior
    if (req.logBehavior && changedFields.length > 0) {
      req.logBehavior({
        action: 'DEVICE_UPDATED',
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'Device',
        relatedEntityId: device._id,
        description: `Updated device: ${device.name || 'Unnamed'}`,
        data: { changedFields },
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error updating device:', error);
    
    // Log failed update
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_UPDATE_FAILED',
        category: 'DEVICE_OPERATION',
        relatedEntityId: req.params.id,
        description: 'Failed to update device',
        result: 'FAILED',
        errorDetails: error.message,
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update device'
    });
  }
};

// @desc    Delete device (Admin only)
// @route   DELETE /api/devices/:id
// @access  Private/Admin
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Log device deletion
    if (req.logChange) {
      req.logChange({
        action: 'DELETE',
        collectionName: 'Device',
        documentId: req.params.id,
        oldValues: device.toObject(),
        reason: `Device deleted: ${device.name || 'Unnamed'}`
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_DELETED',
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'Device',
        relatedEntityId: req.params.id,
        description: `Deleted device: ${device.name || 'Unnamed'}`,
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    
    // Log failed delete
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_DELETE_FAILED',
        category: 'DEVICE_OPERATION',
        relatedEntityId: req.params.id,
        description: 'Failed to delete device',
        result: 'FAILED',
        errorDetails: error.message,
        severity: 'HIGH'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete device'
    });
  }
};
