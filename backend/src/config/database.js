const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const connectDB = async () => {
  try {
    // Mongoose connection settings
    mongoose.set('bufferTimeoutMS', 10000); // 10 seconds buffer
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agranova';
    console.log(`🔗 Attempting MongoDB connection to: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    isConnected = true;
    connectionAttempts = 0;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📚 Database: ${conn.connection.db.getName()}`);
    
    // Log connection stats
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from MongoDB');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ Mongoose reconnected to MongoDB');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

  } catch (error) {
    isConnected = false;
    connectionAttempts++;
    
    console.error('\n❌ MongoDB Connection Failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Attempt: ${connectionAttempts}/${MAX_RETRIES}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n   💡 MongoDB is not running!\n');
      console.error('   To fix this:');
      console.error('   Option 1: Start MongoDB service');
      console.error('     Windows: net start MongoDB');
      console.error('     Mac: brew services start mongodb-community');
      console.error('     Linux: sudo systemctl start mongod');
      console.error('\n   Option 2: Use MongoDB Atlas (cloud)');
      console.error('     Visit: https://cloud.mongodb.com');
      console.error('     Get connection string and set MONGODB_URI in .env');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n   💡 MongoDB authentication failed!');
      console.error('   Check your connection string in .env');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ERR_INVALID_URL')) {
      console.error('\n   💡 Invalid MongoDB connection string!');
      console.error('   Check MONGODB_URI in your .env file');
    }
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`\n⏰ Retrying in ${RETRY_DELAY / 1000} seconds...\n`);
      setTimeout(() => {
        connectDB();
      }, RETRY_DELAY);
    } else {
      console.warn(`\n⚠️  Max retry attempts reached. Running in demo mode without database.\n`);
      console.log('✅ Server will continue running with in-memory data.');
      console.log('   All features work normally, data just won\'t persist.\n');
    }
  }
};

const isDatabaseConnected = () => isConnected;

const getConnectionStatus = () => ({
  connected: isConnected,
  attempts: connectionAttempts,
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agranova'
});

module.exports = { connectDB, isDatabaseConnected, getConnectionStatus };
