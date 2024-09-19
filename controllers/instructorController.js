const Instructor = require('../models/Instructor'); // Assuming Instructor model is stored here
const Course = require('../models/Course'); // Assuming Course model is stored here
const Comment = require('../models/Comment');
const Student = require('../models/Student');
const Announcement = require('../models/Announcement'); // Assuming Announcement model is stored here
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { format } = require('date-fns');



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
  viewCoursesforToday: async (req, res) => {
    try {
      const instructorID = req.user.sp_userId;
      console.log('Instructor ID:', instructorID);  // Debug statement
  
      // Check if instructorID is available
      if (!instructorID) {
        return res.status(400).json({ message: 'Instructor ID is not available' });
      }
  
      // Get the current day of the week
      const currentDay = format(new Date(), 'EEEE'); // 'EEEE' gives the full name of the day (e.g., 'Monday')
  
      // Find courses for the instructor that match today's day
      const courses = await Course.find({ 
        instructorID, 
        day: currentDay // Filter by day
      });
  
      if (!courses.length) {
        return res.status(404).json({ message: 'No courses found for this instructor today' });
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
      const courseAnnouncements = await Announcement.find({ courseCode }).sort({createdAt: -1});
        // .sort({ createdAt: -1 });
  
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
  deleteAnnouncement: async (req, res) => {
    const { courseCode, announcementId } = req.params;

    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return res.status(400).json({ message: 'Invalid announcement ID' });
        }

        // Find the course by courseCode
        const course = await Course.findOne({ courseCode });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Convert announcementId to string and find its index in the course's announcements array
        const announcementIndex = course.announcements.findIndex(ann => ann.toString() === announcementId);

        if (announcementIndex === -1) {
            return res.status(404).json({ message: 'Announcement not found in this course' });
        }

        // Remove the announcement ID from the course's announcements array
        course.announcements.splice(announcementIndex, 1);
        await course.save(); // Save the updated course

        // Delete the announcement document from the Announcement collection
        const deletedAnnouncement = await Announcement.findByIdAndDelete(announcementId);

        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error("Error deleting announcement:", error.message); // Log detailed error
        res.status(500).json({ message: 'Server error', error: error.message });
    }
},

  

editAnnouncement: async (req, res) => {
    const { announcementId } = req.params; // Assuming announcementId is the ID of the announcement to edit
    const { title, content } = req.body;

    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return res.status(400).json({ message: 'Invalid announcement ID' });
        }

        // Find and update the announcement
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Update fields if provided
        if (title) announcement.title = title;
        if (content) announcement.content = content;

        // Save the updated announcement
        await announcement.save();

        res.status(200).json({ message: 'Announcement updated successfully' });
    } catch (error) {
        console.error("Error updating announcement:", error.message); // Log detailed error
        res.status(500).json({ message: 'Server error', error: error.message });
    }
},


  getStudentInfo: async(req,res)=> {
    try {
      const { studentID } = req.params;
      const student = await Student.findOne({ studentID });

      res.status(200).json({
        studentName: student.studentName,
        email: student.email,
        contact: student.contact,

      });
    }
    catch(err) {
      console.error("Failed to get student details", err)
    }
  },
  
  postCommentForStudent: async (req, res) => {
    try {
        const { courseCode, studentID } = req.params;
        const { comment } = req.body;
        const instructorID = req.user.sp_userId; // Assume this is set from your middleware
        
        const instructor = await Instructor.findOne({instructorID});
        if (!instructor){
          return res.status(404).json({message: "Instructor Not Found"})
        }

        const student = await Student.findOne({studentID});
        if (!student){
          return res.status(404).json({message: "Student Not Found"})
        }
        
        // Create a new comment
        const newComment = new Comment({
            courseCode,
            studentID,
            studentName: student.studentName,
            instructorName: instructor.name,
            instructorID,
            comment,
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
