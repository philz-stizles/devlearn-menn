const fs = require('fs');
const { nanoid } = require('nanoid');
const AWS = require('aws-sdk');
const logger = require('../../logger');

const NAMESPACE = 'AWS S3 SERVICE';

const imageTypes = ['jpeg', 'png', 'gif', 'svg', 'jpg'];
const videoTypes = ['mp4'];

const awsConfig = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION
};

const s3 = new AWS.S3(awsConfig);

exports.uploadDoc = (file, type) => {
  const Bucket = process.env.AWS_S3_BUCKET_NAME;
  const extension = type.split('/')[1];
  const mime = imageTypes.includes(extension)
    ? '/images'
    : videoTypes.includes(extension)
    ? '/videos'
    : '';
  const Key = `${
    process.env.AWS_S3_BUCKET_ROOT_DIR
  }${mime}/${nanoid()}.${extension}`;

  const params = {
    Bucket,
    Key,
    Body: fs.readFileSync(file),
    ACL: 'public-read',
    ContentType: type
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function (error, data) {
      if (error) {
        logger.error(NAMESPACE, 'S3 DOCUMENT COULD NOT BE UPLOADED', error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

exports.uploadBase64 = (base64Data, type) => {
  console.log(type);
  const mime = imageTypes.includes(type)
    ? '/images'
    : videoTypes.includes(type)
    ? '/videos'
    : '';

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${process.env.AWS_S3_BUCKET_ROOT_DIR}${mime}/${nanoid()}.${type}`,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `image/${type}`
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (error, data) => {
      if (error) {
        logger.error(NAMESPACE, 'S3 DOCUMENT COULD NOT BE UPLOADED', error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

exports.removeFile = (key, bucket) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (error, data) => {
      if (error) {
        logger.error(NAMESPACE, 'S3 DOCUMENT COULD NOT BE UPLOADED', error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};
