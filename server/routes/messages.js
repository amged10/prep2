const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// GET /api/messages/recent
// returns last 50 messages, newest last
router.get('/recent', async (req, res) => {
  try {
    const messages = await Message.find({})
      .sort({ createdAt: 1 })
      .limit(200)
      .lean()
      .exec();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
