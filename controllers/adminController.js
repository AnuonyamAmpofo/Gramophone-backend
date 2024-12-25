const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const multer = require('multer');
const upload = multer();

const formatTimeTo12Hour = (time) => {
  const [hour, minute] = time.split(":");
  let hour12 = ((+hour + 11) % 12) + 1;
  const ampm = +hour >= 12 ? "PM" : "AM";
  return `${hour12}:${minute}${ampm}`;
};

const AdminController = {
  addStudent: async (req, res) => {
    const { studentName, email, contact, instrument, schedule } = req.body;
  
    try {
      // Find the student with the largest studentID
      const lastStudent = await Student.findOne().sort({ studentID: -1 }).limit(1);
  
      // Generate the new studentID by incrementing the highest existing studentID
      const newStudentID = lastStudent ? (parseInt(lastStudent.studentID, 10) + 1).toString().padStart(4, '0') : '0001';
  
      // Create the new student with the generated ID
      const newStudent = new Student({
        studentID: newStudentID,
        studentName,
        email,
        contact,
        instrument,
        schedule
      });
  
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
        // Step 1: Delete the student document
        const deletedStudent = await Student.findOneAndDelete({ studentID });
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Step 2: Find all courses referencing the student in their sessions
        const coursesWithStudent = await Course.find({ "sessions.studentID": studentID });

        // Log the courses found
        console.log("Courses containing the student:", coursesWithStudent);

        // Step 3: Remove the student's sessions from all matching courses
        const updateCourses = await Course.updateMany(
            { "sessions.studentID": studentID }, // Match courses where the session contains the studentID
            { $pull: { sessions: { studentID } } } // Remove all matching sessions
        );

        // Step 4: Respond with a success message
        res.status(200).json({
            message: 'Student and associated sessions deleted successfully',
            deletedStudent,
            updatedCourses: updateCourses.modifiedCount, // Number of courses updated
            coursesWithStudent // Optional: include the courses in the response
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete student and associated sessions', error: err.message });
    }
},
  assignStudent: async (req, res) => {
    const { studentName, studentID, instrument, instructorID, day, time} = req.body;
  
    // Log the incoming request parameters
    console.log("Received parameters:", { studentID, instrument, instructorID, day });
  
    if (!studentID || !instrument || !instructorID || !day || !time) {
      return res.status(400).send({ error: 'Missing required fields' });
    }
  
    try {
      // Log the query criteria to ensure it matches what you expect
      console.log("Searching for course with criteria:", { day, instrument, instructorID });
  
      // Find the course with matching day, instrument, and instructorID
      const course = await Course.findOne({ day, instrument, instructorID });
  
      if (!course) {
        console.log("Course not found with provided criteria.");  // Log if course is not found
        return res.status(404).send({ error: 'Course not found' });
      }
  
      // Check if the student is already in the course
      const existingSession = course.sessions.find(session => session.studentID === studentID);
      if (existingSession) {
        console.log("Student already assigned to this course.");
        return res.status(400).send({ error: 'Student is already assigned to this course' });
      }

      const formattedTime = formatTimeTo12Hour(time);
  
      // Add the student to the course's sessions array
      course.sessions.push({
        studentID,
        studentName,
        time: formattedTime,   // You can customize how the time is added
      });
  
      // Save the updated course
      await course.save();

      const student = await Student.findOne({studentID});
    
        // Log the student object
        console.log("Student found:", student);
        
        if (student) {
          // Log the current schedule
          console.log("Current Student Schedule:", student.schedule);

          const existingSchedule = student.schedule.find(
            (schedule) => schedule.day === day && schedule.time === formattedTime
          );

          if (!existingSchedule) {
            // Log the addition to the schedule
            console.log(`Adding to schedule: Day: ${day}, Time: ${formattedTime}`);
            student.schedule.push({ day, time: formattedTime });
            await student.save();
          } else {
            console.log("Schedule entry already exists, not adding.");
          }

          // Log the updated schedule
          console.log("Updated Student Schedule:", student.schedule);
        } else {
          console.log("No student found with the provided ID.");
        }

  
      res.status(200).send({ message: 'Student assigned successfully' });
    } catch (error) {
      console.error("Error assigning student:", error);
      res.status(500).send({ error: 'Failed to assign student' });
    }
  },
  

  findCourseInstructorDayInstrument: async (req, res) => {
    const { instructorID } = req.params;
    const { day, instrument } = req.query;
  
    try {
      const course = await Course.findOne({
        instructorID,
        day,
        instrument
      });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  findInstructorInstrument: async (req, res) => {
    console.log("Instructor find endpoint hit");
    const instrument = req.query.instrument;
    
    if (!instrument) {
        return res.status(400).send({ error: 'Instrument is required' });
    }
    
    try {
        const instructors = await Instructor.find({ instrument });
        console.log("Instructors found:", instructors);
        res.json(instructors);
    } catch (error) {
        console.error("Error fetching instructors:", error);
        res.status(500).send({ error: 'Failed to fetch instructors' });
    }
},

  addInstructor: async (req, res) => {
    const { name, email, contact, instrument } = req.body;
  
    try {
      // Find the student with the largest studentID
      const lastInstructor = await Instructor.findOne().sort({ instructorID: -1 }).limit(1);
  
      // Generate the new studentID by incrementing the highest existing studentID
      const newInstructorID = lastInstructor ? (parseInt(lastInstructor.instructorID, 10) + 1).toString().padStart(4, '0') : '0001';
  
      // Create the new student with the generated ID
      const newInstructor = new Instructor({
        instructorID: newInstructorID,
        name,
        email,
        contact,
        instrument
      });
  
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
        // Step 1: Delete the student document
        const deletedInstructor = await Instructor.findOneAndDelete({ instructorID });
        if (!deletedInstructor) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Step 2: Find all courses referencing the student in their sessions
        const coursesWithInstructor = await Course.find({ "instructorID": instructorID });

        // Log the courses found
        console.log("Courses for the instructor:", coursesWithInstructor);

        // Step 3: Remove the student's sessions from all matching courses
        await Course.deleteMany({ "instructorID": instructorID });

        // Step 4: Respond with a success message
        res.status(200).json({
            message: 'Instructor and associated courses deleted successfully',
            deletedInstructor,
            updatedCourses: updateCourses.modifiedCount,
            coursesWithInstructor
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete instructor and associated courses', error: err.message });
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
