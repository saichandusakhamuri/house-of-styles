const mongoose = require('mongoose');
const { AppError } = require('./errorHandler');

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const requireDatabaseConnection = (req, res, next) => {
  if (!isDatabaseConnected()) {
    throw new AppError('Database connection is required. Please configure MongoDB for real user mode.', 503);
  }

  next();
};

module.exports = {
  isDatabaseConnected,
  requireDatabaseConnection,
};
