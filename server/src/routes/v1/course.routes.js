const express = require('express');
const formidable = require('express-formidable');

const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourse,
  uploadImage,
  removeImage,
  uploadVideo,
  removeVideo,
  updateCourse,
  publishCourse,
  unPublishCourse,
  addLesson,
  removeLesson,
  checkEnrollment,
  freeEnrollment,
  paidEnrollment
} = require('../../controllers/course.controllers');
const {
  isAuthenticated,
  isAuthorized
} = require('../../middlewares/auth.middlewares');

router
  .route('/courses')
  .post(isAuthenticated, isAuthorized('instructor'), createCourse)
  .get(getCourses);

router.post('/courses/upload-image', uploadImage);
router.post('/courses/remove-image', removeImage);

router
  .route('/courses/:slug')
  .get(getCourse)
  .put(isAuthenticated, isAuthorized('instructor'), updateCourse);

router
  .route('/courses/:slug/lessons')
  .post(isAuthenticated, isAuthorized('instructor'), addLesson);

router
  .route('/courses/:slug/lessons/:lessonId')
  .put(isAuthenticated, isAuthorized('instructor'), removeLesson);

router.post(
  // '/courses/upload-video/:instructorId',
  '/courses/upload-video',
  isAuthenticated,
  isAuthorized('instructor'),
  formidable(),
  uploadVideo
);
router.post(
  // '/courses/remove-video/:instructorId',
  '/courses/remove-video',
  isAuthenticated,
  isAuthorized('instructor'),
  removeVideo
);

router.put(
  '/courses/:courseId/publish',
  isAuthenticated,
  isAuthorized('instructor'),
  publishCourse
);

router.put(
  '/courses/:courseId/un-publish',
  isAuthenticated,
  isAuthorized('instructor'),
  unPublishCourse
);

router.get(
  '/courses/:courseId/check-enrollment',
  isAuthenticated,
  checkEnrollment
);

router.post(
  '/courses/:courseId/free-enrollment',
  isAuthenticated,
  freeEnrollment
);

router.post(
  '/courses/:courseId/paid-enrollment',
  isAuthenticated,
  paidEnrollment
);

module.exports = router;
