const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Course = require('../models/Course');

// POST route for adding a comment
router.post('/instructors/courses/:courseCode/student/:studentID/comment', async (req, res) => {
    try {
        const { courseCode, studentID } = req.params;
        const { comment } = req.body;
        const instructorID = req.user.sp_userId; // Assume this is set from your middleware

        // Create a new comment
        const newComment = new Comment({
            courseCode,
            studentID,
            comment,
            instructorID,
        });

        await newComment.save();

        res.status(200).json({ message: 'Comment added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add comment', error: err.message });
    }
});

// GET route for retrieving comments for a course and student
router.get('/instructors/courses/:courseCode/student/:studentID/comments', async (req, res) => {
    try {
        const { courseCode, studentID } = req.params;

        const comments = await Comment.find({ courseCode, studentID });

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve comments', error: err.message });
    }
});

module.exports = router;
