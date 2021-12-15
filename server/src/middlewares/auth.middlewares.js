const AppError = require('../errors/app.error');
const expressJwt = require('express-jwt');

exports.isAuthenticated = expressJwt({
  getToken: (req, _) => req.cookies.token,
  secret: process.env.JWT_AUTH_SECRET,
  algorithms: ['HS256']
  //algorithms: ['RS256']
});

exports.isAuthorized =
  (...authorizedRoles) =>
  async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.user._id).exec();
      if (!authorizedRoles.every(role => existingUser.roles.includes(role))) {
        return next(
          new AppError(
            403,
            'You do not have the permission to perform this action'
          )
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };

exports.isExistingUser = async (req, res, next) => {
  try {
    const existingUser = await User.findById(req.user._id).exec();
    if (!existingUser) {
      return next(new AppError(401, 'User does not exist'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

exports.isEnrolled = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const existingUser = await User.findById(req.user._id)
      .select('courses')
      .exec();
    const existingCourse = await Course.find({ slug }).select('_id').exec();
    if (!existingCourse) {
      return next(new AppError(404, 'Resource was not found'));
    }

    const match = existingUser.courses.find(
      id => id.toString() === existingCourse._id.toString()
    );

    if (!match) {
      return next(new AppError(403, 'Forbidden access'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
