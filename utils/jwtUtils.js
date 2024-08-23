require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// Function to generate a JWT
function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '4h' });
}

// Function to verify a JWT
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

module.exports = { generateToken, verifyToken };
