const BASE_URL = 'http://localhost:3000/api';

// 🔐 LOGIN
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// 📝 REGISTER
export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return res.json();
}

// 📌 GET DETAIL WISATA
export async function getWisataById(id) {
  const res = await fetch(`${BASE_URL}/wisata/${id}`);
  return res.json();
}

// ❤️ ADD WISHLIST
export async function addWishlist(wisata_id, token) {
  const res = await fetch(`${BASE_URL}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // opsional, tergantung API
    },
    body: JSON.stringify({ wisata_id })
  });
  return res.json();
}

// 📋 GET WISHLIST
export async function getWishlist(token) {
  const res = await fetch(`${BASE_URL}/wishlist`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// 🗑 DELETE WISHLIST
export async function deleteWishlist(id, token) {
  const res = await fetch(`${BASE_URL}/wishlist/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}
