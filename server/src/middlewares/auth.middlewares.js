const AppError = require('../errors/app.error');
const expressJwt = require('express-jwt');

exports.isAuthenticated = expressJwt({
  getToken: (req, _) => req.cookie.token,
  secret: process.env.JWT_AUTH_SECRET,
  algorithms: ['HS256']
  //algorithms: ['RS256']
});

exports.isAuthorized =
  (...authorizedRoles) =>
  async (req, res, next) => {
    if (!authorizedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          'You do not have the permission to perform this action'
        )
      );
    }

    return next();
  };
