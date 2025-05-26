const express = require('express');
const router = express.Router();

// Simpan wishlist di memori (sementara)
let wishlist = [];

// GET /api/wishlist
router.get('/', (req, res) => {
  res.json(wishlist);
});

// POST /api/wishlist
router.post('/', (req, res) => {
  const { wisata_id } = req.body;
  const item = { id: Date.now(), wisata_id };
  wishlist.push(item);
  res.json({ message: 'Wishlist ditambahkan', item });
});

// DELETE /api/wishlist/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  wishlist = wishlist.filter(item => item.id !== id);
  res.json({ message: 'Wishlist dihapus', id });
});

module.exports = router;
