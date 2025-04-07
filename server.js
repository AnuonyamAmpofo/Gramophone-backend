"use strict";
const session = require('express-session');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MongoStore = require('connect-mongo'); // Import connect-mongo
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000; 

// Middleware
app.use(express.json()); // I replaced bodyParser.json() with express.json()
app.use(cors()); 
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 
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
// try {
//     // const loginRoutes = require('./routes/login');
//     console.log("Login route imported successfully.");
//     console.log("✅ Login route imported successfully!");

// console.log("✅ Login route registered in Express!");

// } catch (error) {
//     console.error("Error importing login.js:", error);
// }


app.get('/test', (req, res) => {
    console.log("✅ Test route hit");
    res.send("Server is working!");
});


const loginRoutes = require('./routes/login');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students'); 
const instructorRoutes = require('./routes/instructors');
const attendanceRoutes = require('./routes/attendance');
const sessionLogRoutes = require('./routes/sessionLogs');
const announcementRoutes = require('./routes/announcements');
const resourceRoutes = require('./routes/resources');
const logoutRoutes = require('./routes/logout');

// console.log("🔄 Checking route files...");
// console.log("✅ Login Routes:", loginRoutes);
// console.log("✅ Available routes in loginRoutes:", Object.keys(loginRoutes));

mongoose.set("strictQuery", false);
// Use routes
// console.log("🔄 Before registering routes...");
// console.log("✅ Login Routes:", loginRoutes);
// console.log("✅ Admin Routes:", adminRoutes);
// console.log("✅ Student Routes:", studentRoutes);
// console.log("✅ Instructor Routes:", instructorRoutes);
// console.log("✅ Announcement Routes:", announcementRoutes);
// console.log("✅ Resource Routes:", resourceRoutes);
// console.log("✅ Logout Routes:", logoutRoutes);

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

app._router.stack.forEach((middleware) => {
    if (middleware.route) { // If it's a route
        console.log(`Route: ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
