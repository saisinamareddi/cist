const Student = require('../models/Student');

const formatStudent = (student) => ({
  rollNumber: student.rollNumber,
  name: student.name,
  branch: student.branch,
});

const getStudentByRoll = async (req, res) => {
  const rollNumber = String(req.params.rollNumber || '').trim().toUpperCase();
  const student = await Student.findOne({ rollNumber }).lean();

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  return res.json({ success: true, student: formatStudent(student) });
};

const createStudent = async (req, res) => {
  const rollNumber = String(req.body.rollNumber || req.body.roll || '').trim().toUpperCase();
  const name = String(req.body.name || req.body.FullName || '').trim();

  if (!rollNumber || !name) {
    return res.status(400).json({ success: false, message: 'rollNumber and name are required' });
  }

  const student = await Student.findOneAndUpdate(
    { rollNumber },
    {
      $set: {
        rollNumber,
        name,
        branch: req.body.branch || req.body.Branch || '',
        rawData: req.body,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(201).json({ success: true, student: formatStudent(student) });
};

module.exports = { getStudentByRoll, createStudent };
