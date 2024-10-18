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

// Course Routes
router.post('/courses', AdminController.createCourse);
router.put('/courses/:courseID', AdminController.updateCourse);
router.delete('/courses/:courseID', AdminController.deleteCourse);
router.get('/courses', AdminController.viewCourses);
router.get('/courses/instrument/:instrument', AdminController.viewCoursesByInstrument);
router.post('/courses/assign-student', AdminController.assignStudent);
router.post('/courses/assign-student-multiple', AdminController.assignStudentToCourses);

module.exports = router;