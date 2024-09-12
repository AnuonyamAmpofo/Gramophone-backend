const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

router.post('/', async (req, res) => {
    const { username, password } = req.body; // No need to specify the role

    try {
        console.log('Login attempt:', { username });

        let user, role, userName;

        // Search across all roles
        user = await Admin.findOne({ username });
        if (user) {
            role = 'admin';
            userName = user.username; // Use the relevant property for Admin name or username
        } else {
            user = await Instructor.findOne({ instructorID: username });
            if (user) {
                role = 'instructor';
                userName = user.name; // Use the relevant property for Instructor name
            } else {
                user = await Student.findOne({ studentID: username });
                if (user) {
                    role = 'student';
                    userName = user.studentName; // Use the relevant property for Student name
                }
            }
        }

        // If no user found
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Password verification
        const isMatch = await bcrypt.compare(password, user.password);
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
