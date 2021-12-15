/* eslint-disable @typescript-eslint/no-explicit-any */
const { Schema, model, Types } = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
  hashPasswordAsync,
  validatePasswordAsync
} = require('../services/security/password.services');

const NAMESPACE = 'USER MODEL';

// Put as much business logic in the models to keep the controllers as simple and lean as possible.
const schema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, 'A user must have a fullname'],
      trim: true
    },
    username: {
      type: String,
      trim: true,
      // `email` must be unique, unless it isn't defined
      index: { unique: true, sparse: true }
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      trim: true,
      unique: true,
      index: true,
      lowercase: true
    },
    avatar: { type: String },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      min: 6,
      max: 64
      // select: false
    }, // Using select: false
    // will omit the field that it is assigned to from any read executions e.g find, findOne  etc.
    // It will not omit from create, save
    passwordChangedAt: Date,
    passwordResetExpiresIn: Date,
    passwordResetCode: String,
    roles: [{ type: Types.ObjectId, ref: 'Role' }],
    isActive: { type: Boolean, default: true, select: false },
    roles: {
      type: [String],
      default: ['subscriber'],
      enum: ['subscriber', 'instructor', 'admin'],
      toLowerCase: true
    },
    stripe_seller: {},
    stripeSession: {},
    stripe_account_id: '',
    courses: [{ type: Types.ObjectId, ref: 'Course' }],
    tokens: [{ token: { type: String, required: true } }]
  },
  { timestamps: true }
);

// Create schema methods
schema.pre('save', async function (next) {
  const user = this;
  // If password was not modified, do not encrypt
  if (!user.isModified('password')) return next();

  try {
    // Hash user password.
    user.password = await hashPasswordAsync(user.password);

    // Delete confirmPassword field
    user.confirmPassword = undefined;

    return next();
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    return next(error);
  }
});

schema.pre('save', async function (next) {
  const user = this;
  // If password was not modified, do not encrypt
  if (!user.isModified('password') || user.isNew) return next(); // When you change password or create a new user,
  // set passwordChange date

  user.passwordChangedAt = new Date(Date.now() - 1000);

  return next();
});

// schema.pre(/^find/, async next => {
//   const user = this;

//   // this points to the current query
//   user.find({ isActive: { $ne: false } }); // Not equal to false is different from is equal to true
//   next();
// });

schema.methods.comparePassword = async function (password) {
  const user = this;
  try {
    return await validatePasswordAsync(password, user.password);
  } catch (error) {
    return false;
  }
};

schema.methods.isPasswordChangedAfterTokenGen = function (jwtTimestamp) {
  const user = this;
  if (!user.passwordChangedAt) return false;
  const passwordChangedAtInMilliseconds = user.passwordChangedAt.getTime();
  const passwordChangedAtInSeconds = parseInt(
    `${passwordChangedAtInMilliseconds / 1000}`,
    10
  );

  return passwordChangedAtInSeconds > jwtTimestamp;
};

schema.methods.createPasswordResetToken = function () {
  const user = this;
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// schema.pre('save', async function (next) {
//   // Do not use arrow functions here
//   const user = this;
//   // Check if password is defined and modified
//   // This middleware is attached to tsave. Thus, ensure that your update strategy is using save() and not update,
//   // else update password with a different API
//   if (user.password && user.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//   }

//   next();
// });

schema.statics.findByAuthentication = async (email, password) => {
  // You can use arrow functions here as we will not be requiring
  // the 'this' reference
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid Credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid Credentials');
  }

  return user;
};

schema.statics.exists = async (username, email) => {
  // You can use arrow functions here as we will not be requiring
  // the 'this' reference
  return await User.findOne({
    email
    // $or: [
    //   { email, email: { $exists: true } },
    //   { username, username: { $exists: true } }
    // ]
  }).exec();
};

schema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_AUTH_SECRET,
    { expiresIn: process.env.JWT_AUTH_EXPIRES_IN } // This has been defined in
    // env variables in seconds 1800 => 30mins
    // + is added to convert it from string to an integer as it will assume milliseconds
    // if string is detected
  );

  // Store current login in DB, this strategy enable a user to login from multiple devices and stay logged unless
  // the user logs out which will logout the current requesting device
  user.tokens = user.tokens.concat({ token });
  await user.save();

  // Return generated token
  return token;
};

// Utility method to return users public profile
schema.methods.getPublicProfile = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

schema.methods.toJSON = function () {
  const user = this;

  // Create a JSON representation of the user
  const userObject = user.toObject();

  // Remove private data
  delete userObject.password;
  delete userObject.tokens;

  // Return public profile
  return userObject;
};

// Create a Model.
module.exports = User = model('User', schema);
