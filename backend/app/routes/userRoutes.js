// routes/userRoutes.js
console.log('✅ userRoutes loaded');

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
});

module.exports = router;
