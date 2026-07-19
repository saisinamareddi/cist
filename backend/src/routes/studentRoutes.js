const express = require('express');
const { createStudent, getStudentByRoll } = require('../controllers/studentController');

const router = express.Router();

router.post('/', createStudent);
router.get('/:rollNumber', getStudentByRoll);

module.exports = router;
