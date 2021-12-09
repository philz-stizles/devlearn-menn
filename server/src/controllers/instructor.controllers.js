const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const queryString = require('query-string');
const AppError = require('../errors/app.error');
const User = require('../models/User');

const NAMESPACE = 'INSTRUCTOR CONTROLLER';

exports.create = (req, res, next) => {
  try {
    // Check if user exists.
    const existingUser = await User.findById(req.user._id).exec();
    if (!existingUser)
      return next(new AppError(401, 'Incorrect email or password'));

    // Create stripe account id if user does not already have one.
    if (!existingUser.stripe_account_id) {
      const account = await stripe.accounts.create({ type: 'express' });
      console.log(account);
      existingUser.stripe_account_id = account.id;
      await existingUser.save();
    }

    // Create account link based on account Id(for frontend to complete onboarding).
    const redirectUrl = process.env.STRIPE_REDIRECT_URL;
    const accountLink = await stripe.accountLinks.create({
      account: existingUser.stripe_account_id,
      refresh_url: redirectUrl,
      return_url: redirectUrl,
      type: 'account_onboarding'
    });

    // Pre-fill user info(e.g. email etc).
    accountLink = Object.assign(accountLink, {
      'stripe_user[email]': existingUser.email
    });

    // Send the link as response to front-end
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};
