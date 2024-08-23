const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    instructorID:  { type: String, unique: true, required: true },
    name: String,
    contact: String,
    email: String,
    instrument: [String],
    password: String
    
});

module.exports = mongoose.model('Instructor', instructorSchema);
