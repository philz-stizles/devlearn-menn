const slugify = require('slugify');
const { Types } = require('mongoose');
const logger = require('../logger');
const AppError = require('../errors/app.error');
const Course = require('../models/course.model');
const awsService = require('../services/storage/s3.services');

const NAMESPACE = 'COURSE CONTROLLER';

exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, category, isPaid, price, isPublished, image } =
      req.body;
    console.log(req.body);

    // Check if course already exists.
    const exists = await Course.exists(title);
    if (exists)
      return next(new AppError(400, 'Course with given title already exists'));

    // Initialize new course.
    const newCourse = new Course({
      title,
      slug: slugify(title),
      instructor: req.user._id,
      description,
      category,
      image,
      isPaid,
      price: !price || isNaN(price) ? undefined : parseFloat(price),
      isPublished: isPublished === 'true'
    });

    // Create new course.
    const createdCourse = await newCourse.save();

    res.status(201).json({
      status: true,
      data: createdCourse,
      message: 'created successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate('instructor')
      .exec();

    res.json({
      status: true,
      data: courses,
      message: 'Retrieved successfully'
    });
  } catch (err) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    const existingCourse = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', '_id fullname')
      .exec();

    res.json({
      status: true,
      data: existingCourse,
      message: 'Retrieved successfully'
    });
  } catch (err) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    // If there is no image, return error message to the user.
    if (!image) return next(new AppError(400, 'No image'));

    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    const contentType = image.split(';')[0].split('/')[1];

    // Upload image to cloud storage.
    const data = await awsService.uploadBase64(base64Data, contentType);
    console.log(data);

    res.json({
      status: true,
      data,
      message: 'Uploaded successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.removeImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    // Upload image to cloud storage.
    await awsService.removeFile(image.Key, image.Bucket);

    res.json({
      status: true,
      data: null,
      message: 'Removed successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.uploadVideo = async (req, res, next) => {
  try {
    const { video } = req.files;
    // If there is no video, return error message to the user.
    if (!video) return next(new AppError(400, 'No Video'));

    // Upload video to cloud storage.
    const data = await awsService.uploadDoc(video.path, video.type);
    console.log(data);

    res.json({
      status: true,
      data,
      message: 'Uploaded successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.removeVideo = async (req, res, next) => {
  try {
    const { video } = req.body;
    // Remove video from cloud storage.
    await awsService.removeFile(video.Key, video.Bucket);

    res.json({
      status: true,
      data: null,
      message: 'Removed successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.addLesson = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, content, video } = req.body;
    console.log(video);

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: { lessons: { title, content, video, slug: slugify(title) } }
      },
      {
        new: true
      }
    )
      .populate('instructor', '_id name')
      .exec();
    if (!updated) return next(new AppError(400, 'Course was not updated'));

    res.status(201).json({
      status: true,
      data: updated,
      message: 'updated successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.removeLesson = async (req, res, next) => {
  const session = await Course.startSession();
  session.startTransaction();
  try {
    const { slug, lessonId } = req.params;

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $pull: { lessons: { _id: Types.ObjectId(lessonId) } }
      }
    )
      .populate('instructor', '_id name')
      .exec();
    if (!updated) return next(new AppError(400, 'Course was not updated'));

    // Remove video from cloud storage.
    const { lessons } = updated;

    const removedLesson = lessons.find(lesson => {
      return lesson._id.toString() === lessonId;
    });

    const { Key, Bucket } = removedLesson.video;

    await awsService.removeFile(Key, Bucket);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: true,
      data: updated,
      message: 'updated successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  // const session = await Course.startSession();
  // session.startTransaction();
  try {
    const { lessonId } = req.params;
    const { title, content, video, free_preview } = req.body;

    // updateOne does not return the entire updated document, but the id of the updated document.
    const updated = await Course.updateOne(
      { 'lessons._id': lessonId },
      {
        $set: {
          'items.$.title': title,
          'items.$.content': content,
          'items.$.video': video,
          'items.$.free_preview': free_preview
        }
      }
    ).exec();
    if (!updated) return next(new AppError(400, 'Course was not updated'));
    console.log(updated);

    res.status.json({
      status: true,
      data: null,
      message: 'updated successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { slug } = req.params;
    console.log(req.body);
    const { title, description, category, isPaid, price, image } = req.body;

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        title,
        slug: slugify(title),
        description,
        category,
        image,
        isPaid,
        price: !price || isNaN(price) ? undefined : parseFloat(price)
      },
      {
        new: true
      }
    )
      .populate('instructor', '_id name')
      .exec();
    if (!updated) return next(new AppError(400, 'Course was not updated'));

    res.status(201).json({
      status: true,
      data: updated,
      message: 'updated successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.publishCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const existingCourse = await Course.findById(courseId)
      .select('instructor')
      .exec();
    if (existingCourse.instructor._id !== req.user._id)
      return next(new AppError(401, 'Unauthorized'));

    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        isPublished: true
      },
      {
        new: true
      }
    ).exec();
    if (!updated) return next(new AppError(400, 'Course was not updated'));

    res.json({
      status: true,
      data: updated,
      message: 'published successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.unPublishCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const existingCourse = await Course.findById(courseId)
      .select('instructor')
      .exec();
    if (existingCourse.instructor._id !== req.user._id)
      return next(new AppError(401, 'Unauthorized'));

    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        isPublished: false
      },
      {
        new: true
      }
    ).exec();
    if (!updated) return next(new AppError(400, 'Course was not updated'));

    res.json({
      status: true,
      data: updated,
      message: 'unpublished successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if user exists.
    const existingUser = await User.findById(req.user._id).exec();
    if (!existingUser)
      return next(new AppError(401, 'Incorrect email or password'));

    res.json({
      status: true,
      data: existingUser.courses,
      message: 'unpublished successfully'
    });
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.freeEnrollment = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};

exports.paidEnrollment = async (req, res, next) => {
  try {
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    next(error);
  }
};
