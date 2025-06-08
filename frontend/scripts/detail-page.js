const detailPageApp = (() => {
  const elements = {
    heroImage: document.getElementById('heroImage'),
    destinationTitle: document.getElementById('destinationTitle'),
    ratingScore: document.getElementById('ratingScore'),
    starsContainer: document.getElementById('starsContainer'),
    destinationLocation: document.getElementById('destinationLocation'),
    operatingHours: document.getElementById('operatingHours'),
    tourType: document.getElementById('tourType'),
    ticketPrice: document.getElementById('ticketPrice'),
    overviewText: document.getElementById('overviewText'),
    mapLocationName: document.getElementById('mapLocationName'),
    wishlistBtn: document.getElementById('toggleWishlistBtn'),
    wishlistIcon: document.getElementById('wishlist-icon'),
    wishlistText: document.getElementById('wishlist-text'),
  };

  let wisataData = null;

  function formatCurrency(amount) {
    return amount ? `Rp${amount.toLocaleString('id-ID')}` : '-';
  }

  function updateStars(rating) {
    const stars = elements.starsContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < Math.round(rating)) {
        star.classList.remove('far');
        star.classList.add('fas');
      } else {
        star.classList.remove('fas');
        star.classList.add('far');
      }
    });
  }
  function extractType(data) {
  const typeKeys = Object.keys(data).filter(key => key.startsWith('type_clean_') && data[key] === 1);
  if (typeKeys.length > 0) {
    // Ambil nama tipe pertama yang aktif, hapus prefix
    return typeKeys[0].replace('type_clean_', '').replace(/_/g, ' ');
  }
  return '-';
}


  function renderData(data) {
    elements.destinationTitle.textContent = data.nama || 'Tanpa nama';
    elements.heroImage.alt = data.nama || 'Gambar Wisata';

    const ratingStr = (data.vote_average || data.rating || '4.5').toString();
    const ratingNum = parseFloat(ratingStr.replace(',', '.'));
    elements.ratingScore.textContent = ratingNum.toFixed(1);
    updateStars(ratingNum);

    const lat = parseFloat((data.latitude || '0').toString().replace(',', '.'));
    const lon = parseFloat((data.longitude || '0').toString().replace(',', '.'));
    elements.destinationLocation.textContent = `Lat: ${lat}, Lon: ${lon}`;

    const map = L.map('map').setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map)
      .bindPopup(data.nama || 'Lokasi Wisata')
      .openPopup();

    document.getElementById('openInGoogleMaps').href = `https://www.google.com/maps?q=${lat},${lon}`;
    elements.operatingHours.textContent = '08.00 - 17.00 WIB';
    elements.tourType.textContent = extractType(data);
    elements.ticketPrice.textContent = formatCurrency(data.htm_weekday || 0);
    elements.overviewText.textContent = data.description_clean || 'Deskripsi tidak tersedia.';
    // elements.mapLocationName.textContent = data.nama || '-';

    updateWishlistBtn();
  }

  function updateWishlistBtn() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const saved = wishlist.some(item => item.no === wisataData.no);
    if (saved) {
      elements.wishlistIcon.classList.remove('far');
      elements.wishlistIcon.classList.add('fas');
      elements.wishlistText.textContent = 'Sudah di Wishlist';
    } else {
      elements.wishlistIcon.classList.remove('fas');
      elements.wishlistIcon.classList.add('far');
      elements.wishlistText.textContent = 'Simpan ke Wishlist';
    }
  }

  async function toggleWishlist() {
  if (!wisataData || !wisataData.no) {
    alert('❌ Data wisata tidak valid');
    return;
  }

  const user = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')); // Pastikan user login disimpan di localStorage
  if (!user || !user._id) {
    alert('❌ Anda harus login untuk menambahkan wishlist');
    return;
  }

  try {
    const response = await fetch('https://triptaktikjogja-main-production.up.railway.app/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user._id,
        wisata_id: wisataData.no
      })
    });

    const result = await response.json();
    if (response.ok) {
      alert('✅ Berhasil ditambahkan ke wishlist');
    } else {
      if (result.error?.includes('duplicate')) {
        alert('⚠️ Wisata sudah ada di wishlist');
      } else {
        alert('❌ Gagal menambahkan ke wishlist: ' + result.message || result.error);
      }
    }

    updateWishlistBtn();
  } catch (err) {
    alert('❌ Terjadi kesalahan saat mengirim ke server: ' + err.message);
  }
}


  function logout() {
    alert('Logout clicked!');
    // Tambahkan logout handler sesuai aplikasi
  }

  function init() {
    const stored = localStorage.getItem('selectedWisata');
    if (!stored) {
      alert('Data wisata tidak ditemukan, kembali ke halaman rekomendasi.');
      window.location.href = 'recommendation.html';
      return;
    }
    wisataData = JSON.parse(stored);
    renderData(wisataData);

    elements.wishlistBtn.addEventListener('click', toggleWishlist);
  }

  return {
    init,
    logout,
  };
})();

// Inisialisasi halaman detail
document.addEventListener('DOMContentLoaded', detailPageApp.init);
