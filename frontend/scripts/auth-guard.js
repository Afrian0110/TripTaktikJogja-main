// scripts/auth-guard.js
(function () {
    const user = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
    const isLoginPage = window.location.pathname.includes('auth.html');

    if (!user && !isLoginPage) {
        window.location.href = 'auth.html';
    }

    if (user && isLoginPage) {
        window.location.href = 'home.html';
    }
})();
