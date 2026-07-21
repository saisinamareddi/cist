const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const uploadAttendance = async (req, res) => {
  const records = req.body.records || (Array.isArray(req.body) ? req.body : []);

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No attendance records provided',
    });
  }

  try {
    const ops = records.map((rec) => {
      const date = String(rec.date || new Date().toISOString().split('T')[0]).trim();
      const rollNumber = String(rec.rollNumber || rec.roll).trim().toUpperCase();
      const subject = String(rec.subject || 'General').trim();
      const semester = String(rec.semester || '6th Sem').trim();
      return {
        updateOne: {
          filter: { date, rollNumber, subject, semester },
          update: {
            $set: {
              date,
              rollNumber,
              subject,
              semester,
              studentName: String(rec.studentName || rec.name || '').trim(),
              branch: String(rec.branch || '').trim(),
              status: rec.status === 'P' || rec.status === 'Present' ? 'P' : 'A',
            },
          },
          upsert: true,
        },
      };
    });

    await Attendance.bulkWrite(ops);

    return res.json({
      success: true,
      message: `Successfully uploaded attendance for ${records.length} students`,
      count: records.length,
    });
  } catch (error) {
    console.error('Error uploading attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload attendance records',
      error: error.message,
    });
  }
};

const getStudentAttendance = async (req, res) => {
  const rollNumber = String(req.params.rollNumber || '').trim().toUpperCase();

  if (!rollNumber) {
    return res.status(400).json({
      success: false,
      message: 'Roll number is required',
    });
  }

  try {
    const records = await Attendance.find({ rollNumber }).sort({ date: -1 });

    const conducted = records.length;
    const attended = records.filter((r) => r.status === 'P').length;

    return res.json({
      success: true,
      rollNumber,
      conducted,
      attended,
      records,
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ rollNumber: 1 });
    return res.json({
      success: true,
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student list',
    });
  }
};

module.exports = {
  uploadAttendance,
  getStudentAttendance,
  getAllStudents,
};
