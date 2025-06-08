const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { upload } = require('../../cloudinary');

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { title, description, location, imageUrl } = req.body;

    const feedback = new Feedback({ title, description, location, imageUrl });
    await feedback.save();

    res.status(201).json({
      message: 'Feedback berhasil disimpan',
      feedback,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Gagal menyimpan feedback' });
  }
});


// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(allFeedback);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil feedback' });
  }
});

module.exports = router;
