require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const connectDB = require('../src/config/db');
const Student = require('../src/models/Student');

const inputPath = process.argv[2] || path.join(__dirname, '..', 'data', 'students.json');

const pick = (item, keys) => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== '') {
      return item[key];
    }
  }
  return '';
};

const normalizeStudent = (item) => {
  const rollNumber = String(
    pick(item, ['rollNumber', 'Roll_Number', 'roll_number', 'roll', 'Roll', 'ROLL'])
  )
    .trim()
    .toUpperCase();

  const name = String(
    pick(item, ['name', 'FullName', 'fullName', 'studentName', 'Name', 'NAME']) || rollNumber
  ).trim();

  if (!rollNumber) {
    return null;
  }

  return {
    rollNumber,
    name,
    branch: String(pick(item, ['branch', 'Branch', 'department', 'Department']) || '').trim(),
    rawData: item,
  };
};

const loadStudents = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Student file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.csv') {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.students;
};

const run = async () => {
  const students = loadStudents(inputPath);

  if (!Array.isArray(students)) {
    throw new Error('Student file must be a CSV, JSON array, or JSON object with a students array');
  }

  await connectDB();

  let imported = 0;
  for (const item of students) {
    const student = normalizeStudent(item);
    if (!student) continue;

    await Student.findOneAndUpdate(
      { rollNumber: student.rollNumber },
      { $set: student, $unset: { year: '', section: '', attendance: '' } },
      { upsert: true, runValidators: true }
    );
    imported += 1;
  }

  console.log(`Imported ${imported} students`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
