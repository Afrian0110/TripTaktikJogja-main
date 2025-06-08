const list = document.getElementById('recommendationList');
let wisataData = [];

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
    if (val === 1) return key;
  }

  return "Lainnya";
}

//<img src="${w.image}" alt="${w.nama}" onerror="this.src='https://via.placeholder.com/180x120';"></img>//

function renderWisata(data) {
  list.innerHTML = '';
  data.forEach(w => {
    const rating = parseFloat(w.vote_average).toFixed(1);
    const item = document.createElement('div');
    item.className = "card-wisata";
    const type = getType(w);

    item.innerHTML = `
      <img src="https://via.placeholder.com/180x120" alt="${w.image}">
      <div class="info-wisata">
        <div>
          <div class="info-header">
            <h3>${w.nama}</h3>
            <i class="fa-regular fa-bookmark"></i>
          </div>
          <p class="rating">
            <span class="star">⭐</span> ${rating}
            <span class="kategori">${type}</span>
          </p>
          <p class="deskripsi">${w.description_clean || '-'}</p>
          <button class="btn-detail">View More</button>
        </div>
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

// Load JSON file
fetch('../data/dataset_jogja_with_vectors_fixed.json')
  .then(res => res.json())
  .then(data => {
    wisataData = data;
    renderWisata(wisataData);
  })
  .catch(err => {
    console.error('Gagal memuat data wisata:', err);
  });