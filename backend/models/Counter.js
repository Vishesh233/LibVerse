const mongoose = require('mongoose');

/**
 * Named sequences, advanced atomically with findOneAndUpdate + $inc (e.g. _id "libraryId").
 */
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Counter', counterSchema);
