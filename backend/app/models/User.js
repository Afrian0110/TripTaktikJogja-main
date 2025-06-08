const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Cek dulu apakah model 'User' sudah ada, kalau belum buat model baru
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
