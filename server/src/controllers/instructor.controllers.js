const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const queryString = require('query-string');
const AppError = require('../errors/app.error');
const User = require('../models/user.model');
const logger = require('../logger');

const NAMESPACE = 'INSTRUCTOR CONTROLLER';

exports.createInstructor = async (req, res, next) => {
  try {
    // Check if user exists.
    const existingUser = await User.findById(req.user._id).exec();
    if (!existingUser)
      return next(new AppError(401, 'Incorrect email or password'));

    // Create stripe account id if user does not already have one.
    // if (!existingUser.stripe_account_id) {
    //   const account = await stripe.accounts.create({ type: 'express' });
    //   console.log(account);
    //   existingUser.stripe_account_id = account.id;
    //   await existingUser.save();
    // }

    // // Create account link based on account Id(for frontend to complete onboarding).
    // const redirectUrl = process.env.STRIPE_REDIRECT_URL;
    // let accountLink = await stripe.accountLinks.create({
    //   account: existingUser.stripe_account_id,
    //   refresh_url: redirectUrl,
    //   return_url: redirectUrl,
    //   type: 'account_onboarding'
    // });

    // // Pre-fill user info(e.g. email etc).
    // accountLink = Object.assign(accountLink, {
    //   'stripe_user[email]': existingUser.email
    // });
    existingUser.roles.push('instructor');
    await existingUser.save();

    // Send the link as response to front-end
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      status: true,
      data: courses,
      message: 'Retrieved successfully'
    });
  } catch (err) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    const existingCourse = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', '_id title')
      .lean();

    console.log('getcourse', existingCourse);

    res.json({
      status: true,
      data: existingCourse,
      message: 'Retrieved successfully'
    });
  } catch (err) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};
