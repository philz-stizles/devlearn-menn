const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../errors/app.error');

// const upload = multer() // Without any options, multerr will store file in memeory and provide it with req.file
// const upload = multer({ dest: path.join(__dirname, '..', '/uploads/images') }) //

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '..', 'uploads', 'images', 'users')) // Ensure that directories exist.
//         // Any time you change or create a directory, restart the server to pickup modifications
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1]
//         const userId = req.user.id
//         const timestamp = Date.now()

//         cb(null, `user-${userId}-${timestamp}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('File is not an image', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadMenuPhoto = upload.single('photo');

exports.uploadUserPhoto = upload.single('photo');

exports.uploadTourPhotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const userId = req.user.id;
  const timestamp = Date.now();
  req.file.filename = `user-${userId}-${timestamp}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/img/users/${req.file.filename}`); // https://sharp.pixelplumbing.com

  next();
};

exports.resizeTourPhotos = async (req, res, next) => {
  console.log('req.files');
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }

  // Image cover
  const tourId = req.params.id;
  const timestamp = Date.now();
  req.body.imageCover = `tour-${tourId}-${timestamp}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`); // https://sharp.pixelplumbing.com

  // Files
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${tourId}-${timestamp}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`); // https://sharp.pixelplumbing.com

      req.body.images.push(filename);
    }),
  );

  console.log(req.body.images);

  next();
};

exports.csvUploadHandler = () => {
  const csvUploadStorage = multer.memoryStorage();

  const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv')) {
      cb(null, true);
    } else {
      cb('Please upload only csv file.', false);
    }
  };

  const uploadCSV = multer({
    storage: csvUploadStorage,
    fileFilter: csvFilter,
  });

  return uploadCSV.single('doc');
};
