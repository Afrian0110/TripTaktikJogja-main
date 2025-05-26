// Contoh: Simulasi login tanpa database

const users = [
  { email: 'test@gmail.com', password: '123456', name: 'Test User' }
];

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  // Biasanya kita kirim token JWT di sini
  res.json({
    message: 'Login berhasil',
    user: {
      name: user.name,
      email: user.email
    },
    token: 'fake-jwt-token'
  });
};

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: 'Email sudah terdaftar' });
  }

  users.push({ name, email, password });
  res.json({ message: 'Registrasi berhasil', user: { name, email } });
};
