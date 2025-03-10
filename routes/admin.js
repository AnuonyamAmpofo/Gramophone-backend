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


router.get('/courses/:courseCode/announcements', AdminController.getCourseAnnouncements);
// Route to post an announcement in a particular course
router.post('/courses/:courseCode/announcement', AdminController.postAnnouncement);
router.get('/announcement/getannouncements', AdminController.getAllAnnouncements),

router.delete('/courses/:courseCode/announcement/:announcementId', AdminController.deleteAnnouncement);

router.patch('/courses/:courseCode/announcement/:announcementId', AdminController.editAnnouncement);

router.post('/courses/:courseCode/student/:studentID/comments', AdminController.postCommentForStudent);

router.post('/reset-password/:username', AdminController.resetPassword);

// Course Routes

router.get('/courses/:courseCode', AdminController.viewCourseDetail);
router.post('/courses', AdminController.createCourse);
router.put('/courses/:courseCode', AdminController.updateCourse);
router.delete('/courses/:courseCode', AdminController.deleteCourse);
router.get('/courses', AdminController.viewCourses);
router.get('/courses/instrument/:instrument', AdminController.viewCoursesByInstrument);
router.post('/courses/assign-student', AdminController.assignStudent);
router.get('/courses/students/:studentID', AdminController.getStudentInfo), 

// router.post('/courses/assign-student-multiple', AdminController.assignStudentToCourses);

module.exports = router;