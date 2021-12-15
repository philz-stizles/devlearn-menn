const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const logger = require('../logger');
const AppError = require('../errors/app.error');
const { sendHTMLEmail } = require('../services/email/nodemailer.services');
const User = require('../models/user.model');

const NAMESPACE = 'AUTH CONTROLLER';

exports.register = async (req, res, next) => {
  try {
    console.log(req.body);
    const { fullname, username, email, password } = req.body;
    // Check if user already exists.
    if (await User.exists(username, email))
      return next(new AppError(400, 'User already exists'));

    // Initialize new user.
    const newUser = new User({
      fullname,
      username,
      email,
      password
    });

    // Save new user.
    await newUser.save();

    res.status(201).json({
      status: true,
      data: {
        username,
        email
      },
      message: 'created successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return next(new AppError(401, 'Incorrect email or password'));

    // Check if password matches
    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) return next(new AppError(401, 'Incorrect email or password'));

    // Generate token
    const token = await existingUser.generateAuthToken();

    // Set token in cookie.
    const cookieOptions = {
      expires: new Date(
        Date.now() +
          process.env.JWT_AUTH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https' // This is heroku specific
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }

    res.cookie('token', token, cookieOptions);

    existingUser.password = undefined;
    existingUser.tokens = undefined;

    // Send response back to the user.
    res.json({
      status: true,
      data: existingUser,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Generate unique code which would be sent to the users email.
    const shortCode = nanoid(6).toUpperCase();

    // Store the users code for validation in the resetPassword controller.
    const existingUser = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    console.log(existingUser);

    // If the user was not found, return an error message
    if (!existingUser) return next(new AppError(400, 'User not found'));

    // Send password reset email with generated code to the users email.
    const htmlTemplate = fs.readFileSync(
      path.join(
        __dirname,
        '..',
        'services/email/templates/password-reset.html'
      ),
      { encoding: 'utf8', flag: 'r' }
    );
    await sendHTMLEmail({
      email: existingUser.email,
      subject: 'Reset Your Password',
      message: htmlTemplate.replace('${shortCode}', shortCode)
    });

    // Send response back to the user.
    res.json({
      status: true,
      data: null,
      message: `A email had been sent to ${existingUser.email}`
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    // Check if user exists
    const existingUser = await User.findOneAndUpdate(
      { email, passwordResetCode: code },
      { password: newPassword, passwordResetCode: '' }
    ).exec();
    console.log(existingUser);

    // If the user was not found, return an error message
    if (!existingUser) return next(new AppError(400, 'Invalid credentials'));

    // Send response back to the user.
    res.json({
      status: true,
      data: null,
      message:
        'Password reset successful. You can now login with your new password'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.logoutCookie = async (_, res, next) => {
  try {
    res.clearCookie('token');

    res.json({
      status: true,
      data: null,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.currentUser = async (req, res, next) => {
  try {
    const existingUser = await User.findById(req.user._id)
      .select('-password -tokens')
      .exec();

    res.json({
      status: true,
      data: existingUser,
      message: 'User info retrieved'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};
