const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update usage time and check limit status
router.post('/track', async (req, res) => {
  const { userId, minutesElapsed } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let todayLog = user.usageLogs.find(log => log.date === today);
    if (todayLog) {
      todayLog.minutesSpent += minutesElapsed;
    } else {
      user.usageLogs.push({ date: today, minutesSpent: minutesElapsed });
      todayLog = user.usageLogs[user.usageLogs.length - 1];
    }

    await user.save();

    const limitReached = todayLog.minutesSpent >= user.dailyLimitMinutes;

    res.json({
      minutesSpent: todayLog.minutesSpent,
      dailyLimit: user.dailyLimitMinutes,
      limitReached
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
