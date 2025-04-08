const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Admin = require('../models/Admin');

/**
 * Helper function to get a user by their role.
 * @param {Object} user - The user object from the request.
 * @returns {Object|null} - The user document from the database or null if not found.
 */
const getUserByRole = async (user) => {
  try {
    if (user.role === 'student') return await Student.findById(user._id);
    if (user.role === 'instructor') return await Instructor.findById(user._id);
    if (user.role === 'admin') return await Admin.findById(user._id);
    return null;
  } catch (err) {
    console.error('Error fetching user by role:', err);
    throw new Error('Error fetching user by role');
  }
};

/**
 * Controller to get the theme for the logged-in user.
 */
exports.getTheme = async (req, res) => {
  try {
    const user = await getUserByRole(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ theme: user.theme || 'light' });
  } catch (err) {
    console.error('Error fetching theme:', err);
    res.status(500).json({ message: 'Error fetching theme', error: err.message });
  }
};

/**
 * Controller to update the theme for the logged-in user.
 */
exports.updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    // Validate the theme input
    if (!theme || (theme !== 'light' && theme !== 'dark')) {
      return res.status(400).json({ message: 'Invalid theme value. Allowed values are "light" or "dark".' });
    }

    const user = await getUserByRole(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the theme
    user.theme = theme;
    await user.save();

    res.status(200).json({ message: 'Theme updated successfully', theme: user.theme });
  } catch (err) {
    console.error('Error updating theme:', err);
    res.status(500).json({ message: 'Error updating theme', error: err.message });
  }
};