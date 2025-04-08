const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Instructor = require('./models/Instructor');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function addDefaultThemeToUsers() {
  try {
    // Admins
    await Admin.updateMany(
      { theme: { $exists: false } },
      { $set: { theme: 'light' } }
    );

    // Students
    await Student.updateMany(
      { theme: { $exists: false } },
      { $set: { theme: 'light' } }
    );

    // Instructors
    await Instructor.updateMany(
      { theme: { $exists: false } },
      { $set: { theme: 'light' } }
    );

    console.log('✅ Default theme added to all existing users.');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error updating documents:', err);
    mongoose.connection.close();
  }
}

addDefaultThemeToUsers();
