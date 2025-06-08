const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'RAHASIA123'; // sesuaikan secret key

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, secretKey, (err, userPayload) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });
    req.user = userPayload; // payload biasanya berisi id dan email user
    next();
  });
}

module.exports = authenticateToken;
