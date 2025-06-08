const express = require('express');
const router = express.Router();
const wisataList = require('../../dataset/dataset_jogja_with_vectors.json'); // sesuaikan path file JSON-mu

router.get('/:id', (req, res) => {
  const wisataId = parseInt(req.params.id);
  const wisata = wisataList.find(item => item.no === wisataId);

  if (wisata) {
    res.json(wisata);
  } else {
    res.status(404).json({ message: 'Wisata tidak ditemukan' });
  }
});

module.exports = router;
