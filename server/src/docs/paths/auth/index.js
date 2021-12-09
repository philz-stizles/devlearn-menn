const signup = require('./signup');
const signupWithEmailVerification = require('./signup-with-email-verification');
const activateAccount = require('./activate-account');
const login = require('./login');
const forgotPassword = require('./forgot-password');
const resetPassword = require('./reset-password');
const currentUser = require('./current-user');

module.exports = {
    '/auth/signup': {
        ...signup,
    },
    '/auth/signup-with-email-verification': {
        ...signupWithEmailVerification,
    },
    '/auth/activate-account': {
        ...activateAccount,
    },
    '/auth/login': {
        ...login,
    },
    '/auth/forgot-password': {
        ...forgotPassword,
    },
    '/auth/reset-password': {
        ...resetPassword,
    },
    '/auth/current-user': {
        ...currentUser,
    },
};
