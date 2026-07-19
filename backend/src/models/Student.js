const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    branch: { type: String, default: '', trim: true },
    passwordHash: { type: String, default: '' },
    rawData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
