const express = require('express');
const { changeStudentPassword, loginStudent, loginFaculty } = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginStudent);
router.post('/faculty-login', loginFaculty);
router.post('/change-password', changeStudentPassword);

module.exports = router;

