const { v2: cloudinary } = require('cloudinary');
// const fs = require('fs');
const { Readable } = require('stream');

// config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // secure: true
});

const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};

// req.files.file.path
exports.uploadFileAsync = async (file) => {
  try {
    return await cloudinary.uploader.upload(file, {
      public_id: `${Date.now()}`,
      resource_type: 'auto', // jpeg, png
      folder: 'foodvendor',
    });
  } catch (error) {
    console.log(error.message);
    return { error };
  }
};

exports.uploadStreamAsync = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // jpeg, png
        folder: 'foodvendor',
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    bufferToStream(buffer).pipe(stream);
  });

// eslint-disable-next-line no-unused-vars
exports.removeFile = (imageId, cb) => {
  cloudinary.uploader.destroy(imageId, (err, result) => {
    if (err) return cb(err, null);
    return cb(null, result);
  });
};
