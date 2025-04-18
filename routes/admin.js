const express = require('express');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const AdminController = require('../controllers/adminController');
const router = express.Router();

// Middleware for admin routes
router.use(authenticateAdmin);

//Route to test admin access
router.get('/test-admin', (req, res) => {
    res.json({ message: 'You have admin access!' });
  });
  
// Student routes
router.post('/students', AdminController.addStudent);
router.put('/students/:studentID', AdminController.updateStudent);
router.get('/students', AdminController.viewStudents);
router.get('/students/:studentID', AdminController.viewStudent);
router.delete('/students/:studentID', AdminController.deleteStudent);
router.get('/courses/instructor/:instructorID', AdminController.findCourseInstructorDayInstrument);
// router.post('/students/')
// router.post('/assignInstructor', AdminController.assignInstructor);


// Instructor routes
router.post('/instructors', AdminController.addInstructor);
router.put('/instructors/:instructorID', AdminController.updateInstructor);
router.get('/instructors', AdminController.viewInstructors);
router.get('/instructors/:instructorID', AdminController.viewInstructor);
router.delete('/instructors/:instructorID', AdminController.deleteInstructor);
router.get('/student/instructor-find', AdminController.findInstructorInstrument);

// Announcement routes
router.post('/announcements', AdminController.addAnnouncement);
router.get('/announcements', AdminController.viewAnnouncements);
router.delete('/announcements/:announcementId', AdminController.deleteAnnouncement);
router.patch('/announcements/:announcementId', AdminController.editAnnouncement )


router.get('/courses/:courseCode/announcements', AdminController.getCourseAnnouncements);
// Route to post an announcement in a particular course
router.post('/courses/:courseCode/announcement', AdminController.postAnnouncement);
router.get('/announcement/getannouncements', AdminController.getAllAnnouncements),

router.delete('/courses/:courseCode/announcement/:announcementId', AdminController.deleteCourseAnnouncement);

router.patch('/courses/:courseCode/announcement/:announcementId', AdminController.editCourseAnnouncement);

router.post('/courses/:courseCode/student/:studentID/comments', AdminController.postCommentForStudent);

router.post('/reset-password/:username', AdminController.resetPassword);
router.post('/reset-student-password/:studentID', AdminController.resetstudentPassword);


// Course Routes

router.get('/courses/:courseCode', AdminController.viewCourseDetail);
router.post('/courses', AdminController.createCourse);
router.put('/courses/:courseCode', AdminController.updateCourse);
router.delete('/courses/:courseCode', AdminController.deleteCourse);
router.get('/courses', AdminController.viewCourses);
router.get('/courses/instrument/:instrument', AdminController.viewCoursesByInstrument);
router.post('/courses/assign-student', AdminController.assignStudent);
router.get('/courses/students/:studentID', AdminController.getStudentInfo), 
router.get('/courses/student-courses/:studentID', AdminController.getStudentCourses),
router.post('/courses/unassign-student', AdminController.unassignStudent);
// router.post('/courses/assign-student-multiple', AdminController.assignStudentToCourses);

//FEEDBACK ROUTES
router.post('/feedback/:feedbackId', AdminController.replyFeedback);
router.get('/feedback', AdminController.getAllFeedback);

router.get('/theme', AdminController.getTheme);
router.put('/theme', AdminController.updateTheme);

module.exports = router;