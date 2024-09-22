const Student = require('../models/Student');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Instructor = require('../models/Instructor');
const Comment = require('../models/Comment');
const bcrypt = require('bcrypt');

const StudentController = {
  // View all general announcements
  viewGeneralAnnouncements: async (req, res) => {
    try {
      const announcements = await Announcement.find();
      res.status(200).json(announcements);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve announcements', error: err.message });
    }
  },

  getAllCourseAnnouncements: async (req, res) => {
    try {
      const studentID = req.user.sp_userId; // Assuming student's ID is stored in req.user
  
      // Fetch all courses where the student is enrolled (sessions array has studentID)
      const courses = await Course.find({ 'sessions.studentID': studentID });
  
      if (!courses.length) {
        return res.status(404).json({ message: 'No courses found for this student' });
      }
  
      // Extract course codes from the courses the student is enrolled in
      const courseCodes = courses.map(course => course.courseCode);
  
      // Fetch all announcements where courseCode matches any of the student's courses
      const courseAnnouncements = await Announcement.find({ courseCode: { $in: courseCodes } });
  
      if (!courseAnnouncements.length) {
        return res.status(404).json({ message: 'No announcements found for this student\'s courses' });
      }
  
      // Fetch any general (admin-type) announcements
      const adminAnnouncements = await Announcement.find({ type: 'admin' }).select('title content time');
  
      // Combine course-specific and admin announcements
      const allAnnouncements = [
        ...courseAnnouncements.map(announcement => ({
          courseCode: announcement.courseCode,
          title: announcement.title,
          content: announcement.content,
          time: new Date(announcement.createdAt).toLocaleString()
        })),
        ...adminAnnouncements.map(announcement => ({
          courseCode: 'Admin', // Label admin announcements separately
          title: announcement.title,
          content: announcement.content,
          time: new Date(announcement.createdAt).toLocaleString()
        }))
      ];
  
      // Return the combined announcements
      res.status(200).json({ announcements: allAnnouncements });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve announcements', error: err.message });
    }
  },  
  getComments: async (req, res) => {
    try {
        const studentID = req.user.sp_userId;
        console.log(`Fetching comments for studentID: ${studentID}`);

        // Fetch all comments related to the student, sorted by date descending
        const comments = await Comment.find({ studentID }).sort({ datePosted: -1 }); // Ensure you're sorting by the correct field
        console.log(`Found ${comments.length} comment(s) for studentID: ${studentID}`);

        const allComments = comments.map(comment => ({
            courseCode: comment.courseCode,
            commentID: comment._id,
            content: comment.comment,
            studentID: comment.studentID,
            studentName: comment.studentName,
            date: new Date(comment.datePosted).toLocaleString(), // Adjust according to your field
            instructorName: comment.instructorName,
            instructorID: comment.instructorID
        }));

        res.status(200).json({
            message: 'Comments retrieved successfully',
            comments: allComments // Ensure you return `comments` as the key
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: 'Server error' });
    }
},


  // View course-specific announcements
  viewCourseAnnouncements: async (req, res) => {
    const { courseCode } = req.params;
    try {
      const course = await Course.findOne({ courseCode });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const announcements = await Announcement.find({ courseCode });
      res.status(200).json(announcements);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve course announcements', error: err.message });
    }
  },

  // View personal information

  // Edit personal information
  editPersonalInfo: async (req, res) => {
    const updateData = req.body;
    try {
      const student = await Student.findOneAndUpdate({ studentID: req.user.userId }, updateData, { new: true });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json({ message: 'Personal information updated successfully', student });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update personal information', error: err.message });
    }
  },

  // View session details along with all instructor details
  viewSessionDetails: async (req, res) => {
    try {
      const student = await Student.findOne({ studentID: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const sessions = await Course.find({
        'sessions.studentID': student._id
      }, {
        'sessions.$': 1,
        courseCode: 1,
        instrument: 1,
        day: 1,
        instructorID: 1
      });

      if (!sessions.length) {
        return res.status(404).json({ message: 'No sessions found' });
      }

      const sessionDetails = await Promise.all(sessions.map(async (session) => {
        const instructor = await Instructor.findById(session.instructorID);

        return {
          courseCode: session.courseCode,
          instrument: session.instrument,
          day: session.day,
          time: session.sessions[0].time,
          instructorDetails: {
            name: instructor.instructorName,
            email: instructor.email,
            contact: instructor.contact,
            
          }
        };
      }));

      res.status(200).json(sessionDetails);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve session details', error: err.message });
    }
  },
  viewPersonalInfo: async (req, res) => {
    try {
      const student = await Student.findOne({ studentID: req.user.sp_userId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve personal information', error: err.message });
    }
  },

  // Endpoint to get student info for the dashboard
  studentInfo: async (req, res) => {
    try {
      // Assuming req.user.sp_userId contains the studentID after authentication
      const studentID = req.user.sp_userId;
      
      // Find the student by their studentID
      const student = await Student.findOne({ studentID });

      // If the student is not found, return a 404 error
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Respond with the student's name and other necessary information
      res.status(200).json({
        message: 'Student info retrieved successfully',
        studentID: student.studentID,
        studentName: student.studentName,
        email: student.email,
        instrument: student.instrument,
        schedule: student.schedule,
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve student info', error: err.message });
    }
  },
  studentCourses: async (req, res) => {
    try {
      const studentID = req.user.sp_userId; // Assuming this is stored in req.user

      // Find courses where this studentID is present in the sessions array
      const courses = await Course.find({ 'sessions.studentID': studentID })
        .populate('instructorID', 'name') // Populate instructor name
        .exec();

      if (!courses.length) {
        return res.status(404).json({ message: 'No courses found for this student' });
      }

      // Map through the courses to structure the response
      const courseData = courses.map(course => ({
        courseCode: course.courseCode,
        instructorName: course.instructorName, // Access the populated instructor name
        instructorEmail: course.instructorID.email,
        day: course.day,
        time: course.sessions.find(session => session.studentID === studentID).time // Get the time for this student
      }));

      res.status(200).json({
        message: 'Courses retrieved successfully',
        courses: courseData,
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
    }
  },
  getCourseAnnouncements: async (req, res) => {
    const { courseCode } = req.params; // Extract course code from request parameters
  
    try {
      // Find the course by its courseCode
      const course = await Course.findOne({ courseCode });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Fetch all announcements related to the course
      const courseAnnouncements = await Announcement.find({ courseCode });
  
      if (!courseAnnouncements.length) {
        return res.status(404).json({ message: 'No announcements found for this course' });
      }
  
      // Return the announcements in the response
      res.status(200).json({
        message: 'Course announcements retrieved successfully',
        announcements: courseAnnouncements,
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve course announcements', error: err.message });
    }
  },
  
  resetPassword: async (req, res) => {
    const { studentID } = req.params;
    const { newPassword } = req.body;

    try {
      // Find the instructor by ID
      const student = await Student.findOne({ studentID });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the instructor's password
      student.password = hashedPassword;
      await student.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
  }

};

module.exports = StudentController;
