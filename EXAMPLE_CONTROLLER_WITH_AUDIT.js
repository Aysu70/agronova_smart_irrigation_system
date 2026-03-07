/**
 * EXAMPLE CONTROLLER WITH AUDIT LOGGING
 * 
 * This demonstrates how to integrate the audit and behavior logging system
 * into your existing controllers. You can follow this pattern for all controllers.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const AuditService = require('../services/auditService');

/**
 * CREATE: Add new device with audit logging
 * POST /api/devices
 */
router.post('/', auth, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!req.body.name) {
      throw new Error('Device name is required');
    }

    // Create device
    const deviceData = {
      userId: req.user.id,
      name: req.body.name,
      type: req.body.type,
      location: req.body.location,
      status: 'ACTIVE',
      ...req.body
    };

    const device = new Device(deviceData);
    await device.save();

    // Log the change
    await req.logChange({
      action: 'CREATE',
      collectionName: 'Device',
      documentId: device._id,
      newValues: deviceData,
      reason: 'Device created by user'
    });

    // Log the behavior
    await req.logBehavior({
      action: 'DEVICE_CREATED',
      category: 'DEVICE_OPERATION',
      relatedEntityType: 'Device',
      relatedEntityId: device._id,
      description: `Created new device: ${device.name}`,
      data: {
        deviceType: device.type,
        location: device.location
      },
      severity: 'LOW'
    });

    res.status(201).json({
      success: true,
      data: device,
      message: 'Device created successfully'
    });

  } catch (error) {
    console.error('Error creating device:', error);

    // Log the failed change
    await req.logChange({
      action: 'CREATE',
      collectionName: 'Device',
      newValues: req.body,
      status: 'FAILED',
      errorMessage: error.message
    });

    // Log the failed behavior
    await req.logBehavior({
      action: 'DEVICE_CREATION_FAILED',
      category: 'DEVICE_OPERATION',
      description: `Failed to create device`,
      result: 'FAILED',
      errorDetails: error.message,
      severity: 'MEDIUM'
    });

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * READ: Get all devices
 * GET /api/devices
 */
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.id });

    // Log read behavior (optional - comment out if too verbose)
    await req.logBehavior({
      action: 'DEVICES_LIST_RETRIEVED',
      category: 'USER_ACTIVITY',
      description: `Retrieved list of ${devices.length} devices`,
      data: { count: devices.length },
      severity: 'LOW'
    });

    res.json({
      success: true,
      data: devices
    });

  } catch (error) {
    console.error('Error fetching devices:', error);

    await req.logBehavior({
      action: 'DEVICES_LIST_FAILED',
      category: 'DEVICE_OPERATION',
      result: 'FAILED',
      errorDetails: error.message,
      severity: 'HIGH'
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * UPDATE: Modify existing device
 * PUT /api/devices/:id
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Get original document for audit trail
    const originalDevice = await Device.findById(req.params.id);
    
    if (!originalDevice) {
      throw new Error('Device not found');
    }

    // Verify ownership
    if (originalDevice.userId.toString() !== req.user.id) {
      throw new Error('Not authorized to update this device');
    }

    // Track old values for audit
    const oldValues = originalDevice.toObject();

    // Update device
    const updateData = {
      name: req.body.name || originalDevice.name,
      type: req.body.type || originalDevice.type,
      location: req.body.location || originalDevice.location,
      status: req.body.status || originalDevice.status,
      ...req.body
    };

    Object.assign(originalDevice, updateData);
    await originalDevice.save();

    // Calculate which fields changed
    const changedFields = Object.keys(updateData).filter(
      key => JSON.stringify(oldValues[key]) !== JSON.stringify(updateData[key])
    );

    // Log the change with before/after values
    await req.logChange({
      action: 'UPDATE',
      collectionName: 'Device',
      documentId: originalDevice._id,
      oldValues,
      newValues: originalDevice.toObject(),
      changedFields,
      reason: `Device updated: ${changedFields.join(', ')}`
    });

    // Log behavior
    await req.logBehavior({
      action: 'DEVICE_UPDATED',
      category: 'DEVICE_OPERATION',
      relatedEntityType: 'Device',
      relatedEntityId: originalDevice._id,
      description: `Updated device: ${originalDevice.name}`,
      data: {
        changedFields,
        changes: changedFields.reduce((acc, field) => {
          acc[field] = { old: oldValues[field], new: updateData[field] };
          return acc;
        }, {})
      },
      severity: 'LOW'
    });

    res.json({
      success: true,
      data: originalDevice,
      message: 'Device updated successfully'
    });

  } catch (error) {
    console.error('Error updating device:', error);

    // Log failed update
    await req.logChange({
      action: 'UPDATE',
      collectionName: 'Device',
      documentId: req.params.id,
      newValues: req.body,
      status: 'FAILED',
      errorMessage: error.message
    });

    await req.logBehavior({
      action: 'DEVICE_UPDATE_FAILED',
      category: 'DEVICE_OPERATION',
      relatedEntityId: req.params.id,
      result: 'FAILED',
      errorDetails: error.message,
      severity: 'MEDIUM'
    });

    const statusCode = error.message === 'Device not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE: Remove device
 * DELETE /api/devices/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      throw new Error('Device not found');
    }

    // Verify ownership
    if (device.userId.toString() !== req.user.id) {
      throw new Error('Not authorized to delete this device');
    }

    // Store device data before deletion
    const deletedData = device.toObject();

    // Delete device
    await Device.findByIdAndDelete(req.params.id);

    // Log the deletion
    await req.logChange({
      action: 'DELETE',
      collectionName: 'Device',
      documentId: req.params.id,
      oldValues: deletedData,
      reason: `Device deleted by user: ${device.name}`
    });

    // Log behavior
    await req.logBehavior({
      action: 'DEVICE_DELETED',
      category: 'DEVICE_OPERATION',
      relatedEntityType: 'Device',
      relatedEntityId: req.params.id,
      description: `Deleted device: ${device.name}`,
      data: { deviceName: device.name },
      severity: 'MEDIUM'
    });

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting device:', error);

    // Log failed deletion
    await req.logChange({
      action: 'DELETE',
      collectionName: 'Device',
      documentId: req.params.id,
      status: 'FAILED',
      errorMessage: error.message
    });

    await req.logBehavior({
      action: 'DEVICE_DELETE_FAILED',
      category: 'DEVICE_OPERATION',
      relatedEntityId: req.params.id,
      result: 'FAILED',
      errorDetails: error.message,
      severity: 'HIGH'
    });

    const statusCode = error.message === 'Device not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * BULK UPDATE: Update multiple devices
 * POST /api/devices/bulk-update
 */
router.post('/bulk-update', auth, async (req, res) => {
  try {
    const { deviceIds, updates } = req.body;

    if (!Array.isArray(deviceIds) || !updates) {
      throw new Error('Invalid request format');
    }

    const results = [];

    for (const deviceId of deviceIds) {
      const device = await Device.findById(deviceId);
      
      if (!device) continue;

      const oldValues = device.toObject();
      Object.assign(device, updates);
      await device.save();

      // Log bulk update
      await req.logChange({
        action: 'UPDATE',
        collectionName: 'Device',
        documentId: deviceId,
        oldValues,
        newValues: device.toObject(),
        changedFields: Object.keys(updates),
        reason: 'Bulk update operation'
      });

      results.push({ id: deviceId, success: true });
    }

    // Log bulk operation behavior
    await req.logBehavior({
      action: 'DEVICES_BULK_UPDATED',
      category: 'DEVICE_OPERATION',
      description: `Bulk updated ${results.length} devices`,
      data: { count: results.length, updates },
      severity: 'MEDIUM'
    });

    res.json({
      success: true,
      data: results,
      message: `Updated ${results.length} devices`
    });

  } catch (error) {
    console.error('Error in bulk update:', error);

    await req.logBehavior({
      action: 'BULK_UPDATE_FAILED',
      category: 'DEVICE_OPERATION',
      result: 'FAILED',
      errorDetails: error.message,
      severity: 'HIGH'
    });

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * ANALYTICS: View audit trail for a device
 * GET /api/devices/:id/audit-trail
 */
router.get('/:id/audit-trail', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    // Get complete audit history
    const history = await AuditService.getDocumentHistory('Device', req.params.id);

    res.json({
      success: true,
      data: {
        device: {
          id: device._id,
          name: device.name,
          type: device.type
        },
        auditTrail: history,
        totalChanges: history.length
      }
    });

  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

/**
 * KEY TAKEAWAYS FOR IMPLEMENTATION:
 * 
 * 1. Log both the change AND the behavior
 *    - Change logs store exact data modifications
 *    - Behavior logs store user actions and results
 * 
 * 2. Always include context
 *    - Why was this done? (reason)
 *    - What specifically changed? (changedFields)
 *    - What's the business context? (data object)
 * 
 * 3. Handle errors consistently
 *    - Log all errors to AuditLog and BehaviorLog
 *    - Mark them with status: 'FAILED'
 *    - Include the error message
 * 
 * 4. Use severity levels
 *    - LOW: Normal operations
 *    - MEDIUM: Updates, sensitive operations
 *    - HIGH: Deletions, admin actions, errors
 *    - CRITICAL: Security events, system failures
 * 
 * 5. Include data context
 *    - Store what type of entity was affected
 *    - Store IDs for relationships
 *    - Include business data (names, types, etc.)
 * 
 * 6. Don't break the main operation
 *    - All audit logging should be non-blocking
 *    - Failures in logging should not fail the API call
 *    - Use try-catch or .catch() for logging
 */
