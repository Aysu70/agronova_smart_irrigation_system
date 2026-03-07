const Order = require('../models/Order');
const Device = require('../models/Device');
const User = require('../models/User');

// @desc    Get all orders (Admin sees all, User sees their own)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, search } = req.query;
    
    let query = {};
    
    // If user is not admin, only show their orders
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { deviceName: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email region')
      .populate('device', 'name model price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email region phone')
      .populate('device', 'name model description price features');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { deviceId, quantity, shippingAddress, paymentMethod, notes } = req.body;

    // Get device details
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Check stock
    if (!device.inStock || device.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Device is out of stock or insufficient quantity'
      });
    }

    // Get user details
    const user = await User.findById(req.user.id);

    // Calculate total
    const totalAmount = device.price * quantity;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      userName: user.name,
      userEmail: user.email,
      device: deviceId,
      deviceName: device.name,
      quantity,
      price: device.price,
      totalAmount,
      currency: device.currency,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      notes: notes || '',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Log order creation
    if (req.logChange) {
      req.logChange({
        action: 'CREATE',
        collectionName: 'Order',
        documentId: order._id,
        newValues: {
          user: req.user.id,
          device: deviceId,
          quantity,
          totalAmount,
          paymentMethod
        },
        reason: 'New order placed'
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log order behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'ORDER_CREATED',
        category: 'COMMERCE',
        relatedEntityType: 'Order',
        relatedEntityId: order._id,
        description: `Order placed for ${device.name} (Qty: ${quantity})`,
        data: { deviceId, quantity, totalAmount },
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    // Update device stock
    device.stockQuantity -= quantity;
    if (device.stockQuantity === 0) {
      device.inStock = false;
    }
    await device.save();

    // Populate order before sending response
    await order.populate('device', 'name model price features');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldValues = order.toObject();
    const changedFields = [];

    if (status && order.status !== status) {
      order.status = status;
      changedFields.push('status');
    }
    if (paymentStatus && order.paymentStatus !== paymentStatus) {
      order.paymentStatus = paymentStatus;
      changedFields.push('paymentStatus');
    }
    if (trackingNumber && order.trackingNumber !== trackingNumber) {
      order.trackingNumber = trackingNumber;
      changedFields.push('trackingNumber');
    }
    if (notes !== undefined && order.notes !== notes) {
      order.notes = notes;
      changedFields.push('notes');
    }

    await order.save();

    // Log order update
    if (req.logChange && changedFields.length > 0) {
      req.logChange({
        action: 'UPDATE',
        collectionName: 'Order',
        documentId: order._id,
        oldValues,
        newValues: order.toObject(),
        changedFields,
        reason: `Order updated: ${changedFields.join(', ')}`
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log behavior
    if (req.logBehavior && changedFields.length > 0) {
      req.logBehavior({
        action: 'ORDER_UPDATED',
        category: 'COMMERCE',
        relatedEntityType: 'Order',
        relatedEntityId: order._id,
        description: `Order updated: ${changedFields.join(', ')}`,
        data: { changedFields, newStatus: status, paymentStatus },
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore device stock
    const device = await Device.findById(order.device);
    if (device) {
      device.stockQuantity += order.quantity;
      device.inStock = true;
      await device.save();
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('device', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};
