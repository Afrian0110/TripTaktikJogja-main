const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // asumsikan Anda punya model User
  },
  wisata_id: {
    type: Number, // disesuaikan dengan field "no" di dataset wisata
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Optional: Buat kombinasi unik agar satu wisata tidak bisa ditambahkan dua kali oleh user yang sama
WishlistItemSchema.index({ userId: 1, wisata_id: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistItemSchema);
