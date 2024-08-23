const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const multer = require('multer');
const upload = multer();

const AdminController = {
  addStudent: async (req, res) => {
    const { studentID, studentName, email, contact, instrument, schedule } = req.body;
    try {
      const newStudent = new Student({ studentID, studentName, email, contact, instrument, schedule });
      await newStudent.save();
      res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add student', error: err.message });
    }
  },
  updateStudent: async (req, res) => {
    const { studentID } = req.params;
    const updateData = req.body;
    try {
      const updatedStudent = await Student.findOneAndUpdate({ studentID }, updateData, { new: true });
      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json({ message: 'Student updated successfully', updatedStudent });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update student', error: err.message });
    }
  },
  viewStudents: async (req, res) => {
    try {
      const students = await Student.find();
      res.status(200).json(students);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve students', error: err.message });
    }
  },
  viewStudent: async (req, res) => {
    const { studentID } = req.params;
    try {
      const student = await Student.findOne({ studentID });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve student', error: err.message });
    }
  },
  deleteStudent: async (req, res) => {
    const { studentID } = req.params;
    try {
      const deletedStudent = await Student.findOneAndDelete({ studentID });
      if (!deletedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete student', error: err.message });
    }
  },
  addInstructor: async (req, res) => {
    const { instructorID, name, email, contact, instrument, schedule } = req.body;
    try {
      const newInstructor = new Instructor({ instructorID, name, email, contact, instrument, schedule });
      await newInstructor.save();
      res.status(201).json({ message: 'Instructor added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add instructor', error: err.message });
    }
  },
  updateInstructor: async (req, res) => {
    const { instructorID } = req.params;
    const updateData = req.body;
    try {
      const updatedInstructor = await Instructor.findOneAndUpdate({ instructorID }, updateData, { new: true });
      if (!updatedInstructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ message: 'Instructor updated successfully', updatedInstructor });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update instructor', error: err.message });
    }
  },
  viewInstructors: async (req, res) => {
    try {
      const instructors = await Instructor.find();
      res.status(200).json(instructors);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve instructors', error: err.message });
    }
  },
  viewInstructor: async (req, res) => {
    const { instructorID } = req.params;
    try {
      const instructor = await Instructor.findOne({ instructorID });
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json(instructor);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve instructor', error: err.message });
    }
  },
  deleteInstructor: async (req, res) => {
    const { instructorID } = req.params;
    try {
      const deletedInstructor = await Instructor.findOneAndDelete({ instructorID });
      if (!deletedInstructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ message: 'Instructor deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete instructor', error: err.message });
    }
  },
  addAnnouncement: async (req, res) => {
    const { title, content } = req.body;
    try {
      const newAnnouncement = new Announcement({ title, content });
      await newAnnouncement.save();
      res.status(201).json({ message: 'Announcement added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add announcement', error: err.message });
    }
  },
  viewAnnouncements: async (req, res) => {
    try {
      const announcements = await Announcement.find();
      res.status(200).json(announcements);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve announcements', error: err.message });
    }
  },

  //COURSE CONTROLLERS
  createCourse: async (req, res) => {
    const { courseCode, instrument, day, instructorID, sessions } = req.body;

  try {
    // Find the instructor by instructorID
    const instructor = await Instructor.findOne({ instructorID });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Validate the student IDs and fetch their details
    const sessionDetails = [];
    for (const session of sessions) {
      const student = await Student.findOne({ studentID: session.studentID });
      if (!student) {
        return res.status(404).json({ message: `Student with ID ${session.studentID} not found` });
      }
      sessionDetails.push({
        studentID: student.studentID,
        studentName: student.studentName, // Adjust this according to your Student model field name
        time: session.time
      });
    }

    // Create the course
    const newCourse = new Course({
      courseCode,
      instrument,
      day,
      instructorID: instructor.instructorID,
      instructorName: instructor.name, // Adjust this according to your Instructor model field name
      sessions: sessionDetails,
    });

    await newCourse.save();

    // Populate the response with complete details
    res.status(201).json({
      message: 'Course created successfully',
      course: {
        courseCode: newCourse.courseCode,
        instrument: newCourse.instrument,
        day: newCourse.day,
        instructorID: newCourse.instructorID,
        instructorName: newCourse.instructorName,
        sessions: newCourse.sessions.map(session => ({
          studentID: session.studentID,
          studentName: session.studentName,
          time: session.time
        })),
        _id: newCourse._id,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course', error: err.message });
  }
  },
  updateCourse: async (req, res) => {
    const { courseID } = req.params;
    const updateData = req.body;
    try {
      const updatedCourse = await Course.findByIdAndUpdate(courseID, updateData, { new: true });
      if (!updatedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json({ message: 'Course updated successfully', updatedCourse });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update course', error: err.message });
    }
  },
  deleteCourse: async (req, res) => {
    const { courseID } = req.params;
    try {
      const deletedCourse = await Course.findByIdAndDelete(courseID);
      if (!deletedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete course', error: err.message });
    }
  },
  viewCourses: async (req, res) => {
    try {
      const courses = await Course.find().populate('instructorID', 'instructorName');
      res.status(200).json(courses);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
    }
  },

  // Method to get courses by instrument
  viewCoursesByInstrument: async (req, res) => {
    const { instrument } = req.params;
    try {
      const courses = await Course.find({ instrument }).populate('instructorID', 'instructorName');
      if (courses.length === 0) {
        return res.status(404).json({ message: 'No courses found for this instrument' });
      }
      res.status(200).json(courses);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
    }
  },
  assignStudentToCourse: [
    upload.none(),
    async (req, res) => {
    const { courseCode, studentID, time } = req.body;

    try {
      // Find the course by courseCode
      const course = await Course.findOne({ courseCode });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Find the student by studentID
      const student = await Student.findOne({ studentID });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Add the student session to the course
      course.sessions.push({ studentID: student.studentID, studentName: student.studentName, time });

      // Save the updated course
      await course.save();

      // Prepare the response with student names
      const responseSessions = course.sessions.map(session => ({
        studentID: session.studentID,
        studentName: session.studentName,
        time: session.time
      }));

      res.status(200).json({
        message: 'Student assigned to course successfully',
        course: {
          courseCode: course.courseCode,
          instrument: course.instrument,
          day: course.day,
          instructorID: course.instructorID, // Assuming instructorID is already populated as ID
          sessions: responseSessions
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to assign student to course', error: err.message });
    }
  
  }],
  //Assign to multiple courses
    assignStudentToCourses: async (req, res) => {
    const { studentID, courses } = req.body;

    try {
        // Find the student by studentID
        const student = await Student.findOne({ studentID });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const updatedCourses = [];

        // Loop through each course provided in the request
        for (const courseInfo of courses) {
            const { courseCode, time } = courseInfo;

            // Find the course by courseCode
            const course = await Course.findOne({ courseCode });
            if (!course) {
                return res.status(404).json({ message: `Course with code ${courseCode} not found` });
            }

            // Add the student session to the course
            course.sessions.push({ studentID: student.studentID, studentName: student.studentName, time });

            // Save the updated course
            await course.save();

            // Add the updated course details to the response list
            updatedCourses.push({
                courseCode: course.courseCode,
                instrument: course.instrument,
                day: course.day,
                instructorID: course.instructorID,
                instructorName: course.instructorName,
                sessions: course.sessions.map(session => ({
                    studentID: session.studentID,
                    studentName: session.studentName,
                    time: session.time
                }))
            });
        }

        // Send the detailed response
        res.status(200).json({
            message: 'Student assigned to courses successfully',
            courses: updatedCourses
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to assign student to courses', error: err.message });
    }
}
};

module.exports = AdminController;
