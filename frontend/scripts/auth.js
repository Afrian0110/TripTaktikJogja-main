// Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('tripTaktikUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.homePageUrl = '../pages/home.html';
        this.init();
    }

    init() {
        if (this.currentUser) {
            this.redirectToHome();
        } else {
            this.showLogin();
        }
        this.bindEvents();
    }

    bindEvents() {
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register Form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginBtn');
        const alertDiv = document.getElementById('loginAlert');

        if (!email || !password) {
            this.showAlert('loginAlert', 'Harap isi semua field', 'error');
            return;
        }

        // Add loading state
        loginBtn.classList.add('btn-loading');
        loginBtn.textContent = 'Signing In';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = {
                id: user.id,
                email: user.email,
                username: user.username,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('tripTaktikCurrentUser', JSON.stringify(this.currentUser));
            
            // Redirect to home page file instead of showing home element
            this.redirectToHome();
        } else {
            this.showAlert('loginAlert', 'Email atau password salah', 'error');
        }

        // Remove loading state
        loginBtn.classList.remove('btn-loading');
        loginBtn.textContent = 'Log In';
    }

    async handleRegister() {
        const email = document.getElementById('registerEmail').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const registerBtn = document.getElementById('registerBtn');

        if (!email || !username || !password) {
            this.showAlert('registerAlert', 'Harap isi semua field', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('registerAlert', 'Format email tidak valid', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAlert('registerAlert', 'Password minimal 6 karakter', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showAlert('registerAlert', 'Email sudah terdaftar', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showAlert('registerAlert', 'Username sudah digunakan', 'error');
            return;
        }

        // Add loading state
        registerBtn.classList.add('btn-loading');
        registerBtn.textContent = 'Creating Account';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newUser = {
            id: Date.now().toString(),
            email,
            username,
            password,
            registeredAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('tripTaktikUsers', JSON.stringify(this.users));

        this.showAlert('registerSuccess', 'Akun berhasil dibuat! Silakan login.', 'success');
        
        // Clear form
        document.getElementById('registerForm').reset();
        
        // Auto redirect to login after 2 seconds
        setTimeout(() => {
            this.showLogin();
        }, 2000);

        // Remove loading state
        registerBtn.classList.remove('btn-loading');
        registerBtn.textContent = 'Register';
    }

    // Method untuk redirect ke halaman home
    redirectToHome() {
        window.location.href = this.homePageUrl;
    }

    showLogin() {
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');
        
        if (loginPage) loginPage.style.display = 'flex';
        if (registerPage) registerPage.style.display = 'none';
        
        this.clearAlerts();
    }

    showRegister() {
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');
        
        if (loginPage) loginPage.style.display = 'none';
        if (registerPage) registerPage.style.display = 'flex';
        
        this.clearAlerts();
    }

    showHome() {
        // Jika masih ada elemen home di halaman yang sama, sembunyikan
        const homePage = document.getElementById('homePage');
        if (homePage) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('registerPage').style.display = 'none';
            homePage.style.display = 'flex';
            
            if (this.currentUser) {
                const welcomeMessage = document.getElementById('welcomeMessage');
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `
                        Halo <strong>${this.currentUser.username}</strong>! 
                        Selamat datang kembali di platform perjalanan terbaik! 
                        Temukan destinasi impian Anda, rencanakan perjalanan yang tak terlupakan, 
                        dan bagikan pengalaman bersama komunitas traveler lainnya.
                    `;
                }
            }
        } else {
            // Jika tidak ada elemen home, redirect ke file
            this.redirectToHome();
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('tripTaktikCurrentUser');
        
        // Redirect ke halaman login
        window.location.href = 'pages/auth.html';
    }

    showAlert(alertId, message, type) {
        const alertDiv = document.getElementById(alertId);
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert alert-${type}`;
            alertDiv.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 5000);
        }
    }

    clearAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.style.display = 'none';
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Method untuk update path home page
    setHomePageUrl(url) {
        this.homePageUrl = url;
    }
}

// Global Functions
function showLogin() {
    window.authSystem.showLogin();
}

function showRegister() {
    window.authSystem.showRegister();
}

function logout() {
    window.authSystem.logout();
}

// Initialize App
window.authSystem = new AuthSystem();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        const activeForm = document.querySelector('form:not([style*="display: none"]) form, #loginPage:not([style*="display: none"]) form, #registerPage:not([style*="display: none"]) form');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    // Handle navigation state if needed
});

console.log('🚀 Trip.Taktik Authentication System Loaded');