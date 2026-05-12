const mongoose = require('mongoose');
const { logger } = require('./logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_ATLAS_URI
      : process.env.MONGODB_URI;

    if (!mongoUri) {
      logger.warn('No MongoDB URI configured. Running in demo mode without database.');
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`MongoDB connection error: ${error.message}`);
    logger.warn('Server will run in demo mode without database');
    return null;
  }
};

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnection error: ${error.message}`);
    throw error;
  }
};

module.exports = { connectDB, disconnectDB, isDbConnected };
