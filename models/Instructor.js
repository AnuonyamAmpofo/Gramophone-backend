const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    instructorID:  { type: String, unique: true, required: true },
    name: String,
    contact: String,
    email: String,
    instrument: [String],
    password: String,
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
      
    
});

module.exports = mongoose.model('Instructor', instructorSchema);
