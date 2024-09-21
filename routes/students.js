const express = require('express');
const { authenticateStudent } = require('../middleware/auth');
const StudentController = require('../controllers/studentController');
const router = express.Router();

// Middleware for student routes
router.use(authenticateStudent);

// Student routes
router.get('/announcements', StudentController.viewGeneralAnnouncements);
router.get('/courses/announcements', StudentController.viewCourseAnnouncements);
router.get('/personal-info', StudentController.viewPersonalInfo);
router.put('/personal-info', StudentController.editPersonalInfo);
router.get('/session-details', StudentController.viewSessionDetails);
router.put('/reset-password/:studentID', StudentController.resetPassword);
router.get('/student-info', StudentController.studentInfo);
router.get('/courses', StudentController.studentCourses);
router.get('/allannouncements', StudentController.getAllCourseAnnouncements);
router.get('/courses/:courseCode/getcourseannouncements',StudentController.getCourseAnnouncements);
router.get('/comments', StudentController.getComments);

module.exports = router;
