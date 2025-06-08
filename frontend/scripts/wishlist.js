const BASE_URL = 'https://triptaktikjogja-main-production.up.railway.app/api';
const wishlistContainer = document.getElementById('wishlistContent');

// Fungsi untuk mendapatkan ID user dari localStorage (atau dari token, tergantung sistem login kamu)
function getUserId() {
  const user = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
  return user?._id || null;
}


// Fungsi untuk menampilkan wishlist
async function loadWishlist() {
  const userId = getUserId();
  if (!userId) {
    wishlistContainer.innerHTML = '<p>Anda belum login.</p>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/wishlist/${userId}`);
    const data = await response.json();

    if (data.length === 0) {
      wishlistContainer.innerHTML = '<p>Wishlist Anda kosong.</p>';
      return;
    }

    // Ambil data wisata berdasarkan wisata_id
    const wisataList = await Promise.all(
      data.map(async (item) => {
        const res = await fetch(`${BASE_URL}/wisata/${item.wisata_id}`);
        return await res.json();
      })
    );

    // Tampilkan ke halaman
    wishlistContainer.innerHTML = wisataList.map(wisata => `
      <div class="wishlist-item">
        <h3>${wisata.nama}</h3>
        <p>${wisata.description_clean}</p>
        <button onclick="removeFromWishlist('${userId}', ${wisata.no})">Hapus</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Gagal mengambil wishlist:', err);
    wishlistContainer.innerHTML = '<p>Gagal memuat wishlist.</p>';
  }
}

// Fungsi untuk menghapus item dari wishlist
async function removeFromWishlist(userId, wisataId) {
  try {
    const response = await fetch(`${BASE_URL}/wishlist/${userId}/${wisataId}`, {
      method: 'DELETE',
    });

    const resultText = await response.text();
    try {
      const result = JSON.parse(resultText);

      if (response.ok) {
        alert(result.message);
        loadWishlist(); // Refresh list
      } else {
        alert(result.message || 'Gagal menghapus');
      }
    } catch (e) {
      console.error('Respons bukan JSON:', resultText);
      alert('Terjadi kesalahan saat parsing respons server.');
    }
  } catch (err) {
    console.error('Gagal menghapus dari wishlist:', err);
    alert('Gagal menghapus dari wishlist.');
  }
}


// Panggil saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadWishlist);
