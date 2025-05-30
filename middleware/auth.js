const jwt = require('jsonwebtoken');
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const tokenBlacklist = require('../utils/tokenBlacklist'); // Import the blacklist


const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // app-specific password
  },
});

// Helper to find user and model by username
const findUserByUsername = async (username) => {
  let user = await Admin.findOne({ username });
  if (user) return { user, model: Admin, type: "admin" };

  user = await Student.findOne({ username });
  if (user) return { user, model: Student, type: "student" };

  user = await Instructor.findOne({ username });
  if (user) return { user, model: Instructor, type: "instructor" };

  return null;
};

module.exports = {
  requestOTP: async (req, res) => {
    const { username } = req.body;

    try {
      const result = await findUserByUsername(username);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      const { user } = result;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiration = Date.now() + 5 * 60 * 1000; // 5 minutes

      otpStore.set(username, { otp, expiration });

      // Send email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("OTP request error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  },

  verifyOTP: (req, res) => {
    const { username, otp } = req.body;
    const record = otpStore.get(username);

    if (!record) {
      return res.status(400).json({ message: "No OTP found for this user" });
    }

    const { otp: storedOtp, expiration } = record;

    if (Date.now() > expiration) {
      otpStore.delete(username);
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP verified" });
  },

  updatePassword: async (req, res) => {
    const { username, newPassword } = req.body;
    const record = otpStore.get(username);

    if (!record) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    try {
      const result = await findUserByUsername(username);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      const { model } = result;

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await model.findOneAndUpdate({ username }, { password: hashedPassword });
      otpStore.delete(username); // clear OTP after successful update

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  },
};

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
