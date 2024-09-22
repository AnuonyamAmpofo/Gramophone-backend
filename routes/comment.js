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
        const studentID = req.user.studentID;
        console.log(`Fetching comments for studentID: ${studentID}`);

        // Fetch all comments related to the student, sorted by date descending
        const comments = await Comment.find({ studentID }).sort({ date: -1 });
        console.log(`Found ${comments.length} comments for studentID: ${studentID}`);

        res.status(200).json({
            message: 'Comments retrieved successfully',
            comments
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
