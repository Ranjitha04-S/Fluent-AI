const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const defaultGoals = [
  { text: 'Read one article (5 minutes)', done: false },
  { text: 'Learn 5 new vocabulary words', done: false },
  { text: 'Practice speaking or writing', done: false },
  { text: 'Complete a grammar quiz', done: false },
  { text: 'Record yourself speaking', done: false },
];

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, goals: defaultGoals });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, groqApiKey: user.groqApiKey, stats: user.stats, goals: user.goals } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, groqApiKey: user.groqApiKey, stats: user.stats, goals: user.goals } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

// Get current user
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
