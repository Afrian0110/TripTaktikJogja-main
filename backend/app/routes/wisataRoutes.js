const express = require('express');
const router = express.Router();

// Dummy endpoint untuk test
router.get('/:id', (req, res) => {
  const wisataId = req.params.id;
  res.json({
    id: wisataId,
    name: 'Contoh Wisata',
    description: 'Ini hanya contoh response.'
  });
});

module.exports = router;
