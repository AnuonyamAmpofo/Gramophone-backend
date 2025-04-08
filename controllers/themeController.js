const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Admin = require('../models/Admin');

const getUserByRole = async (user) => {
  if (user.role === 'student') return await Student.findById(user._id);
  if (user.role === 'instructor') return await Instructor.findById(user._id);
  if (user.role === 'admin') return await Admin.findById(user._id);
  return null;
};

exports.getTheme = async (req, res) => {
  try {
    const user = await getUserByRole(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ theme: user.theme || 'light' });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching theme' });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await getUserByRole(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.theme = theme;
    await user.save();
    res.json({ message: 'Theme updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating theme' });
  }
};
