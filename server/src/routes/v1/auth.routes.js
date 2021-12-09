const express = require('express');

const router = express.Router();
const {
  register,
  login,
  logoutCookie,
  forgotPassword,
  resetPassword,
  currentUser
} = require('../../controllers/auth.controllers');
const { isAuthenticated } = require('../../middlewares/auth.middlewares');
const {
  loginValidator,
  signupValidator
} = require('../../middlewares/validation.middlewares');

router.post('/auth/register', signupValidator, register);
router.post('/auth/login', loginValidator, login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/logout', logoutCookie);
router.get('/auth/current-user', isAuthenticated, currentUser);

module.exports = router;
