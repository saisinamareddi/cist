const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    rollNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    studentName: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true, default: '6th Sem (III Year - II Sem)' },
    subject: { type: String, required: true, trim: true, default: 'General' },
    status: { type: String, enum: ['P', 'A'], required: true },
  },
  { timestamps: true }
);

// Ensure a single attendance record per student per date per subject per semester
attendanceSchema.index({ date: 1, rollNumber: 1, subject: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
