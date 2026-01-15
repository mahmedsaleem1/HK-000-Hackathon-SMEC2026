/**
 * Database Configuration
 * Handles MongoDB Atlas connection and initialization
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set. Please configure .env file.');
}

/**
 * Connect to MongoDB Atlas
 * Returns Promise
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Atlas Connected Successfully');
    const dbName = mongoose.connection.name || process.env.DATABASE_NAME || 'Task03';
    console.log(`📦 Database: ${dbName}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error('❌ MongoDB Disconnection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
};
