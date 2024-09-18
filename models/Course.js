const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true }, // e.g., 'Drum123'
    instrument: { type: String, required: true }, // e.g., 'Drum'
    instructorID: { type: String, required: true },
    instructorName: { type: String },
    day: { type: String, required: true }, // e.g., 'Monday'
    sessions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        time: { type: String }, // e.g., '2pm'
        comments: [{ // Array of comments for each student
            comment: { type: String, required: true },
            instructorID: { type: String, required: true },
            datePosted: { type: Date, default: Date.now },
        }]
    }],
    announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }]
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
