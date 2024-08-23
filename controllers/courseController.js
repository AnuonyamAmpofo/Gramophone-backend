const Announcement = require('../models/Announcement');
const Course = require('../models/Course');

const CourseController = {
  // Get announcements for a specific course
  getCourseAnnouncements: async (req, res) => {
    const { courseCode } = req.params; // Assuming courseCode is passed as a parameter

    try {
      const course = await Course.findOne({ courseCode });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const announcements = await Announcement.find({ courseCode });
      res.status(200).json({ announcements });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve announcements', error: err.message });
    }
  },
};

module.exports = CourseController;
