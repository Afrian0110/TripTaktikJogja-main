class HomeSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../pages/auth.html';
        this.apiUrl = 'http://localhost:3000/api';
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
        this.fetchAllWisata(); // ✅ Ambil data dari backend
    }

    async fetchAllWisata() {
        try {
            const response = await fetch(`${this.apiUrl}/wisata`);
            const data = await response.json();

            if (Array.isArray(data)) {
                this.renderWisataList(data);
            } else {
                this.showNotification('Data wisata kosong atau format salah.', 'warning');
            }
        } catch (err) {
            console.error('Error fetching wisata:', err);
            this.showNotification('Gagal memuat data wisata', 'error');
        }
    }

    renderWisataList(wisataList) {
        const container = document.querySelector('.recommendations .card-container');
        if (!container) return;

        container.innerHTML = '';

        wisataList.forEach(wisata => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <h3>${wisata.name}</h3>
                <p>${wisata.description}</p>
                <div class="location"><span>${wisata.location || 'Yogyakarta'}</span></div>
                <button class="view-more">Lihat Detail</button>
                <button class="bookmark-btn"><i class="far fa-bookmark"></i></button>
            `;

            container.appendChild(card);
        });

        // Re-bind bookmark/view-more buttons setelah render
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
            case 'Trip Tips': this.showNotification('Trip Tips coming soon!', 'info'); break;
            case 'Rekomendasi': this.scrollToSection('.recommendations'); break;
            case 'About': this.scrollToSection('.stats'); break;
            case 'Wishlist': this.showWishlist(); break;
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
                const location = card.querySelector('.location span').textContent;
                this.showPlaceDetail(title, location);
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

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    window.homeSystem = new HomeSystem();
});

// Shortcut dan deteksi user balik dari tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const user = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
        if (!user) window.location.href = '../pages/auth.html';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'l') logout();
    if (e.key === 'Escape') window.scrollTo({ top: 0, behavior: 'smooth' });
});

function logout() {
    if (window.homeSystem) {
        window.homeSystem.logout();
    }
}

console.log('🏠 Trip.Taktik HomeSystem with Backend Integration Loaded');
