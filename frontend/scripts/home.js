class HomeSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../pages/auth.html';
        this.apiUrl = 'https://triptaktikjogja-main-production.up.railway.app/api';
        this.init();
    }

init() {
    if (!this.currentUser || !this.currentUser.token) {
        this.redirectToAuth();
        return;
    }

    this.bindEvents();
    this.initializeUserProfile();
    this.initializeTestimonialSlider();
    this.initializeBookmarks();
    this.setupForYouFilter(); 
    this.fetchAllWisata();
}

    async fetchAllWisata() {
        try {
            const categoryInput = window.userCategory || 'sejarah';
            const minvote_averageInput = window.userMinvote_average || 5;

            const response = await fetch('../data/dataset_jogja_with_vectors_fixed.json');
            const data = await response.json();

            if (!Array.isArray(data)) {
                this.showNotification('Data wisata kosong atau format salah.', 'warning');
                return;
            }

            const filteredData = data.filter(item => {
                const vote_average = parseFloat(item.vote_average?.replace(',', '.') || '0');
                const type = (item.type || '').toLowerCase();
                const matchCategory = new RegExp(`\\b${categoryInput}\\b`, 'i').test(type);
                return matchCategory && vote_average >= minvote_averageInput;
            });

            const sortedData = filteredData.sort((a, b) => {
                const voteA = parseFloat(a.vote_average?.replace(',', '.') || '0');
                const voteB = parseFloat(b.vote_average?.replace(',', '.') || '0');
                return voteB - voteA;
            });

            const topRecommended = sortedData.slice(0, 3);

            this.renderWisataList(topRecommended);
        } 
        catch (err) {
            console.error('Gagal memuat rekomendasi:', err);
            this.showNotification('Gagal memuat rekomendasi wisata', 'error');
        }
    }

    setupForYouFilter() {
        const form = document.getElementById('foryou-filter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('foryou-type').value;
            const rating = parseFloat(document.getElementById('foryou-rating').value);

            try {
                const response = await fetch('../data/dataset_jogja_with_vectors_fixed.json');
                const data = await response.json();

                const typeKey = `type_clean_${type}`.replace(/ /g, '_');
                const filtered = data.filter(item => {
                    const itemRating = parseFloat(item.vote_average);
                    return item[typeKey] === 1 && itemRating >= rating;
                });

                const sorted = filtered
                    .sort((a, b) => b.vote_average - a.vote_average)
                    .slice(0, 3);

                this.renderWisataForYou(sorted);
            } 
            catch (err) {
                console.error('Gagal filter For You:', err);
                this.showNotification('Gagal memuat rekomendasi For You', 'error');
            }
        });
    }

    renderWisataForYou(wisataList) {
        const container = document.getElementById('foryou-container');
        if (!container) return;

        container.innerHTML = '';
        wisataList.forEach((wisata, index) => {
            const vote_average = wisata.vote_average.toFixed(1);
            const filledStars = Math.floor(wisata.vote_average);
            const emptyStars = 5 - filledStars;
            const imageSrc = `../assets/images/jalan${index + 5}.jpg`;
            const imageAlt = wisata.nama;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-image">
                    <img src="${imageSrc}" alt="${imageAlt}">
                    <button class="bookmark-btn"><i class="far fa-bookmark"></i></button>
                </div>
                <div class="card-content">
                    <h3>${wisata.nama}</h3>
                    <div class="vote_average">
                        <span class="vote_average-number">${vote_average}</span>
                        <div class="stars">
                            ${'<i class="fas fa-star"></i>'.repeat(filledStars)}
                            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
                        </div>
                    </div>
                    <div class="location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${wisata.type || 'Yogyakarta'}</span>
                    </div>
                    <button class="view-more">View More</button>
                </div>`;
            container.appendChild(card);
        });

        this.initializeBookmarkButtons();
        this.initializeViewMoreButtons();
    }

    bindEvents() {
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', () => this.toggleUserDropdown());
        }

        this.initializeNavigation();
        this.initializeBookmarkButtons();
        this.initializeViewMoreButtons();
        this.initializeLikeButtons();
        this.initializeSearch();
        this.initializeLanguageSelector();
    }

    logout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.removeItem('tripTaktikCurrentUser');
            this.showNotification('Berhasil logout. Sampai jumpa!', 'success');
            setTimeout(() => this.redirectToAuth(), 1500);
        }
    }

    redirectToAuth() {
        window.location.href = this.authPageUrl;
    }

    initializeUserProfile() {
        if (this.currentUser) {
            const userProfile = document.querySelector('.user-profile');
            if (userProfile) {
                userProfile.setAttribute('title', `Logged in as: ${this.currentUser.name || this.currentUser.email}`);
            }
            console.log(`Welcome back, ${this.currentUser.name || this.currentUser.email}!`);
        }
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.main-nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.main-nav ul li').forEach(li => li.classList.remove('active'));
                link.parentElement.classList.add('active');
                this.handleNavigation(link.textContent.trim());
            });
        });
    }

    handleNavigation(section) {
        switch (section) {
            case 'Home': this.scrollToTop(); break;
            case 'triptips': window.location.href = 'triptips.html'; break;
            case 'Rekomendasi': window.location.href = 'rekomendasi.html'; break;
            case 'About': window.location.href = 'about.html'; break;
            case 'Wishlist': window.location.href = 'wishlist.html'; break;
            default: console.log(`Navigation to ${section} not implemented yet`);
        }
    }

    initializeBookmarkButtons() {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn');

        bookmarkBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            const card = btn.closest('.card');
            const cardTitle = card.querySelector('h3').textContent;

            const bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
            if (bookmarks.includes(cardTitle)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    this.addToBookmarks(cardTitle);
                    this.showNotification(`${cardTitle} ditambahkan ke bookmark`, 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    this.removeFromBookmarks(cardTitle);
                    this.showNotification(`${cardTitle} dihapus dari bookmark`, 'info');
                }
            });
        });
    }

initializeViewMoreButtons() {
    const viewMoreBtns = document.querySelectorAll('.view-more');
    viewMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.card');
            const title = card.querySelector('h3').textContent;

            // Ambil data dari dataset asli
            fetch('../data/dataset_jogja_with_vectors_fixed.json')
                .then(res => res.json())
                .then(data => {
                    const selected = data.find(item => item.nama === title);
                    if (selected) {
                        localStorage.setItem('selectedWisata', JSON.stringify(selected));
                        window.location.href = `../pages/detail-page.html`;
                    } else {
                        alert('Data detail tidak ditemukan!');
                    }
                })
                .catch(err => {
                    console.error('Gagal menyimpan detail:', err);
                });
        });
    });
}

    initializeLikeButtons() {
        const likeBtns = document.querySelectorAll('.like-btn');
        likeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const icon = btn.querySelector('i');
                const testimonialCard = btn.closest('.testimonial-card');
                const title = testimonialCard.querySelector('h3').textContent;

                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#ff4757';
                    this.showNotification(`Menyukai "${title}"`, 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '';
                    this.showNotification(`Batal menyukai "${title}"`, 'info');
                }
            });
        });
    }

    initializeTestimonialSlider() {
        const prevBtn = document.querySelector('.testimonial-slider .prev');
        const nextBtn = document.querySelector('.testimonial-slider .next');
        const testimonialCards = document.querySelector('.testimonial-cards');

        if (prevBtn && nextBtn && testimonialCards) {
            let currentSlide = 0;
            const cardWidth = 300;
            const visibleCards = 3;
            const totalCards = document.querySelectorAll('.testimonial-card').length;
            const maxSlide = Math.max(0, totalCards - visibleCards);

            prevBtn.addEventListener('click', () => {
                if (currentSlide > 0) {
                    currentSlide--;
                    this.updateSliderPosition(testimonialCards, currentSlide, cardWidth);
                }
            });

            nextBtn.addEventListener('click', () => {
                if (currentSlide < maxSlide) {
                    currentSlide++;
                    this.updateSliderPosition(testimonialCards, currentSlide, cardWidth);
                }
            });
        }
    }

    updateSliderPosition(container, slideIndex, cardWidth) {
        container.style.transform = `translateX(${-slideIndex * cardWidth}px)`;
    }

    initializeSearch() {
        const searchBtn = document.querySelector('.search-btn');
        const filters = document.querySelectorAll('.filter');

        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                this.showNotification('Filter options coming soon!', 'info');
            });
        });
    }

    initializeLanguageSelector() {
        const languageSelector = document.querySelector('.language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('click', () => {
                this.showNotification('Language options coming soon!', 'info');
            });
        }
    }

    handleSearch() {
        this.showNotification('Searching for your perfect trip...', 'info');
        setTimeout(() => {
            this.scrollToSection('.recommendations');
            this.showNotification('Found some great recommendations for you!', 'success');
        }, 1500);
    }

    addToBookmarks(placeName) {
        let bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
        if (!bookmarks.includes(placeName)) {
            bookmarks.push(placeName);
            localStorage.setItem('tripTaktikBookmarks', JSON.stringify(bookmarks));
        }
    }

    removeFromBookmarks(placeName) {
        let bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
        bookmarks = bookmarks.filter(b => b !== placeName);
        localStorage.setItem('tripTaktikBookmarks', JSON.stringify(bookmarks));
    }

    showWishlist() {
        const bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
        if (bookmarks.length === 0) {
            this.showNotification('Wishlist Anda masih kosong. Tambahkan tempat favorit!', 'info');
        } else {
            const list = bookmarks.join(', ');
            this.showNotification(`Wishlist Anda: ${list}`, 'success');
        }
    }

    showPlaceDetail(name, location) {
        alert(`Detail: ${name} di ${location}\n\nFitur detail wisata akan segera hadir!`);
    }

    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '9999',
            maxWidth: '300px',
            wordWrap: 'break-word',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out'
        });

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    initializeBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent;
            const icon = card.querySelector('.bookmark-btn i');
            if (bookmarks.includes(title)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        });
    }

    setAuthPageUrl(url) {
        this.authPageUrl = url;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.homeSystem = new HomeSystem();
});

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'l') {
        if (window.homeSystem) window.homeSystem.logout();
    }
    if (e.key === 'Escape') window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const user = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
        if (!user) window.location.href = '../pages/auth.html';
    }
});

async function loadStats() {
    const response = await fetch('../data/data_wisata.json');
    const data = await response.json();

    document.getElementById('total-wisata').textContent = `${data.length}+`;
    document.getElementById('jenis-wisata').textContent = [...new Set(data.map(d => d.type))].length;
    document.getElementById('wisata-alam').textContent = data.filter(d => d.type.toLowerCase().includes('alam')).length;
    document.getElementById('wisata-sejarah').textContent = data.filter(d => d.type.toLowerCase().includes('sejarah')).length;
}

function toggleForm() {
  const form = document.getElementById('feedback-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

document.getElementById('toggle-btn').addEventListener('click', toggleForm);
document.getElementById('feedback-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const file = form.image.files[0];
  const title = form.title.value;
  const description = form.description.value;
  const location = form.location.value;

  if (!file) return alert("Pilih gambar terlebih dahulu!");

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'feedback');

  try {
    // Upload ke Cloudinary
    const res = await fetch('https://api.cloudinary.com/v1_1/dfciqrwpe/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    const imageUrl = data.secure_url;

    // Kirim ke backend kamu
    const response = await fetch('https://triptaktikjogja-main-production.up.railway.app/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        location,
        imageUrl,
      }),
    });

    const result = await response.json();
    alert("Feedback berhasil dikirim!");

    form.reset();
    form.style.display = 'none';
    loadTestimonials(); // reload slider
  } catch (error) {
    console.error('Upload failed:', error);
    alert("Terjadi kesalahan saat mengirim feedback");
  }
});

async function loadTestimonials() {
  const container = document.querySelector('.testimonial-slider');

  try {
    const res = await fetch('https://triptaktikjogja-main-production.up.railway.app/api/feedback');
    const feedbacks = await res.json();

    // Hapus semua (kecuali tombol navigasi)
    container.querySelectorAll('.testimonial-card').forEach(e => e.remove());

    feedbacks.forEach(feedback => {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `
        <img src="${feedback.imageUrl}" alt="${feedback.title}" />
        <h3>${feedback.title}</h3>
        <p>${feedback.description}</p>
        <small>📍 ${feedback.location}</small>
      `;
      container.insertBefore(card, container.querySelector('.next')); // insert sebelum tombol next
    });

  } catch (error) {
    console.error("Gagal load feedback:", error);
  }
}

// Panggil saat halaman dimuat
window.addEventListener('DOMContentLoaded', loadTestimonials);


loadStats();

console.log('🏠 Trip.Taktik HomeSystem with Backend Integration Loaded');
