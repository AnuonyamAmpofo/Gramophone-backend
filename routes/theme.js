const express = require('express');
const router = express.Router();
const { getTheme, updateTheme } = require('../controllers/themeController');
const { authenticateToken } = require('../middleware/auth');

router.get('/theme',authenticateToken, getTheme);
router.put('/theme', authenticateToken, updateTheme);

module.exports = router;
