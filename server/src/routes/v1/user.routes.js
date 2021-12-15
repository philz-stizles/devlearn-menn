const express = require('express');

const router = express.Router();
const {
  getUserCourses,
  getUserCourse
} = require('../../controllers/user.controllers');
const {
  isAuthenticated,
  isEnrolled
} = require('../../middlewares/auth.middlewares');

router.get('/users/courses', isAuthenticated, getUserCourses);
router.get('/users/courses/:slug', isAuthenticated, isEnrolled, getUserCourse);

module.exports = router;
