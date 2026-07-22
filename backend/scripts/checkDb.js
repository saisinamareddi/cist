require('dotenv').config();
const connectDB = require('../src/config/db');
const Student = require('../src/models/Student');
const Attendance = require('../src/models/Attendance');

const check = async () => {
  await connectDB();
  const studentsCount = await Student.countDocuments();
  const attendanceCount = await Attendance.countDocuments();
  console.log(`Students count: ${studentsCount}`);
  console.log(`Attendance records count: ${attendanceCount}`);

  if (attendanceCount > 0) {
    console.log('Sample attendance records:');
    const samples = await Attendance.find().limit(5);
    console.log(JSON.stringify(samples, null, 2));
  }

  process.exit(0);
};

check().catch(err => {
  console.error(err);
  process.exit(1);
});
