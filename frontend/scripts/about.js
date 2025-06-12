class AboutSPA {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
    this.authPageUrl = '../pages/auth.html';
    this.init();
  }

  init() {
    if (!this.currentUser) {
      this.redirectToAuth();
      return;
    }
    this.bindEvents();
    this.initializeAnimations();
    this.showWelcomeMessage();
  }

  bindEvents() {

    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.logo')) {
          e.preventDefault();
        }
      }
    });

    document.querySelector('.language-selector')?.addEventListener('click', () => {
      this.showNotification('Pilihan bahasa akan segera hadir!', 'info');
    });

    this.initializeScrollAnimations();
  }

  initializeAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    const animatedElements = document.querySelectorAll(
      '.feature-card, .team-card, .about-content, .about-image, .why-choose-us h2, .why-choose-us p, .team-section h2, .team-section p'
    );
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });
  }

  initializeScrollAnimations() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const isMenuOpen = document.querySelector('.main-nav.active'); // Diubah ke selector baru
      if (isMenuOpen) {
        header.style.transform = 'translateY(0)';
        return;
      }
      if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
  }

  showWelcomeMessage() {
    if (this.currentUser && (this.currentUser.username || this.currentUser.email)) {
      const displayName = this.currentUser.username || this.currentUser.email;
      setTimeout(() => {
        this.showNotification(`Selamat datang di Halaman About, ${displayName}!`, 'success');
      }, 1000);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  }

  redirectToAuth() {
    this.showLoading();
    window.location.href = this.authPageUrl;
  }
}

function navigateToHome() {
  if (aboutApp) aboutApp.showLoading();
  setTimeout(() => {
    window.location.href = aboutApp ? aboutApp.homePageUrl : '../pages/home.html';
  }, 300);
}
function navigateToRecommendations() {
  if (aboutApp) aboutApp.showLoading();
  setTimeout(() => {
    window.location.href = aboutApp ? aboutApp.rekomendasiPageUrl : '../pages/rekomendasi.html';
  }, 300);
}
function navigateToWishlist() {
  if (aboutApp) aboutApp.showLoading();
  setTimeout(() => {
    window.location.href = aboutApp ? aboutApp.wishlistPageUrl : '../pages/wishlist.html';
  }, 300);
}
function showUserProfile() {
  if (aboutApp) aboutApp.showLoading();
  setTimeout(() => {
    window.location.href = aboutApp ? aboutApp.profilePageUrl : '../pages/profile.html';
  }, 300);
}

function logout() {
  const confirmed = confirm('Apakah Anda yakin ingin keluar?');
  if (confirmed) {
    if (aboutApp) aboutApp.showLoading();
    localStorage.removeItem('tripTaktikCurrentUser');

    if (aboutApp) {
      aboutApp.showNotification('Berhasil keluar!', 'success');
    } else {
      alert('Berhasil keluar!');
    }

    setTimeout(() => {
      window.location.href = aboutApp ? aboutApp.authPageUrl : '../pages/auth.html';
    }, 1000);
  }
}


let aboutApp;

document.addEventListener('DOMContentLoaded', () => {
  aboutApp = new AboutSPA();
  if (aboutApp) aboutApp.hideLoading();

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
});

window.addEventListener('pageshow', (event) => {
  if (aboutApp) aboutApp.hideLoading();
});
window.addEventListener('popstate', (e) => {
  console.log('Status navigasi berubah (popstate)');
});
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'h') {
    e.preventDefault();
    navigateToHome();
  }
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    logout();
  }
  if (e.key === 'Escape') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

console.log('🎯 Trip.Taktik Halaman About Dimuat');