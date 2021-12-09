/* eslint-disable @typescript-eslint/no-explicit-any */
const { Schema, model, Types } = require('mongoose');
const lessonSchema = require('./lesson.model');

const NAMESPACE = 'COURSE MODEL';

// Put as much business logic in the models to keep the controllers as simple and lean as possible.
const schema = new Schema(
  {
    title: {
      type: String,
      minlength: 3,
      maxlength: 320,
      required: [true, 'A course must have a title'],
      trim: true
    },
    slug: {
      type: String,
      lowercase: true,
      index: { unique: true, sparse: true }
    },
    description: {
      type: {},
      minlength: 200,
      required: true
    },
    price: {
      type: Number,
      default: 9.99
    },
    image: {},
    category: String,
    isPublished: {
      type: Boolean,
      default: false
    },
    isPaid: {
      type: Boolean,
      default: true
    },
    instructor: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    lessons: [lessonSchema]
  },
  { timestamps: true }
);

schema.statics.exists = async title => {
  console.log(username, email);
  // You can use arrow functions here as we will not be requiring
  // the 'this' reference
  return await Course.findOne({
    title
  }).exec();
};

// Create a Model.
module.exports = Course = model('Course', schema);
