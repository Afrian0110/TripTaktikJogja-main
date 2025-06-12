const BASE_URL = 'https://triptaktikjogja-main-production.up.railway.app/api';
const wishlistContainer = document.getElementById('wishlistContent');

// Fungsi untuk mendapatkan ID user dari localStorage
function getUserId() {
  const user = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
  return user?._id || null;
}

// Fungsi untuk menangani klik "View More"
function handleViewMore(wisata) {
  localStorage.setItem('selectedWisata', JSON.stringify(wisata));
  window.location.href = 'detail-page.html';
}

// Fungsi untuk membuat kartu HTML
function createWishlistCard(wisata) {
  let imageUrl;
  if (wisata.image && wisata.image.trim() !== '') {
    imageUrl = wisata.image.startsWith('http') ? wisata.image : `${BASE_URL}/uploads/${wisata.image}`;
  } else {
    imageUrl = `https://source.unsplash.com/300x200/?${encodeURIComponent(wisata.nama || 'tourism')}`;
  }
  const imageOnError = "this.onerror=null;this.src='../assets/images/placeholder-image.jpg';";

  return `
    <div class="location-card">
      <div class="card-header">
        <span class="location-name">${wisata.nama}</span>
        <button class="delete-btn" data-wisata-id="${wisata.no}" title="Hapus dari Wishlist">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      <img src="${imageUrl}" alt="Gambar ${wisata.nama}" class="card-image" onerror="${imageOnError}">
      <div class="card-footer">
        <button class="view-more-btn" data-wisata-object='${JSON.stringify(wisata)}'>View More</button>
      </div>
    </div>
  `;
}

// Fungsi utama untuk memuat wishlist
async function loadWishlist() {
  const userId = getUserId();
  if (!userId) {
    wishlistContainer.innerHTML = '<div class="empty-state"><h3>Anda harus login</h3><p>Silakan login untuk melihat wishlist Anda.</p></div>';
    return;
  }

  wishlistContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const wishlistResponse = await fetch(`${BASE_URL}/wishlist/${userId}`);
    const wishlistItems = await wishlistResponse.json();

    if (wishlistItems.length === 0) {
      wishlistContainer.innerHTML = `
        <div class="empty-state">
          <h3>Wishlist Anda Kosong</h3>
          <p>Sepertinya Anda belum menambahkan destinasi impian. Mari mulai jelajahi!</p>
        </div>
      `;
      return;
    }

    const datasetResponse = await fetch('../data/dataset_jogja_with_vectors_fixed_v2.json');
    const allWisataData = await datasetResponse.json();

    const fullWisataDetails = wishlistItems.map(item => {
      return allWisataData.find(wisata => wisata.no === item.wisata_id);
    }).filter(item => item !== undefined);

    if (fullWisataDetails.length === 0) {
      throw new Error("Data wisata untuk item di wishlist tidak ditemukan.");
    }

    wishlistContainer.innerHTML = fullWisataDetails.map(createWishlistCard).join('');
  } catch (err) {
    console.error('Gagal memuat wishlist:', err);
    wishlistContainer.innerHTML = '<div class="empty-state"><h3>Terjadi Kesalahan</h3><p>Tidak dapat memuat wishlist Anda saat ini.</p></div>';
  }
}

// Fungsi hapus dari wishlist
async function removeFromWishlist(userId, wisataId) {
  if (!confirm('Apakah Anda yakin ingin menghapus item ini dari wishlist?')) {
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/wishlist/${userId}/${wisataId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (response.ok) {
      alert(result.message || 'Item berhasil dihapus dari wishlist.');
      loadWishlist();
    } else {
      throw new Error(result.message || 'Gagal menghapus item.');
    }
  } catch (err) {
    console.error('Gagal menghapus dari wishlist:', err);
    alert('Gagal menghapus dari wishlist. Silakan coba lagi.');
  }
}

// Fungsi Logout
function logout() {
  const userConfirmed = confirm("Apakah Anda yakin ingin logout?");
  if (userConfirmed) {
    localStorage.removeItem('tripTaktikCurrentUser');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('selectedWisata');
    alert("Anda telah berhasil logout.");
    window.location.href = "../index.html";
  }
}

// --- PENGELOLAAN EVENT LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
  loadWishlist();

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  if (hamburgerBtn && mainNav) {
    const toggleMenu = () => {
      mainNav.classList.toggle('active');
      hamburgerBtn.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      hamburgerBtn.setAttribute('aria-expanded', isExpanded);
    };
    hamburgerBtn.addEventListener('click', toggleMenu);
  }

  const logoutButtons = document.querySelectorAll('.logout');
  if (logoutButtons.length > 0) {
    logoutButtons.forEach(button => {
      button.addEventListener('click', logout);
    });
  }

  if (wishlistContainer) {
    wishlistContainer.addEventListener('click', (event) => {
      const target = event.target;

      const deleteButton = target.closest('.delete-btn');
      if (deleteButton) {
        const wisataId = deleteButton.dataset.wisataId;
        const userId = getUserId();
        if (userId && wisataId) {
          removeFromWishlist(userId, parseInt(wisataId));
        }
      }

      const viewMoreButton = target.closest('.view-more-btn');
      if (viewMoreButton) {
        const wisataDataString = viewMoreButton.dataset.wisataObject;
        if (wisataDataString) {
          try {
            const wisataData = JSON.parse(wisataDataString);
            handleViewMore(wisataData);
          } catch (e) {
            console.error("Gagal mem-parsing data wisata:", e);
          }
        }
      }
    });
  }
});