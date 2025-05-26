const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const wisataRoutes = require('./routes/wisataRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/wisata', wisataRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/wishlist', wishlistRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
