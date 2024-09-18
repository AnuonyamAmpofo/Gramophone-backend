const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    courseCode: { type: String, required: true },
    studentID: { type: String, required: true },
    comment: { type: String, required: true },
    instructorID: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
