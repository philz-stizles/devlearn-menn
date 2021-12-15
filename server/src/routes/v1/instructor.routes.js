const express = require('express');

const router = express.Router();
const {
  createInstructor,
  getCourses,
  getCourse
} = require('../../controllers/instructor.controllers');
const {
  isAuthenticated,
  isAuthorized
} = require('../../middlewares/auth.middlewares');

router.post('/instructor', isAuthenticated, createInstructor);

router
  .route('/instructor/courses')
  .get(isAuthenticated, isAuthorized('instructor'), getCourses);

router
  .route('/instructor/courses/:slug')
  .get(isAuthenticated, isAuthorized('instructor'), getCourse);

module.exports = router;
