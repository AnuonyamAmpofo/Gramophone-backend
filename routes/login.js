const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student'); 
const Instructor = require('../models/Instructor');
const Admin = require('../models/Admin'); 
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
    console.log("✅ /login route hit inside login.js!");
    const { username, password } = req.body;
    console.log("/login hit with username:", username);

    try {
        let user;
        let role;
        let userName; 

        
        user = await Student.findOne({ studentID: username });
        if (user) {
            role = 'student';
            userName = user.studentName;
        } else {

            user = await Instructor.findOne({ instructorID: username });
            if (user) {
                role = 'instructor';
                userName = user.name; 
            } else {
                
                user = await Admin.findOne({ username: username });  
                if (user) {
                    role = 'admin';
                    userName = user.username;
                }
            }
        }

        // If no user found
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'User not Found' });
        }

        // Password verification
        console.log('🔑 Provided password:', password);
        console.log('🗄️ Stored hashed password:', user.password);

        const isMatch = await bcrypt.compare(password.trim(), user.password.trim());

        console.log('🔍 Password match result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const tokenPayload = {
            userId: user._id,
            sp_userId: role === 'student' ? user.studentID : role === 'instructor' ? user.instructorID : role === 'admin' ? user.username : null,
            type: role
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '4h' });
        console.log('✅ Token generated:', token);

        // Send response including the role, name, and token
        res.status(200).json({ 
            token, 
            type: role, 
            sp_userId: userName  // Send the name or identifier back to the frontend
        });
    } catch (err) {
        console.error('🔥 Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;