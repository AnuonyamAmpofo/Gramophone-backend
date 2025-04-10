// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/forgetController'); // Ensure this path is correct

// Route to request OTP
router.post('/request-otp', authController.requestOTP);

// Route to verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Route to update password after verifying OTP
router.put('/update-password', authController.updatePassword);

module.exports = router;
