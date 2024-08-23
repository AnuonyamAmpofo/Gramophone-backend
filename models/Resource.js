const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: String,
    description: String,
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
    date: Date,
});

module.exports = mongoose.model('Resource', resourceSchema);
