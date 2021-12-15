/* eslint-disable @typescript-eslint/no-explicit-any */
const { Schema } = require('mongoose');
const NAMESPACE = 'LESSON MODEL';

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true
    },
    slug: {
      type: String,
      lowercase: true
    },
    content: {
      type: {},
      minlength: 200
    },
    video: {},
    free_preview: {
      // This option enables the instructor to specify if this course can be previewed for free.
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Export lesson schema.
module.exports = lessonSchema;
