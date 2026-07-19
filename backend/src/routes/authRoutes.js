const express = require('express');
const { changeStudentPassword, loginStudent } = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginStudent);
router.post('/change-password', changeStudentPassword);

module.exports = router;
