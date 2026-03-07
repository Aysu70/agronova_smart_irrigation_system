const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join device-specific room (for hardware devices)
    socket.on('join_device', (deviceId) => {
      socket.join(`device:${deviceId}`);
      console.log(`Device ${deviceId} joined device room`);
    });

    // Leave device room
    socket.on('leave_device', (deviceId) => {
      socket.leave(`device:${deviceId}`);
      console.log(`Device ${deviceId} left device room`);
    });

    // Handle real-time sensor data from web app
    socket.on('sensor_data', (data) => {
      // Broadcast to user's room
      io.to(`user:${data.userId}`).emit('sensor:update', data);
    });

    // Device heartbeat
    socket.on('device_heartbeat', (deviceId) => {
      io.to(`user:${deviceId}`).emit('device:heartbeat', { deviceId, timestamp: new Date() });
    });

    // Join group chat room
    socket.on('join_group', (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    // Leave group chat room
    socket.on('leave_group', (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`Socket ${socket.id} left group ${groupId}`);
    });

    // Handle new message
    socket.on('send_message', (data) => {
      io.to(`group_${data.groupId}`).emit('new_message', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
