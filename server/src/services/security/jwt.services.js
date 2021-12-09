const jwt = require('jsonwebtoken');

exports.generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_AUTH_SECRET, {
    expiresIn: process.env.JWT_AUTH_EXPIRES_IN,
  });

exports.verifyTokenAsync = async (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_AUTH_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
