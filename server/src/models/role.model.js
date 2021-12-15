/* eslint-disable @typescript-eslint/no-explicit-any */
const { Schema } = require('mongoose');
const NAMESPACE = 'ROLE MODEL';

const roleSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true
    },
    description: {
      type: String,
      maxlength: 70
    }
  },
  { timestamps: true }
);

// Export lesson schema.
module.exports = roleSchema;
