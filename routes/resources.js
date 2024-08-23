const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// Get all resources
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.find().populate('uploadedBy');
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific resource
router.get('/:id', getResource, (req, res) => {
    res.json(res.resource);
});

// Create a new resource
router.post('/', async (req, res) => {
    const resource = new Resource(req.body);
    try {
        const newResource = await resource.save();
        res.status(201).json(newResource);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a resource
router.put('/:id', getResource, async (req, res) => {
    Object.assign(res.resource, req.body);
    try {
        const updatedResource = await res.resource.save();
        res.json(updatedResource);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a resource
router.delete('/:id', getResource, async (req, res) => {
    try {
        await res.resource.remove();
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get a resource by ID
async function getResource(req, res, next) {
    let resource;
    try {
        resource = await Resource.findById(req.params.id).populate('uploadedBy');
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.resource = resource;
    next();
}

module.exports = router;
