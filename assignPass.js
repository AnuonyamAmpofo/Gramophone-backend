require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Instructor = require('./models/Instructor'); // Adjust path if needed

const mongoDBUri = process.env.MONGODB_URI;
async function assignPasswordsToInstructors() {
  try {
    await mongoose.connect(mongoDBUri);
    console.log('Connected to MongoDB');

    // Fetch all students from the database
    const instructors = await Instructor.find({});
    
    for (let instructor of instructors) {
      // Combine 'password' with the student's studentID
      const newPassword = `password${instructor.instructorID}`;
      
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the student's password
      instructor.password = hashedPassword;
      await instructor.save(); // Save the updated student document
      console.log(`Password updated for instructor ${instructor.instructorID}`);
    }
    
    console.log('Passwords successfully updated for all instructors');
  } catch (err) {
    console.error('Error assigning passwords to instructors:', err);
  } finally {
    mongoose.disconnect(); // Close connection after operation is done
  }
}

// Run the function
assignPasswordsToInstructors();
