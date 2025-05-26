const express = require('express');
const router = express.Router();

// POST /api/feedback
router.post('/', (req, res) => {
  res.json({ message: 'Feedback berhasil dikirim!' });
});

// GET /api/feedback
router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Liburan ke Malioboro',
      description: 'Seru banget!',
      imageUrl: '/path/foto.jpg'
    }
  ]);
});

module.exports = router;
