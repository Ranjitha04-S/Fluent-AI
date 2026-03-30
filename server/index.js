require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

require('./middleware/passport');

const app = express();

app.set('trust proxy', 1); // ← ADD THIS LINE

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB Error:', err));