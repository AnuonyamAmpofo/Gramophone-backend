const Instructor = require('../models/Instructor'); // Assuming Instructor model is stored here
const Course = require('../models/Course'); // Assuming Course model is stored here
const Student = require('../models/Student')
const Announcement = require('../models/Announcement'); // Assuming Announcement model is stored here
const bcrypt = require('bcrypt');


const InstructorController = {
  // View courses the instructor is to teach
  viewCourseDetail: async (req, res) => {
    try {
      const { courseCode } = req.params;
      const instructorID = req.user.sp_userId;
  
      const course = await Course.findOne({ courseCode, instructorID })
        .populate({
          path: 'sessions.student', // Populate the 'student' field in sessions
           // Specify which fields to include from the Student model
        })
        .populate('announcements'); // Optionally populate announcements if needed
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json({
        courseCode: course.courseCode,
        day: course.day,
        numberOfStudents: course.sessions.length,
        sessions: course.sessions.map(session => ({
          studentID: session.studentID,
          student: session.student, // This will now include detailed student info
          // studentName: session.student.email,
          time: session.time,
          comments: session.comments || []
        })),
        announcements: course.announcements || []
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve course details', error: err.message });
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

  // Post announcement in a particular course
  postAnnouncement: async (req, res) => {
    try {
      const { courseCode } = req.params;
      const { title, content } = req.body;
      const instructorID = req.user.sp_userId; // Instructor's ID from the request
  
      // Find the course to ensure it exists and is taught by this instructor
      const course = await Course.findOne({ courseCode, instructorID });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
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
  
      // Optionally, push the announcement ID to the course document
      course.announcements.push(newAnnouncement._id);
      await course.save();
  
      res.status(200).json({ message: 'Announcement posted successfully', announcement: newAnnouncement });
    } catch (err) {
      res.status(500).json({ message: 'Failed to post announcement', error: err.message });
    }
  },
  
  postCommentForStudent: async (req, res) => {
    try {
      const { courseCode, studentID } = req.params;
      const { comment } = req.body;
      const instructorID = req.user.sp_userId;
  
      // Find the course by courseCode and instructorID
      const course = await Course.findOne({ courseCode, instructorID });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Find the session (student) in the course sessions array
      const session = course.sessions.find((session) => session.studentID === studentID);
  
      if (!session) {
        return res.status(404).json({ message: 'Student not found in this course' });
      }
  
      // Add the comment to the session's comments array (you may need to ensure the schema supports this)
      session.comments = session.comments || [];
      session.comments.push({
        comment,
        datePosted: new Date(),
        instructorID,
      });
  
      // Save the course with the updated session
      await course.save();
  
      res.status(200).json({ message: 'Comment posted successfully for the student' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to post comment', error: err.message });
    }
  },
  viewCourses: async (req, res) => {
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
    // viewCourseDetail: async (req, res) => {
    //   try {
    //     const { courseCode } = req.params; // Extract course code from the URL params
    //     const instructorID = req.user.sp_userId; // Assuming the instructor's ID is stored in req.user
    
    //     // Find the course by courseCode and instructorID
    //     const course = await Course.findOne({ courseCode, instructorID });
    
    //     if (!course) {
    //       return res.status(404).json({ message: 'Course not found' });
    //     }
    
    //     // Format the course data for response
    //     res.status(200).json({
    //       courseCode: course.courseCode,
    //       day: course.day,
    //       numberOfStudents: course.sessions.length,
    //       sessions: course.sessions.map((session) => ({
    //         studentID: session.studentID,
    //         studentName: session.studentName,
    //         time: session.time,
    //       })),
    //       announcements: course.announcements, // Assuming announcements are embedded in the course model
    //     });
    //   } catch (err) {
    //     res.status(500).json({ message: 'Failed to retrieve course details', error: err.message });
    //   }
    // },
    
  


};

module.exports = InstructorController;
