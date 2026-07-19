const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const DEFAULT_STUDENT_PASSWORD = process.env.STUDENT_PASSWORD || 'student@123';
const PASSWORD_SALT_ROUNDS = 10;

const formatStudent = (student) => ({
  rollNumber: student.rollNumber,
  name: student.name,
  branch: student.branch,
});

const verifyStudentPassword = async (student, password) => {
  if (student.passwordHash) {
    return bcrypt.compare(password, student.passwordHash);
  }

  return password === DEFAULT_STUDENT_PASSWORD;
};

const loginStudent = async (req, res) => {
  const rollNumber = String(req.body.rollNumber || req.body.roll || '').trim().toUpperCase();
  const password = String(req.body.password || '');

  if (!rollNumber || !password) {
    return res.status(400).json({
      success: false,
      message: 'Roll number and password are required',
    });
  }

  const student = await Student.findOne({ rollNumber });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student roll number not found',
    });
  }

  const passwordMatches = await verifyStudentPassword(student, password);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: 'Invalid roll number or password',
    });
  }

  return res.json({
    success: true,
    message: 'Login successful',
    student: formatStudent(student),
  });
};

const changeStudentPassword = async (req, res) => {
  const rollNumber = String(req.body.rollNumber || req.body.roll || '').trim().toUpperCase();
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');
  const confirmPassword = String(req.body.confirmPassword || '');

  if (!rollNumber || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Roll number, current password, new password, and confirm password are required',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password and confirm password do not match',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
    });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from current password',
    });
  }

  const student = await Student.findOne({ rollNumber });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student roll number not found',
    });
  }

  const passwordMatches = await verifyStudentPassword(student, currentPassword);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  student.passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  await student.save();

  return res.json({
    success: true,
    message: 'Password updated successfully',
  });
};

module.exports = { loginStudent, changeStudentPassword };
