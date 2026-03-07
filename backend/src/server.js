require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const { initializeSocket } = require('./config/socket');
const sensorService = require('./services/sensorService');
const { attachAuditContext, logResponseAudit, logErrorAudit } = require('./middleware/auditMiddleware');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Socket.io
const io = initializeSocket(server);

// Make io available to controllers
app.set('io', io);

// Middleware - Allow all localhost ports for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Audit and behavior logging middleware
app.use(attachAuditContext);
app.use(logResponseAudit);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/systems', require('./routes/adminSystems'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/irrigation', require('./routes/irrigation'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/community', require('./routes/community'));
app.use('/api/posts', require('./routes/posts')); // New posts route
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reputation', require('./routes/reputation'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/hardware', require('./routes/hardware'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  const { isDatabaseConnected, getConnectionStatus } = require('./config/database');
  const dbStatus = getConnectionStatus();
  
  res.status(200).json({
    success: true,
    message: 'AGRANOVA API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      uri: dbStatus.uri,
      status: dbStatus.connected ? '✅ Connected' : '⚠️ Not connected'
    },
    server: {
      port: process.env.PORT || 5000,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }
  });
});

// Error handling middleware (with audit logging)
app.use(logErrorAudit);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║          🌱 AGRANOVA API SERVER 🌱               ║
║                                                   ║
║  Status: RUNNING                                  ║
║  Port: ${PORT}                                      ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
║  Database: Connected                              ║
║  WebSocket: Active                                ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);

  // Start sensor data simulation
  sensorService.startSimulation(io);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  sensorService.stopSimulation();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
