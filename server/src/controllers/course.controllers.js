const slugify = require('slugify');
const { nanoid } = require('nanoid');
const logger = require('../logger');
const AppError = require('../errors/app.error');
const User = require('../models/User');
const Course = require('../models/Course');
const {
  uploadStreamAsync
} = require('../services/storage/cloudinary.services');

const NAMESPACE = 'MENU CONTROLLER';

exports.create = async (req, res, next) => {
  try {
    const { title, description, price, isPublished } = req.body;

    // Check if course already exists.
    const exists = await Course.exists({ title });
    if (exists)
      return next(new AppError(400, 'Course with given title already exists'));

    // Initialize new course.
    const newCourse = new Course({
      title,
      instructor: req.user.id,
      description,
      imageUrl,
      price: parseFloat(price),
      isPublished: isPublished === 'true',
      slug: slugify(name)
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
exports.update = async (req, res, next) => {};
exports.findMany = async (req, res, next) => {};
exports.findOne = async (req, res, next) => {
  try {
    const existingCourse = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', '_id title')
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

exports.deleteOne = async (req, res, next) => {};

// // CONTROLLERS
// const searchTours = catchAsync(async (req, res, next) => {
//     const searchTerm = req.query.search;

//     const tours = tours.filter((t) => t.name.includes(searchTerm));

//     res.status(200).json({
//         status: true,
//         data: tours,
//         message: 'retrieved successfully',
//     });
// });

// const getToursWithin = catchAsync(async (req, res, next) => {
//     const { distance, latlng, unit } = req.params;
//     const [lat, lng] = latlng.split(',');
//     if (!lat || !lng)
//         return next(
//             new AppError(
//                 'Please provide latitude and longitude the the format lat,lng',
//                 400,
//             ),
//         );

//     const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

//     const tours = await Tour.find({
//         startLocation: {
//             $geoWithin: { $centerSphere: [[lng, lat], radius] },
//         },
//     });

//     res.status(200).json({
//         status: true,
//         data: tours,
//         message: 'retrieved successfully',
//     });
// });

// const getDistances = catchAsync(async (req, res, next) => {
//     const { latlng, unit } = req.params;
//     const [lat, lng] = latlng.split(',');
//     if (!lat || !lng)
//         return next(
//             new AppError(
//                 'Please provide latitude and longitude the the format lat,lng',
//                 400,
//             ),
//         );
//     const multiplier = unit === 'mi' ? 0.0000621371 : 0.001;
//     const distances = await Tour.aggregate([
//         {
//             $geoNear: {
//                 near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
//                 distanceField: 'distance',
//                 distanceMultiplier: multiplier,
//             },
//         },
//         {
//             $project: {
//                 distance: 1,
//                 name: 1,
//             },
//         },
//     ]);

//     res.status(200).json({
//         status: true,
//         data: distances,
//         message: 'retrieved successfully',
//     });
// });

// const getTourStats = catchAsync(async (req, res, next) => {
//     const stats = await Tour.aggregate([
//         {
//             $match: { ratingsAverage: { $lte: 4.5 } },
//         },
//         {
//             $group: {
//                 // _id: null,
//                 _id: { $toUpper: '$difficulty' },
//                 count: { $sum: 1 },
//                 avgRating: { $avg: '$ratingsAverage' },
//                 avgPrice: { $avg: '$price' },
//                 minPrice: { $min: '$price' },
//                 maxPrice: { $max: '$price' },
//             },
//         },
//         {
//             $sort: { avgPrice: -1 },
//         },
//     ]);

//     res.json({ status: true, data: stats, message: 'retrieved successfully' });
// });

// const getMonthlyPlan = catchAsync(async (req, res, next) => {
//     const year = +req.params.year;
//     const plan = await Tour.aggregate([
//         {
//             $unwind: '$startDates',
//         },
//         {
//             $match: {
//                 startDates: {
//                     $gte: new Date(`${year}-01-01`),
//                     $lte: new Date(`${year}-12-31`),
//                 },
//             },
//         },
//         {
//             $group: {
//                 _id: { $month: '$startDates' },
//                 numTourStarts: { $sum: 1 },
//                 tours: { $push: '$name' },
//             },
//         },
//         {
//             $addFields: { month: '$_id' },
//         },
//         {
//             $project: { _id: 0 },
//         },
//         {
//             $sort: { numTourStarts: -1 },
//         },
//         {
//             $limit: 1,
//         },
//     ]);

//     res.json({ status: true, data: plan, message: 'retrieved successfully' });
// });

// module.exports = {
//     createTour,
//     updateTour,
//     getAllTours,
//     getTour,
//     deleteTour,
//     searchTours,
//     getTourStats,
//     getMonthlyPlan,
//     getToursWithin,
//     getDistances,
// };
