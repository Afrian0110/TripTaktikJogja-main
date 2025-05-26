// Home Page JavaScript
class HomeSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../pages/auth.html';
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!this.currentUser) {
            this.redirectToAuth();
            return;
        }

        this.bindEvents();
        this.initializeUserProfile();
        this.initializeTestimonialSlider();
        this.initializeBookmarks();
    }

    bindEvents() {
        // Logout functionality
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // User profile dropdown (optional)
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                this.toggleUserDropdown();
            });
        }

        // Navigation menu active state
        this.initializeNavigation();

        // Bookmark buttons
        this.initializeBookmarkButtons();

        // View More buttons
        this.initializeViewMoreButtons();

        // Like buttons in testimonials
        this.initializeLikeButtons();

        // Search functionality
        this.initializeSearch();

        // Language selector
        this.initializeLanguageSelector();
    }

    logout() {
        const confirmed = confirm('Apakah Anda yakin ingin logout?');
        
        if (confirmed) {
            // Clear user data from localStorage
            localStorage.removeItem('tripTaktikCurrentUser');
            
            // Show logout message
            this.showNotification('Berhasil logout. Sampai jumpa!', 'success');
            
            // Redirect to auth page after short delay
            setTimeout(() => {
                this.redirectToAuth();
            }, 1500);
        }
    }

    redirectToAuth() {
        window.location.href = this.authPageUrl;
    }

    initializeUserProfile() {
        if (this.currentUser) {
            // Update user profile display
            const userProfile = document.querySelector('.user-profile');
            if (userProfile) {
                // Add user name or email as tooltip
                userProfile.setAttribute('title', `Logged in as: ${this.currentUser.username || this.currentUser.email}`);
            }

            // You can add more user-specific initialization here
            console.log(`Welcome back, ${this.currentUser.username}!`);
        }
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.main-nav ul li a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav items
                document.querySelectorAll('.main-nav ul li').forEach(li => {
                    li.classList.remove('active');
                });
                
                // Add active class to clicked item
                link.parentElement.classList.add('active');
                
                // Handle navigation based on link text
                const linkText = link.textContent.trim();
                this.handleNavigation(linkText);
            });
        });
    }

    handleNavigation(section) {
        switch(section) {
            case 'Home':
                this.scrollToTop();
                break;
            case 'Trip Tips':
                this.showNotification('Trip Tips coming soon!', 'info');
                break;
            case 'Rekomendasi':
                this.scrollToSection('.recommendations');
                break;
            case 'About':
                this.scrollToSection('.stats');
                break;
            case 'Wishlist':
                this.showWishlist();
                break;
            default:
                console.log(`Navigation to ${section} not implemented yet`);
        }
    }

    initializeBookmarkButtons() {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
        
        bookmarkBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const icon = btn.querySelector('i');
                const card = btn.closest('.card');
                const cardTitle = card.querySelector('h3').textContent;
                
                if (icon.classList.contains('far')) {
                    // Add to bookmarks
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    this.addToBookmarks(cardTitle);
                    this.showNotification(`${cardTitle} ditambahkan ke bookmark`, 'success');
                } else {
                    // Remove from bookmarks
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
                const cardTitle = card.querySelector('h3').textContent;
                const location = card.querySelector('.location span').textContent;
                
                this.showPlaceDetail(cardTitle, location);
            });
        });
    }

    initializeLikeButtons() {
        const likeBtns = document.querySelectorAll('.like-btn');
        
        likeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const icon = btn.querySelector('i');
                const testimonialCard = btn.closest('.testimonial-card');
                const title = testimonialCard.querySelector('h3').textContent;
                
                if (icon.classList.contains('far')) {
                    // Like
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#ff4757';
                    this.showNotification(`Menyukai "${title}"`, 'success');
                } else {
                    // Unlike
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
            const cardWidth = 300; // Approximate card width + margin
            const visibleCards = 3; // Number of visible cards
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
        const translateX = -slideIndex * cardWidth;
        container.style.transform = `translateX(${translateX}px)`;
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

        // Add click handlers to filter dropdowns
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
        
        // Simulate search process
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
        bookmarks = bookmarks.filter(bookmark => bookmark !== placeName);
        localStorage.setItem('tripTaktikBookmarks', JSON.stringify(bookmarks));
    }

    showWishlist() {
        const bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
        
        if (bookmarks.length === 0) {
            this.showNotification('Wishlist Anda masih kosong. Tambahkan tempat favorit!', 'info');
        } else {
            const wishlistText = bookmarks.join(', ');
            this.showNotification(`Wishlist Anda: ${wishlistText}`, 'success');
        }
    }

    showPlaceDetail(placeName, location) {
        // Simulate showing place details
        const message = `Detail: ${placeName} di ${location}\n\nFitur detail tempat wisata akan segera hadir!`;
        alert(message);
    }

    scrollToSection(sectionSelector) {
        const section = document.querySelector(sectionSelector);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
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
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initializeBookmarks() {
        // Load existing bookmarks and update UI
        const bookmarks = JSON.parse(localStorage.getItem('tripTaktikBookmarks')) || [];
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const cardTitle = card.querySelector('h3').textContent;
            const bookmarkBtn = card.querySelector('.bookmark-btn i');
            
            if (bookmarks.includes(cardTitle)) {
                bookmarkBtn.classList.remove('far');
                bookmarkBtn.classList.add('fas');
            }
        });
    }

    // Method untuk update path auth page
    setAuthPageUrl(url) {
        this.authPageUrl = url;
    }
}

// Initialize Home System
document.addEventListener('DOMContentLoaded', () => {
    window.homeSystem = new HomeSystem();
});

// Handle page visibility change (when user comes back to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Check if user is still logged in when they return to the page
        const currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
        if (!currentUser && window.homeSystem) {
            window.homeSystem.redirectToAuth();
        }
    }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
    // Handle any navigation state if needed
    console.log('Navigation state changed');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + L for logout
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        if (window.homeSystem) {
            window.homeSystem.logout();
        }
    }
    
    // Escape key to scroll to top
    if (e.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Global functions for compatibility
function logout() {
    if (window.homeSystem) {
        window.homeSystem.logout();
    }
}

console.log('🏠 Trip.Taktik Home System Loaded');