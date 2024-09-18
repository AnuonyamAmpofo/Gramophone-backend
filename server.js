"use strict";
const session = require('express-session');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MongoStore = require('connect-mongo'); // Import connect-mongo
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json()); // I replaced bodyParser.json() with express.json()
app.use(cors()); 
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
        maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (24 hours in milliseconds)
    }
}));


// MongoDB connection
const mongoDBUri = process.env.MONGODB_URI;
mongoose.connect(mongoDBUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Import routes
const loginRoutes = require('./routes/login'); // Import login routes
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students'); 
const instructorRoutes = require('./routes/instructors');
const attendanceRoutes = require('./routes/attendance');
const sessionLogRoutes = require('./routes/sessionLogs');
const announcementRoutes = require('./routes/announcements');
const resourceRoutes = require('./routes/resources');
const logoutRoutes = require('./routes/logout');


mongoose.set("strictQuery", false);
// Use routes
app.use('/logout', logoutRoutes);
app.use('/login', loginRoutes); 
app.use('/admin', adminRoutes);
app.use('/students', studentRoutes);
app.use('/instructors', instructorRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/sessionLogs', sessionLogRoutes);
app.use('/announcements', announcementRoutes);
app.use('/resources', resourceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
