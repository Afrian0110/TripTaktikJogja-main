const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

// GET /api/wishlist?userId=xxx
router.post('/', async (req, res) => {
  const { userId, wisata_id } = req.body;
  const newItem = new Wishlist({ userId, wisata_id });
  await newItem.save();
  res.json({ message: 'Berhasil ditambahkan ke wishlist' });
});

router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const wishlist = await Wishlist.find({ userId });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contoh: Express Router
router.delete('/:userId/:wisataId', async (req, res) => {
  const { userId, wisataId } = req.params;

  try {
    const deleted = await Wishlist.findOneAndDelete({ userId, wisata_id: Number(wisataId) });

    if (!deleted) {
      return res.status(404).json({ message: 'Wishlist tidak ditemukan' });
    }

    res.json({ message: 'Wishlist berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
