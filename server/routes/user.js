const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update stats
router.patch('/stats', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const field = { articles: 'articlesRead', words: 'wordsLearned', quizzes: 'quizzesDone', speaking: 'speakingSessions' }[type];
    if (!field) return res.status(400).json({ error: 'Invalid type' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { [`stats.${field}`]: 1 }, $set: { 'stats.lastActive': new Date() } },
      { new: true }
    );
    res.json({ stats: user.stats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update goals
router.patch('/goals', auth, async (req, res) => {
  try {
    const { goals } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { goals }, { new: true });
    res.json({ goals: user.goals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save Groq API key
router.patch('/apikey', auth, async (req, res) => {
  try {
    const { groqApiKey } = req.body;
    await User.findByIdAndUpdate(req.user._id, { groqApiKey });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get profile
router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
