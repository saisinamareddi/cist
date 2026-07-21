const express = require('express');
const {
  uploadAttendance,
  getStudentAttendance,
  getAllStudents,
} = require('../controllers/attendanceController');

const router = express.Router();

router.post('/upload', uploadAttendance);
router.get('/student/:rollNumber', getStudentAttendance);
router.get('/students', getAllStudents);

module.exports = router;
