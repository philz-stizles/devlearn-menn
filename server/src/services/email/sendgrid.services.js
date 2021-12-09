const sendGrid = require('@sendgrid/mail');
const logger = require('../../logger');

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, subject, text, html) => {
  const msgOptions = {
    to,
    from: process.env.ADMIN_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await sendGrid.send(msgOptions);
  } catch (error) {
    logger.error('Email Service', error.message, error);
    if (error.response) {
      logger.error('Email Service', error.response.body, error);
    }
  }
};
