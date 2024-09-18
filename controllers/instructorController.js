const Instructor = require('../models/Instructor'); // Assuming Instructor model is stored here
const Course = require('../models/Course'); // Assuming Course model is stored here
const Comment = require('../models/Comment')
const Announcement = require('../models/Announcement'); // Assuming Announcement model is stored here
const bcrypt = require('bcrypt');


const InstructorController = {
  // View courses the instructor is to teach
  viewCourses: async (req, res) => {
    try {
      const instructorID = req.user.sp_userId;
      console.log('Instructor ID:', instructorID);  // Debug statement
  
      // Check if instructorID is available
      if (!instructorID) {
        return res.status(400).json({ message: 'Instructor ID is not available' });
      }
  
      const courses = await Course.find({ instructorID });
      // console.log('Courses found:', courses);  // Debug statement
  
      if (!courses.length) {
        return res.status(404).json({ message: 'No courses found for this instructor' });
      }
  
      res.status(200).json({
        message: 'Courses retrieved successfully',
        courses: courses.map(course => ({
          courseCode: course.courseCode,
          instrument: course.instrument,
          instructorName: course.instructorName,
          day: course.day,
          numberOfStudents: course.sessions.length,
          sessions: course.sessions.map(session => ({
            studentID: session.studentID,
            studentName: session.studentName,
            time: session.time
          }))
        }))
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
    }
  },

  // View the number of students in each course and list of students
  viewCourseStudents: async (req, res) => {
    try {
      const { courseCode } = req.params;
      const course = await Course.findOne({ courseCode, instructorID: req.user.sp_userId });

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const studentList = course.sessions.map(session => ({
        studentID: session.studentID,
        studentName: session.studentName,
        time: session.time
      }));

      res.status(200).json({
        message: 'Student list retrieved successfully',
        courseCode: course.courseCode,
        numberOfStudents: studentList.length,
        students: studentList
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve student list', error: err.message });
    }
  },

  // View personal info
  viewPersonalInfo: async (req, res) => {
    try {
      const instructorID = req.user.sp_userId;
      const instructor = await Instructor.findOne({ instructorID });

      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      res.status(200).json({
        message: 'Personal information retrieved successfully',
        instructor: {
          instructorID: instructor.instructorID,
          name: instructor.name,
          email: instructor.email,
          contact: instructor.contact
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve personal information', error: err.message });
    }
  },

  // Change personal info
  updatePersonalInfo: async (req, res) => {
    try {
      const instructorID = req.user.sp_userId;
      const { name, email, contact } = req.body;

      const updatedInstructor = await Instructor.findOneAndUpdate(
        { instructorID },
        { name, email, contact },
        { new: true }
      );

      if (!updatedInstructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      res.status(200).json({
        message: 'Personal information updated successfully',
        instructor: {
          name: updatedInstructor.name,
          email: updatedInstructor.email,
          contact: updatedInstructor.contact
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update personal information', error: err.message });
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

  // Post announcement in a particular course
  postAnnouncement: async (req, res) => {
    try {
      const { courseCode } = req.params;
      const { title, content } = req.body;
      const instructorID = req.user.sp_userId; // Assuming this is set correctly in middleware
  
      // Validate input
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
  
      // Find the course to ensure it exists and is taught by this instructor
      const course = await Course.findOne({ courseCode, instructorID });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found or you do not have access' });
      }
  
      // Create a new announcement
      const newAnnouncement = new Announcement({
        courseCode,
        instructorID,
        title,
        content,
        datePosted: new Date(),
      });
  
      // Save the new announcement
      await newAnnouncement.save();
  
      // Add the announcement to the course's announcements array
      course.announcements.push(newAnnouncement._id);
      await course.save();
  
      // Return the new announcement and success message
      res.status(200).json({ message: 'Announcement posted successfully', announcement: newAnnouncement });
    } catch (err) {
      res.status(500).json({ message: 'Failed to post announcement', error: err.message });
    }
  },
  
  
  postCommentForStudent: async (req, res) => {
    try {
        const { courseCode, studentID } = req.params;
        const { comment } = req.body;
        const instructorID = req.user.sp_userId; // Assume this is set from your middleware

        // Create a new comment
        const newComment = new Comment({
            courseCode,
            studentID,
            comment,
            instructorID,
        });

        await newComment.save();

        res.status(200).json({ message: 'Comment added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add comment', error: err.message });
    }
},
  viewCourseDetail: async (req, res) => {
  try {
    const { courseCode } = req.params; // Extract course code from the URL params
    const instructorID = req.user.sp_userId; // Assuming the instructor's ID is stored in req.user

    // Find the course by courseCode and instructorID
    const course = await Course.findOne({ courseCode, instructorID });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Format the course data for response
    res.status(200).json({
      courseCode: course.courseCode,
      day: course.day,
      numberOfStudents: course.sessions.length,
      sessions: course.sessions.map((session) => ({
        studentID: session.studentID,
        studentName: session.studentName,
        time: session.time,
      })),
      announcements: course.announcements, // Assuming announcements are embedded in the course model
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve course details', error: err.message });
  }
},

  resetPassword: async (req, res) => {
    const { instructorID } = req.params;
    const { newPassword } = req.body;

    try {
      // Find the instructor by ID
      const instructor = await Instructor.findOne({ instructorID });
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the instructor's password
      instructor.password = hashedPassword;
      await instructor.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
  },
 
    getInstructorInfo: async (req, res) => {
      try {
        const instructorID = req.user.sp_userId;
        const instructor = await Instructor.findById(instructorID).select('name');
        if (!instructor) {
          return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ instructorName: instructor.name });
      } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve instructor info', error: err.message });
      }
    },



    getInstructorName: async (req, res) => {
      try {
        const instructorID = req.user.sp_userId; // Assuming this is stored in req.user
        
        if (!instructorID) {
          return res.status(400).json({ message: 'Instructor ID is missing from the request' });
        }
  
        // Assuming instructorID is not an ObjectId but a custom field like 'employeeId'
        const instructor = await Instructor.findOne({ instructorId: instructorID }).select('name');
  
        if (!instructor) {
          return res.status(404).json({ message: 'Instructor not found' });
        }
  
        res.status(200).json({ instructorName: instructor.name });
      } catch (err) {
        console.error("Error in getInstructorName:", err); // This will log the error in your server console
        res.status(500).json({ message: 'Failed to retrieve instructor name', error: err.message });
      }
    },
    viewCourseDetail: async (req, res) => {
      try {
        const { courseCode } = req.params; // Extract course code from the URL params
        const instructorID = req.user.sp_userId; // Assuming the instructor's ID is stored in req.user
    
        // Find the course by courseCode and instructorID
        const course = await Course.findOne({ courseCode, instructorID });
    
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
    
        // Format the course data for response
        res.status(200).json({
          courseCode: course.courseCode,
          day: course.day,
          numberOfStudents: course.sessions.length,
          sessions: course.sessions.map((session) => ({
            studentID: session.studentID,
            studentName: session.studentName,
            time: session.time,
          })),
          announcements: course.announcements, // Assuming announcements are embedded in the course model
        });
      } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve course details', error: err.message });
      }
    },
    
  


};

module.exports = InstructorController;
