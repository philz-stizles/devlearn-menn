const NAMESPACE = 'LESSON MODEL';

const lessonSchema = new mongoose.Schema(
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
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Export lesson schema.
module.exports = lessonSchema;
