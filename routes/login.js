const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student'); // Adjust the path as needed
const Instructor = require('../models/Instructor'); // Adjust the path as needed
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user;
        let role;
        let userName; 

        // Check if user is a student
        user = await Student.findOne({ studentID: username });
        if (user) {
            role = 'student';
            userName = user.studentName;
        } else {
            // Check if user is an instructor
            user = await Instructor.findOne({ instructorID: username });
            if (user) {
                role = 'instructor';
                userName = user.instructorName;
            }
        }

        // If no user found
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Password verification
        console.log('Provided password:', password);
        console.log('Stored hashed password:', user.password);
        console.log('Retrieved password from DB:', user.password.trim());

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const tokenPayload = {
            userId: user._id,
            sp_userId: role === 'student' ? user.studentID : role === 'instructor' ? user.instructorID : null,
            type: role
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '4h' });
        console.log('Token generated:', token);

        // Send response including the role, name, and token
        res.status(200).json({ 
            token, 
            type: role, 
            sp_userId: userName  // Send the name or identifier back to the frontend
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;