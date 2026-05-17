const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // null for Google OAuth users
  googleId: { type: String },
  avatar: { type: String, default: '' },
  groqApiKey: { type: String, default: '' },
  stats: {
    articlesRead: { type: Number, default: 0 },
    wordsLearned: { type: Number, default: 0 },
    quizzesDone: { type: Number, default: 0 },
    speakingSessions: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  goals: [{
    text: String,
    done: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
