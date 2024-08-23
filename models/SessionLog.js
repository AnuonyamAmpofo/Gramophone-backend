const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
    date: Date,
    content: String,
});

module.exports = mongoose.model('SessionLog', sessionLogSchema);
