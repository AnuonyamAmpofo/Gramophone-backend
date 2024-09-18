const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    courseCode: { type: String, required: true },
    studentID: { type: String, required: true },
    studentName:{type: String},
    comment: { type: String, required: true },
    instructorID: { type: String, required: true },
    instructorName: {type: String},

    datePosted: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
