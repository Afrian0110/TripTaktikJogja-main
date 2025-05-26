import { login, register } from './api.js';

class AuthSystem {
    constructor() {
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
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

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

        if (!email || !password) {
            this.showAlert('loginAlert', 'Harap isi semua field', 'error');
            return;
        }

        loginBtn.classList.add('btn-loading');
        loginBtn.textContent = 'Signing In';

        try {
            const result = await login(email, password);

            if (result.token) {
                this.currentUser = {
                    email: result.user.email,
                    name: result.user.name,
                    token: result.token,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('tripTaktikCurrentUser', JSON.stringify(this.currentUser));
                this.redirectToHome();
            } else {
                this.showAlert('loginAlert', result.message || 'Login gagal', 'error');
            }
        } catch {
            this.showAlert('loginAlert', 'Terjadi kesalahan saat login', 'error');
        }

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

        registerBtn.classList.add('btn-loading');
        registerBtn.textContent = 'Creating Account';

        try {
            const result = await register(username, email, password);

            if (result.user) {
                this.showAlert('registerSuccess', 'Akun berhasil dibuat! Silakan login.', 'success');
                document.getElementById('registerForm').reset();
                setTimeout(() => this.showLogin(), 2000);
            } else {
                this.showAlert('registerAlert', result.message || 'Registrasi gagal', 'error');
            }
        } catch {
            this.showAlert('registerAlert', 'Terjadi kesalahan saat registrasi', 'error');
        }

        registerBtn.classList.remove('btn-loading');
        registerBtn.textContent = 'Register';
    }

    redirectToHome() {
        window.location.href = this.homePageUrl;
    }

    showLogin() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('registerPage').style.display = 'none';
        this.clearAlerts();
    }

    showRegister() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('registerPage').style.display = 'flex';
        this.clearAlerts();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('tripTaktikCurrentUser');
        window.location.href = 'auth.html';
    }

    showAlert(alertId, message, type) {
        const alertDiv = document.getElementById(alertId);
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert alert-${type}`;
            alertDiv.style.display = 'block';
            setTimeout(() => alertDiv.style.display = 'none', 5000);
        }
    }

    clearAlerts() {
        document.querySelectorAll('.alert').forEach(alert => {
            alert.style.display = 'none';
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    setHomePageUrl(url) {
        this.homePageUrl = url;
    }
}

// Inisialisasi sistem auth
const authSystem = new AuthSystem();
window.authSystem = authSystem;

// Event listener ganti halaman login/register
document.addEventListener('DOMContentLoaded', () => {
    const toRegisterLink = document.getElementById('linkToRegister');
    const toLoginLink = document.getElementById('linkToLogin');

    if (toRegisterLink) {
        toRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            authSystem.showRegister();
        });
    }

    if (toLoginLink) {
        toLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            authSystem.showLogin();
        });
    }

    // Shortcut Ctrl + Enter untuk submit form aktif
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            const activeForm = document.querySelector('form:not([style*="display: none"])');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
    });
});
