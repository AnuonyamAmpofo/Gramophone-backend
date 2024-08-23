const express = require('express');
const router = express.Router();
const InstructorController = require('../controllers/instructorController');
const {authenticateInstructor }= require('../middleware/auth');

// Apply authentication middleware to all instructor routes
router.use(authenticateInstructor);

// Route to view courses the instructor is to teach
router.get('/courses', InstructorController.viewCourses);

// Route to view the number of students and the list of students in a course
router.get('/courses/:courseCode/students', InstructorController.viewCourseStudents);

// Route to view personal info
// router.get('/personal-info', InstructorController.viewPersonalInfo);

// Route to update personal info
router.put('/personal-info', InstructorController.updatePersonalInfo);

router.get('/instructor-info', InstructorController.getInstructorInfo);

// Route to post an announcement in a particular course
router.post('/courses/:courseCode/announcement', InstructorController.postAnnouncement);

// Route to post an announcement for a particular student
router.post('/students/:studentID/announcement', InstructorController.postAnnouncementForStudent);
router.get('/name-info', InstructorController.getInstructorName);

router.put('/reset-password/:instructorID', InstructorController.resetPassword);
module.exports = router;
