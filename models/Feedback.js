const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  studentName: { type: String },
  message: { type: String, required: true },
  replies: [
    {
      userID: String, // Can be student or admin
      userName: String,
      role: { type: String, enum: ["admin", "student"], required: true },
      replyMessage: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
