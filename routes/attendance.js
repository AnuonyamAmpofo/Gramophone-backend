const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        const attendance = await Attendance.find().populate('student');
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific attendance record
router.get('/:id', getAttendance, (req, res) => {
    res.json(res.attendance);
});

// Create a new attendance record
router.post('/', async (req, res) => {
    const attendance = new Attendance(req.body);
    try {
        const newAttendance = await attendance.save();
        res.status(201).json(newAttendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an attendance record
router.put('/:id', getAttendance, async (req, res) => {
    Object.assign(res.attendance, req.body);
    try {
        const updatedAttendance = await res.attendance.save();
        res.json(updatedAttendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an attendance record
router.delete('/:id', getAttendance, async (req, res) => {
    try {
        await res.attendance.remove();
        res.json({ message: 'Attendance record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get an attendance record by ID
async function getAttendance(req, res, next) {
    let attendance;
    try {
        attendance = await Attendance.findById(req.params.id).populate('student');
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.attendance = attendance;
    next();
}

module.exports = router;
