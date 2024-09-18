const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    instrument: { type: String, required: true },
    instructorID: { type: String, required: true },
    instructorName: { type: String },
    day: { type: String, required: true },
    sessions: [{
        studentID: { type: String, required: true },
        studentName: { type: String },
        time: { type: String },
    }],
    announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }]
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
