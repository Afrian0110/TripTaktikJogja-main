// Variabel global untuk menyimpan semua data wisata
let wisataData = [];

/**
 * Menentukan tipe utama wisata dari sebuah objek data.
 * @param {object} w - Objek data satu tempat wisata.
 * @returns {string} - Nama tipe wisata (misal: "Alam", "Kuliner").
 */
function getType(w) {
  const typeMap = {
    "Agrowisata": w.type_clean_Agrowisata,
    "Alam": w.type_clean_Alam,
    "Buatan": w.type_clean_Buatan,
    "Budaya Dan Sejarah": w.type_clean_BudayaDanSejarah || w.type_clean_Budaya_Dan_Sejarah,
    "Kuliner": w.type_clean_Kuliner,
    "Museum": w.type_clean_Museum,
    "Pantai": w.type_clean_Pantai,
    "Pendidikan": w.type_clean_Pendidikan,
    "Religi": w.type_clean_Religi,
    "Seni": w.type_clean_Seni,
  };

  for (const [key, val] of Object.entries(typeMap)) {
    if (val === 1) {
      return key;
    }
  }

  return "Lainnya";
}

/**
 * Merender daftar kartu wisata ke dalam DOM berdasarkan data yang diberikan.
 * @param {Array<object>} data - Array berisi objek-objek data wisata.
 */
function renderWisata(data) {
  const list = document.getElementById('recommendationList');
  if (!list) return;

  list.innerHTML = '';

  data.forEach(w => {
    const rating = parseFloat(w.vote_average).toFixed(1);
    const type = getType(w);
    const item = document.createElement('div');
    item.className = "card-wisata";

    item.innerHTML = `
      <img src="${w.image}" alt="${w.nama}" onerror="this.src='https://placehold.co/250x200/475d57/FFFFFF?text=Trip.Taktik';">
      <div class="info-wisata">
        <div>
          <div class="info-header">
            <h3>${w.nama}</h3>
          </div>
          <p class="rating">
            <span class="star">⭐</span> ${rating}
            <span class="kategori">${type}</span>
          </p>
          <p class="deskripsi">${w.description_clean || '-'}</p>
        </div>
        <button class="btn-detail">View More</button>
      </div>
    `;

    const btn = item.querySelector('.btn-detail');
    btn.addEventListener('click', () => {
      localStorage.setItem('selectedWisata', JSON.stringify(w));
      window.location.href = '../pages/detail-page.html';
    });

    list.appendChild(item);
  });
}

/**
 * Memfilter data wisata berdasarkan pilihan tipe dan rating dari pengguna.
 */
function filterWisata() {
  const filterType = document.getElementById('filterType').value;
  const filterRating = document.getElementById('filterRating').value;

  let filtered = wisataData;

  if (filterType) {
    filtered = filtered.filter(w => getType(w) === filterType);
  }

  if (filterRating) {
    const minRating = parseFloat(filterRating);
    filtered = filtered.filter(w => parseFloat(w.vote_average) >= minRating);
  }

  renderWisata(filtered);
}


// MENJALANKAN SEMUA FUNGSI SETELAH HALAMAN HTML SELESAI DIMUAT
document.addEventListener('DOMContentLoaded', () => {

  // --- LOGIKA UNTUK MEMUAT DATA REKOMENDASI ---
  const list = document.getElementById('recommendationList');
  fetch('../data/dataset_jogja_with_vectors_fixed_v2.json')
    .then(res => res.json())
    .then(data => {
      wisataData = data;
      renderWisata(wisataData);
    })
    .catch(err => {
      console.error('Gagal memuat data wisata:', err);
      if (list) {
        list.innerHTML = '<p>Gagal memuat data. Silakan coba lagi nanti.</p>';
      }
    });

  // --- LOGIKA UNTUK FUNGSI LOGOUT ---
  const logoutButtons = document.querySelectorAll('.logout');
  if (logoutButtons.length > 0) {
    logoutButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const isConfirmed = confirm('Apakah Anda yakin ingin keluar?');
        if (isConfirmed) {
          localStorage.removeItem('tripTaktikCurrentUser');
          alert('Anda telah berhasil logout.');
          window.location.href = '../pages/auth.html';
        }
      });
    });
  }

  // --- LOGIKA UNTUK NAVIGASI MOBILE (HAMBURGER MENU) ---
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
});