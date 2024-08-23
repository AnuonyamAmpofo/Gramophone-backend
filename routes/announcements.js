const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find();
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific announcement
router.get('/:id', getAnnouncement, (req, res) => {
    res.json(res.announcement);
});

// Create a new announcement
router.post('/', async (req, res) => {
    const announcement = new Announcement(req.body);
    try {
        const newAnnouncement = await announcement.save();
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an announcement
router.put('/:id', getAnnouncement, async (req, res) => {
    Object.assign(res.announcement, req.body);
    try {
        const updatedAnnouncement = await res.announcement.save();
        res.json(updatedAnnouncement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an announcement
router.delete('/:id', getAnnouncement, async (req, res) => {
    try {
        await res.announcement.remove();
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get an announcement by ID
async function getAnnouncement(req, res, next) {
    let announcement;
    try {
        announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.announcement = announcement;
    next();
}

module.exports = router;
