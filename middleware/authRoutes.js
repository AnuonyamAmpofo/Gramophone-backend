const authController = require('./auth');

const express = require('express');
const router = express.Router();

router.post("/request-otp", authController.requestOTP);

// Route for verifying OTP
router.post("/verify-otp", authController.verifyOTP);

// Route for updating the password after OTP verification
router.post("/update-password", authController.updatePassword);

module.exports = router;