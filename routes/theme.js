const express = require('express');
const router = express.Router();
const { getTheme, updateTheme } = require('../controllers/themeController');
const { authenticateToken } = require('../middleware/auth');

router.get('/',authenticateToken, getTheme);
router.put('/', authenticateToken, updateTheme);

module.exports = router;
