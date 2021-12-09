const AppError = require('../errors/app.error');

exports.signupValidator = (req, _, next) => {
  const { email, fullname, password } = req.body;
  if (!email || !fullname || !password)
    return next(new AppError(400, 'Please fill all the required fields'));

  next();
};

exports.loginValidator = (req, _, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError(400, 'Please provide an email and a password'));

  next();
};
