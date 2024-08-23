const express = require('express');
const router = express.Router();
const tokenBlacklist = require('../utils/tokenBlacklist'); // Import the blacklist

router.post('/', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Add token to blacklist to prevent future use
  tokenBlacklist.push(token);

  // Destroy session
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed.' });
    }
    res.status(200).json({ message: 'Logout successful.' });
  });
});

module.exports = router;
