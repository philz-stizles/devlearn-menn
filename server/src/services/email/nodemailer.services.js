const nodemailer = require('nodemailer');

// Create a transporter - find a service that nodemailer works with and retrieve their config for host, port etc
// e.g for prod sendgrid, mailgun
// e.g for dev mailtrap to fake emails
const transporter = nodemailer.createTransport({
  // host: `${process.env.EMAIL_HOST}`,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendPlainEmail = async options => {
  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

exports.sendHTMLEmail = async options => {
  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
