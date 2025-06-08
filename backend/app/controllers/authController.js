const jwt = require('jsonwebtoken');
const secretKey = 'RAHASIA123'; // ganti dengan secret key yang aman

const users = [
  { _id: 1, email: 'test@gmail.com', password: '123456', name: 'Test User' }
];

// Login
exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  // Generate token JWT berisi id dan email
  const token = jwt.sign(
    { id: user._id, email: user.email },
    secretKey,
    { expiresIn: '1h' }
  );

res.json({
  message: 'Login berhasil',
  user: {
    id: user._id, // ✅ tambahkan ini
    name: user.name,
    email: user.email
  },
  token,
});
};

// Register
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: 'Email sudah terdaftar' });
  }

  // Buat id baru (simple increment)
  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);

  res.json({ message: 'Registrasi berhasil', user: { name, email } });
};

// Middleware autentikasi token JWT
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, secretKey, (err, userPayload) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });
    req.user = userPayload;
    next();
  });
};

// Endpoint profil user berdasarkan token
exports.profile = (req, res) => {
  const userId = req.user._id;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email
  });
};
