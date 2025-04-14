const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String,  },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
    email: { type: String }
      
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
