const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['course', 'admin']}, // Specifies whether the announcement is course-related or general (admin)
  courseCode: { type: String, required: function() { return this.type === 'course'; } }, // Only required for course-related announcements
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: false }, // Reference to the instructor who posted the announcement
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
