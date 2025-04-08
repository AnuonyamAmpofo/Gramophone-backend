const express = require('express');
const router = express.Router();
const { getTheme, updateTheme } = require('../controllers/themeController');
// const authenticateUser = require('../middleware/authenticateUser');

router.get('/', getTheme);
router.put('/', updateTheme);

module.exports = router;
