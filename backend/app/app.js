const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Koneksi MongoDB
mongoose.connect(
  process.env.MONGO_URI || 'mongodb+srv://rafiafrian003:axnatIZl0ZyHqAGL@cluster0.pvhdtxz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});


// Import routes
const authRoutes = require('./routes/authRoutes');
const wisataRoutes = require('./routes/wisataRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const path = require('path');

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/wisata', wisataRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);


// Serve all frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// (Opsional) Serve pages explicitly
app.get('/pages/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/auth.html'));
});

app.get('/pages/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/home.html'));
});

app.get('/pages/rekomendasi.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/rekomendasi.html'));
});

app.get('/pages/detail-page.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/detail-page.html'));
});

app.get('/pages/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/profile.html'));
});

app.get('/pages/triptips.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/triptips.html'));
});

app.get('/pages/wishlist.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/wishlist.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
