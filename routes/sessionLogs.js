const express = require('express');
const router = express.Router();
const SessionLog = require('../models/SessionLog');

// Get all session logs
router.get('/', async (req, res) => {
    try {
        const sessionLogs = await SessionLog.find().populate('student').populate('instructor');
        res.json(sessionLogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific session log
router.get('/:id', getSessionLog, (req, res) => {
    res.json(res.sessionLog);
});

// Create a new session log
router.post('/', async (req, res) => {
    const sessionLog = new SessionLog(req.body);
    try {
        const newSessionLog = await sessionLog.save();
        res.status(201).json(newSessionLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a session log
router.put('/:id', getSessionLog, async (req, res) => {
    Object.assign(res.sessionLog, req.body);
    try {
        const updatedSessionLog = await res.sessionLog.save();
        res.json(updatedSessionLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a session log
router.delete('/:id', getSessionLog, async (req, res) => {
    try {
        await res.sessionLog.remove();
        res.json({ message: 'Session log deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get a session log by ID
async function getSessionLog(req, res, next) {
    let sessionLog;
    try {
        sessionLog = await SessionLog.findById(req.params.id).populate('student').populate('instructor');
        if (!sessionLog) {
            return res.status(404).json({ message: 'Session log not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.sessionLog = sessionLog;
    next();
}

module.exports = router;
