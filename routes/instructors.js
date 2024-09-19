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

// Route to get course details
router.get('/courses/:courseCode', InstructorController.viewCourseDetail);
// router.get('/personal-info', InstructorController.viewPersonalInfo);

// Route to update personal info
router.put('/personal-info', InstructorController.updatePersonalInfo);

router.get('/instructor-info', InstructorController.viewPersonalInfo);

//To get announcements for specific course
router.get('/courses/:courseCode/announcements', InstructorController.getCourseAnnouncements);
// Route to post an announcement in a particular course
router.post('/courses/:courseCode/announcement', InstructorController.postAnnouncement);

router.delete('/courses/:courseCode/announcement/:announcementId', InstructorController.deleteAnnouncement);

router.patch('/courses/:courseCode/announcement/:announcementId', InstructorController.editAnnouncement);

// Route to post an announcement for a particular student
// router.post('/students/:studentID/announcement', InstructorController.postAnnouncementForStudent);
router.get('/name-info', InstructorController.getInstructorName);
router.post('/courses/:courseCode/student/:studentID/comments', InstructorController.postCommentForStudent);
router.get('/courses/students/:studentID', InstructorController.getStudentInfo), 
router.put('/reset-password/:instructorID', InstructorController.resetPassword);
module.exports = router;
