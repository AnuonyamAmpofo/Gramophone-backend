// controllers/authController.js

const jwt = require('jsonwebtoken');
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const tokenBlacklist = require('../utils/tokenBlacklist'); // Import the blacklist

const otpStore = new Map();

// Initialize nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app-specific password
  },
});

// Helper to find user and model by username
const findUserByUsername = async (username) => {
  let user = await Admin.findOne({ username: username });
  if (user) return { user, model: Admin, type: "admin" };

  user = await Student.findOne({ studentID: username });
  if (user) return { user, model: Student, type: "student" };

  user = await Instructor.findOne({ instructorID: username });
  if (user) return { user, model: Instructor, type: "instructor" };

  return null;
}; 

// Controller methods
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
      const expiration = Date.now() + 10 * 60 * 1000; // 5 minutes

      otpStore.set(username, { otp, expiration });

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
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
  
      // Log inputs for debugging
      console.log('Username:', username);
      console.log('New Password:', newPassword);
  
      // Ensure the newPassword is not null or undefined
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('Hashed Password:', hashedPassword);  // Debugging the hashed password
  
      await model.findOneAndUpdate({ username }, { password: hashedPassword });
      otpStore.delete(username); // clear OTP after successful update
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  },
  
};
