const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    courseCode: { type: String, required: true, unique: true }, // e.g., 'Drum123'
    instrument: { type: String, required: true }, // e.g., 'Drum'
    instructorID: { type: String, required: true },
    instructorName: {type: String},
    day: { type: String, required: true }, // e.g., 'Monday'
    sessions: [{
        studentID: { type: String, required: true }, // studentID, not _id
        studentName: {type: String},
        time: { type: String, required: false } // e.g., '2pm'
    }],
    announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }]
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
