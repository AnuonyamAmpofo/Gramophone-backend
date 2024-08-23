const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: Date,
    present: Boolean,
});

module.exports = mongoose.model('Attendance', attendanceSchema);
