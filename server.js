const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/rateLimiterDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

const rateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: WINDOW_SECONDS }
});

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);

const rateLimiter = async (req, res, next) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    let record = await RateLimit.findOne({ ip: clientIp });

    if (!record) {
      record = await RateLimit.create({ ip: clientIp, count: 1 });
    } else {
      if (record.count >= MAX_REQUESTS) {
        return res.status(429).json({
          status: 429,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded (max 5 requests per minute).'
        });
      }
      record.count += 1;
      await record.save();
    }

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count));
    next();
  } catch (err) {
    console.error(err);
    next();
  }
};

// Serve the frontend dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Apply rate limiter to API routes
app.use('/api', rateLimiter);

app.get('/api/data', (req, res) => {
  res.json({ success: true, message: 'Request allowed!' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));