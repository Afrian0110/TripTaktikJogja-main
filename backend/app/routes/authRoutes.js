const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const passport = require("passport");

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_super_aman';

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Cek user sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'Registrasi berhasil', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;


// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi.' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Email atau password salah.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Email atau password salah.' });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Login berhasil',
    token,
    user: { id: user._id,name: user.name, email: user.email }
  });
});

// Endpoint untuk login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Endpoint setelah login
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login.html' }),
  (req, res) => {
    const token = generateToken(req.user);
    // Redirect ke halaman frontend dengan token
    res.redirect(`http://localhost:5173/home.html?token=${token}`);
  }
);

module.exports = router;
