require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course'); // Adjust path if needed
const Student = require('./models/Student'); // Adjust path if needed

const mongoDBUri = process.env.MONGODB_URI;

const migrateStudentSchedules = async () => {
  try {
    await mongoose.connect(mongoDBUri);
    console.log('Connected to MongoDB');

    const students = await Student.find();
    for (const student of students) {
      // Ensure schedule is an array
      if (!Array.isArray(student.schedule)) {
        console.warn(`Student ${student.studentID} has an invalid schedule. Initializing as an empty array.`);
        student.schedule = [];
      }

      for (const schedule of student.schedule) {
        if (!schedule.courseCode) {
          // Log the query parameters
          console.log(`Searching for course with: day=${schedule.day}, studentID=${student.studentID}`);

          // Find the course that matches the day and time
          const course = await Course.findOne({
            day: schedule.day,
            // "sessions.time": schedule.time,
            "sessions.studentID": student.studentID,
          });

          if (course) {
            console.log(`Found course: ${course.courseCode} for student ${student.studentID}`);
            schedule.courseCode = course.courseCode; // Add the courseCode
          } else {
            console.warn(`No matching course found for student ${student.studentID} with schedule:`, schedule);
          }
        }
      }
      await student.save(); // Save the updated student
    }
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateStudentSchedules();