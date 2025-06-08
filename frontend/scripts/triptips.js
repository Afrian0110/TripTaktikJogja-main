let model;
let wisataData = [];

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

// Load model dan data wisata
async function loadModelAndData() {
  model = await tf.loadGraphModel('../model/model.json');
  wisataData = await fetch('../data/dataset_jogja_with_vectors_fixed.json').then(res => res.json());
}

// Encode input gaya ke dalam vektor
function encodeInput(tipe, gaya) {
  const vec = new Array(100).fill(0);
  if (gayaMap[gaya.toLowerCase()] !== undefined) {
    vec[gayaMap[gaya.toLowerCase()]] = 1;
  }
  return vec;
}

// Gunakan model.predict untuk memberi skor rekomendasi
async function getTopRecommendations(inputVec, durasi, tipe, gaya) {
  const inputTensor = tf.tensor2d([inputVec]);
  const tipeField = tipeToFieldMap[tipe.toLowerCase()];
  const keywords = gayaKeywordsMap[gaya.toLowerCase()] || [];

  // Step 1: Filter berdasarkan tipe
  let filteredData = wisataData.filter(item => item[tipeField] === 1);

  // Step 2: Tambahan filter berdasarkan gaya pada deskripsi
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

  // Step 3: Skoring dari model
  const scores = await Promise.all(
    filteredData.map(async (item, index) => {
      const itemTensor = tf.tensor2d([item.vector]);
      const prediction = model.predict({
        'inputs:0': inputTensor,
        'inputs_1:0': itemTensor
      });
      const score = (await prediction.data())[0];
      tf.dispose([itemTensor, prediction]);
      return { index, score };
    })
  );

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, durasi * 3).map(({ index }) => filteredData[index]);
}

// Tampilkan rekomendasi ke halaman
function renderRecommendations(recos, durasi) {
  const container = document.getElementById('trip-container');
  container.innerHTML = '';
  for (let d = 0; d < durasi; d++) {
    const title = document.createElement('h3');
    title.className = 'day-title';
    title.textContent = `Day ${d + 1}`;
    const tripRow = document.createElement('div');
    tripRow.className = 'trip-day';

    for (let i = 0; i < 3; i++) {
      const reco = recos[d * 3 + i];
      if (!reco) continue;

      const image = reco.image || `https://source.unsplash.com/240x140/?${reco.nama.replace(/\s+/g, '+')}`;
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
      button.textContent = 'View More';
      button.className = 'btn-detail'; // opsional, untuk styling atau querySelector
      button.addEventListener('click', () => {
        localStorage.setItem('selectedWisata', JSON.stringify(reco));
        window.location.href = '../pages/detail-page.html';  // Sesuaikan path jika perlu
      });

      card.querySelector('.card-content').appendChild(button);
      tripRow.appendChild(card);
    }

    container.appendChild(title);
    container.appendChild(tripRow);
  }
}




// Handle form submit
loadModelAndData().then(() => {
  document.getElementById('trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const gaya = document.getElementById('gaya').value;
    const tipe = document.getElementById('tipe').value;
    const durasi = parseInt(document.getElementById('durasi').value);

    const inputVec = encodeInput(tipe, gaya);
    const recos = await getTopRecommendations(inputVec, durasi, tipe, gaya);

    document.getElementById('input-section').style.display = 'none';
    document.getElementById('recommendation-section').style.display = 'block';
    renderRecommendations(recos, durasi);
  });
});
