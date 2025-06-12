let model;
let wisataData = [];
let selectedTipe = 'alam';

const gayaMap = {
  santai: 0,
  petualang: 1,
  budaya: 2,
  keluarga: 3,
  nyaman: 4,
  instagramable: 5
};

const gayaKeywordsMap = {
  santai: ['sejuk', 'tenang', 'pemandangan', 'relaksasi'],
  petualang: ['trekking', 'panjat', 'menantang', 'jelajah', 'gunung'],
  budaya: ['sejarah', 'candi', 'museum', 'keraton', 'tradisional'],
  keluarga: ['anak', 'keluarga', 'kebun binatang', 'wahana', 'taman'],
  nyaman: ['nyaman', 'bersih', 'rapi', 'kafe', 'fasilitas'],
  instagramable: ['foto', 'spot', 'selfie', 'estetik', 'insta']
};

const tipeToFieldMap = {
  alam: 'type_clean_Alam',
  agrowisata: 'type_clean_Agrowisata',
  kuliner: 'type_clean_Kuliner',
  kota: 'type_clean_Buatan',
  pantai: 'type_clean_Pantai',
  pendidikan: 'type_clean_Pendidikan',
  religi: 'type_clean_Religi',
  sejarah: 'type_clean_Budaya_Dan_Sejarah'
};

async function loadModelAndData() {
  try {
    model = await tf.loadGraphModel('../model/model.json');
    wisataData = await fetch('../data/dataset_jogja_with_vectors_fixed_v2.json').then(res => res.json());
    console.log("Model and data loaded successfully.");
  } catch (error) {
    console.error("Failed to load model or data:", error);
  }
}

function encodeInput(tipe, gaya) {
  const vec = new Array(100).fill(0);
  const inputGaya = gaya.toLowerCase();
  for (const key in gayaMap) {
    if (inputGaya.includes(key)) {
      vec[gayaMap[key]] = 1;
    }
  }
  return vec;
}

async function getTopRecommendations(inputVec, durasi, tipe, gaya) {
  const inputTensor = tf.tensor2d([inputVec]);
  const tipeField = tipeToFieldMap[tipe.toLowerCase()];
  const gayaLower = gaya.toLowerCase();
  let keywords = [];
  for (const key in gayaKeywordsMap) {
    if (gayaLower.includes(key)) {
      keywords.push(...gayaKeywordsMap[key]);
    }
  }
  let filteredData = wisataData.filter(item => item[tipeField] === 1);
  if (keywords.length > 0) {
    filteredData = filteredData.filter(item => {
      const desc = (item.description_clean || '').toLowerCase();
      return keywords.some(keyword => desc.includes(keyword));
    });
  }
  if (filteredData.length === 0) {
    console.warn('Tidak ada wisata yang cocok dengan tipe dan gaya:', tipe, gaya);
    return [];
  }
  const scores = await Promise.all(
    filteredData.map(async (item) => {
      const itemTensor = tf.tensor2d([item.vector]);
      const prediction = model.predict({ 'inputs:0': inputTensor, 'inputs_1:0': itemTensor });
      const score = (await prediction.data())[0];
      tf.dispose([itemTensor, prediction]);
      return { item, score };
    })
  );
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, durasi * 3).map(({ item }) => item);
}

function renderRecommendations(recos, durasi) {
  const container = document.getElementById('trip-container');
  container.innerHTML = '';
  if (recos.length === 0) return;
  for (let d = 0; d < durasi; d++) {
    const title = document.createElement('h3');
    title.className = 'day-title';
    title.textContent = `Hari ${d + 1}`;
    const tripRow = document.createElement('div');
    tripRow.className = 'trip-day';
    for (let i = 0; i < 3; i++) {
      const reco = recos[d * 3 + i];
      if (!reco) continue;
      const image = reco.image || `https://source.unsplash.com/280x160/?${reco.nama.replace(/\s+/g, '+')}`;
      const rating = reco.rating || reco.vote_average || '4.5';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${image}" alt="${reco.nama}" />
        <div class="card-content">
          <h4>${reco.nama}</h4>
          <div class="rating">${rating} ⭐</div>
        </div>`;
      const button = document.createElement('button');
      button.textContent = 'Lihat Detail';
      button.className = 'btn-detail';
      button.addEventListener('click', () => {
        localStorage.setItem('selectedWisata', JSON.stringify(reco));
        window.location.href = '../pages/detail-page.html';
      });
      card.querySelector('.card-content').appendChild(button);
      tripRow.appendChild(card);
    }
    container.appendChild(title);
    container.appendChild(tripRow);
  }
}

// Fungsi dijalankan setelah DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadModelAndData();

  const tipeContainer = document.getElementById('tipe-container');
  const tripForm = document.getElementById('trip-form');
  const heroContainer = document.querySelector('.hero-container');
  const recommendationSection = document.getElementById('recommendation-section');
  const footer = document.querySelector('.footer');

  const defaultTipeButton = tipeContainer.querySelector('.tipe-btn[data-value="alam"]');
  if (defaultTipeButton) {
    defaultTipeButton.classList.add('active');
  }

  tipeContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tipe-btn')) {
      tipeContainer.querySelectorAll('.tipe-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      selectedTipe = e.target.dataset.value;
    }
  });

  tripForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gaya = document.getElementById('gaya').value;
    const durasiInput = document.getElementById('durasi');
    const durasi = parseInt(durasiInput.value, 10);
    if (!durasi || durasi < 1 || durasi > 10) {
      alert("Silakan masukkan durasi antara 1 hingga 10 hari.");
      return;
    }
    const submitButton = tripForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Mencari...';
    submitButton.disabled = true;
    const inputVec = encodeInput(selectedTipe, gaya);
    const recos = await getTopRecommendations(inputVec, durasi, selectedTipe, gaya);
    if (recos && recos.length > 0) {
      heroContainer.style.display = 'none';
      recommendationSection.style.display = 'block';
      if (footer) footer.style.display = 'block';
      document.body.style.paddingTop = '70px';
      window.scrollTo(0, 0);
      renderRecommendations(recos, durasi);
    } else {
      alert('Maaf, kami tidak menemukan rekomendasi yang cocok. Silakan coba dengan gaya atau tipe wisata yang lain.');
    }
    submitButton.textContent = "Let's Trip";
    submitButton.disabled = false;
  });

  // --- LOGIKA NAVIGASI STANDAR ---
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

  // --- LOGIKA LOGOUT STANDAR ---
  const logoutButtons = document.querySelectorAll('.logout');
  if (logoutButtons.length > 0) {
    logoutButtons.forEach(button => {
      button.addEventListener('click', () => {
        const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
        if (isConfirmed) {
          localStorage.removeItem('tripTaktikCurrentUser');
          sessionStorage.clear();
          alert('Anda telah berhasil logout.');
          window.location.href = '../pages/auth.html';
        }
      });
    });
  }
});