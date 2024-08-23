const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/tokenBlacklist'); // Import the blacklist

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'No token provided' });

  // Check if token is blacklisted
  if (tokenBlacklist.includes(token)) {
    return res.status(403).json({ message: 'Token has been invalidated' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    console.log('Decoded user:', user); // Log the decoded token
    req.user = user; // Attach user info to the request
    next();
  });
};

// Middleware to check if the user is an admin
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.type !== 'admin') { // Check the type instead of role
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
};

// Middleware to check if the user is a student
const authenticateStudent = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.type !== 'student') { // Check the type instead of role
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
};

// Middleware to check if the user is an instructor
const authenticateInstructor = (req, res, next) => {
  authenticateToken(req, res, () => {
    console.log('User Info:', req.user)
    if (req.user.type !== 'instructor') { // Check the type instead of role
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
};

module.exports = { authenticateToken, authenticateAdmin, authenticateStudent, authenticateInstructor };
