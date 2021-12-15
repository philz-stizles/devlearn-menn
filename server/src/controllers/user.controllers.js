const AppError = require('../errors/app.error');
const User = require('../models/user.model');
const logger = require('../logger');

const NAMESPACE = 'USER CONTROLLER';

exports.getUserCourses = async (req, res, next) => {
  try {
    // Check if user exists.
    const existingUser = await User.findById(req.user._id).exec();
    if (!existingUser) return next(new AppError(401, 'User does not exist'));

    const courses = await Course.find({ _id: { $in: existingUser.courses } })
      .populate('instructor', '_id fullname')
      .exec();

    res.json({
      status: true,
      data: courses,
      message: 'Retrieved successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.getUserCourse = async (req, res, next) => {
  try {
    // Check if user exists.
    const existingUser = await User.findById(req.user._id).exec();
    if (!existingUser) return next(new AppError(401, 'User does not exist'));

    const courses = await Course.find({ _id: { $in: existingUser.courses } })
      .populate('instructor', '_id fullname')
      .exec();

    res.json({
      status: true,
      data: courses,
      message: 'Retrieved successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};
