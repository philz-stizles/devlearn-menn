const { generateToken } = require('../services/security/jwt.services');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const filterQuery = JSON.parse(queryStr);

    this.query.find(filterQuery);

    return this;
  }

  // SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(',', ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // FIELD LIMITING
  limitFields() {
    if (this.queryString.fields) {
      const selectFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // PAGINATION
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const filterRequestBody = (body, ...allowedFields) => {
  const newBody = {};
  Object.keys(body).forEach((item) => {
    if (allowedFields.includes(item)) {
      newBody[item] = body[item];
    }
  });

  return newBody;
};

const createAndSendToken = (user, statusCode, res) => {
  const token = generateToken(user);

  res.status(statusCode).json({
    status: true,
    data: {
      loggedInUser: { id: user._id, email: user.email, name: user.name },
      token,
    },
    message: 'Login successful',
  });
};

const createAndSendTokenWithCookie = (user, req, res) => {
  const token = generateToken({ id: user.id, role: user.role });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_AUTH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // This is heroku specific
  };

  // if(process.env.NODE_ENV === 'production') {
  //     cookieOptions.secure = true
  // }

  res.cookie('token', token, cookieOptions);

  user.password = undefined;
  res.json({
    status: true,
    data: { user, token },
    message: 'Login successful',
  });
};

module.exports = {
  APIFeatures,
  filterRequestBody,
  createAndSendToken,
  createAndSendTokenWithCookie,
};
