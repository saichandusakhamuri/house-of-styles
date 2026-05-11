const { logger } = require('../config/logger');

const sentMessages = [];

const now = () => new Date().toISOString();

const recordMessage = (channel, to, subject, body) => {
  const message = {
    id: `${channel}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    channel,
    to,
    subject,
    body,
    status: to ? 'demo_sent' : 'skipped',
    createdAt: now(),
  };

  sentMessages.unshift(message);
  logger.info(`[${channel.toUpperCase()}] ${message.status} to ${to || 'missing recipient'}: ${subject}`);
  return message;
};

const sendWelcomeNotifications = async (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer';
  const greeting = `Hi ${fullName}, welcome to House of Styles. Your account is ready for shopping, favorites, VIP rewards, and custom tailoring.`;

  return {
    email: recordMessage(
      'email',
      user.email,
      'Welcome to House of Styles',
      greeting
    ),
    sms: recordMessage(
      'sms',
      user.phone,
      'House of Styles welcome',
      greeting
    ),
  };
};

const sendPasswordResetNotification = async (user, resetCode) => {
  const body = `Use this House of Styles reset code to recover your account: ${resetCode}. It expires in 15 minutes.`;

  return {
    email: recordMessage(
      'email',
      user.email,
      'House of Styles password reset',
      body
    ),
    sms: recordMessage(
      'sms',
      user.phone,
      'House of Styles reset code',
      body
    ),
  };
};

module.exports = {
  sendWelcomeNotifications,
  sendPasswordResetNotification,
  sentMessages,
};
