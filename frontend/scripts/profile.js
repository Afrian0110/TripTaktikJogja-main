// Menyimpan data SVG untuk avatar default agar constructor lebih bersih.
const DEFAULT_AVATAR = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e0e0e0"/><circle cx="50" cy="40" r="18" fill="%23b0b0b0"/><ellipse cx="50" cy="85" rx="30" ry="20" fill="%23b0b0b0"/></svg>';

class ProfilePage {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
    this.authPageUrl = '../pages/auth.html';
    this.homePageUrl = '../pages/home.html';

    // Data profil default, akan ditimpa oleh data dari localStorage jika ada.
    this.profileData = {
      name: 'Pengguna Baru',
      email: 'email@contoh.com',
      gender: '',
      birthdate: '',
      avatar: DEFAULT_AVATAR
    };

    this.init();
  }

  /**
   * Inisialisasi halaman profil.
   * Memeriksa status login sebelum memuat data dan event.
   */
  init() {
    // Jika tidak ada pengguna yang login, alihkan ke halaman otentikasi.
    if (!this.currentUser) {
      this.redirectToAuth();
      return;
    }

    this.loadProfileData();
    this.bindEvents();
    this.updateProfileDisplay();
    this.navigateToSection('edit-profile', document.querySelector('.profile-menu a.active'));
  }

  /**
   * Menghubungkan semua event listener yang diperlukan.
   */
  bindEvents() {
    document.getElementById('profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    document.getElementById('photoInput').addEventListener('change', (e) => {
      this.handlePhotoUpload(e);
    });

    document.querySelector('.language-selector')?.addEventListener('click', () => {
        this.showNotification('Pilihan bahasa akan segera hadir!', 'info');
    });
  }

  /**
   * Memuat data profil pengguna dari localStorage.
   */
  loadProfileData() {
    const storageKey = `tripTaktikUserProfile_${this.currentUser.name || this.currentUser.email}`;
    const storedData = JSON.parse(localStorage.getItem(storageKey));

    if (storedData) {
      // Gabungkan data tersimpan dengan data default untuk memastikan semua properti ada.
      this.profileData = { ...this.profileData, ...storedData };
    } else {
      // Jika data profil belum ada, gunakan data dari info login.
      this.profileData.name = this.currentUser.name || "Pengguna Baru";
      this.profileData.email = this.currentUser.email || "email@contoh.com";
    }

    // Mengisi nilai form dengan data yang sudah dimuat.
    document.getElementById('name').value = this.profileData.name;
    document.getElementById('email').value = this.profileData.email;
    document.getElementById('gender').value = this.profileData.gender;
    document.getElementById('birthdate').value = this.profileData.birthdate;
  }

  /**
   * Memperbarui elemen UI dengan data profil terbaru.
   */
  updateProfileDisplay() {
    document.getElementById('sidebarProfileName').textContent = this.profileData.name;
    document.getElementById('sidebarProfileEmail').textContent = this.profileData.email;

    const avatarElements = [
      document.getElementById('profileAvatarDisplay'),
      document.getElementById('profileAvatarFormDisplay')
    ];

    avatarElements.forEach(el => {
      if (el) {
        el.style.backgroundImage = `url(${this.profileData.avatar})`;
      }
    });
  }

  /**
   * Menyimpan perubahan data profil ke localStorage.
   */
  saveProfile() {
    this.profileData.name = document.getElementById('name').value;
    this.profileData.gender = document.getElementById('gender').value;
    this.profileData.birthdate = document.getElementById('birthdate').value;
    this.profileData.email = document.getElementById('email').value;

    if (!this.profileData.name || !this.profileData.email) {
      this.showNotification('Nama dan Email wajib diisi!', 'error');
      return;
    }

    const storageKey = `tripTaktikUserProfile_${this.currentUser.name || this.currentUser.email}`;
    localStorage.setItem(storageKey, JSON.stringify(this.profileData));

    this.updateProfileDisplay();
    this.showNotification('Profil berhasil diperbarui!', 'success');
  }

  /**
   * Membatalkan proses edit dan mengembalikan data form seperti semula.
   */
  cancelEdit() {
    if (confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
      this.loadProfileData(); // Muat kembali data asli dari localStorage
      this.showNotification('Perubahan dibatalkan.', 'info');
    }
  }

  /**
   * Memicu klik pada input file yang tersembunyi.
   */
  triggerUploadPhoto() {
    document.getElementById('photoInput').click();
  }

  /**
   * Menangani file gambar yang diunggah oleh pengguna.
   */
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileData.avatar = e.target.result;
        this.updateProfileDisplay();
        this.showNotification('Foto siap diunggah. Klik "Simpan Perubahan" untuk menyimpan.', 'info');
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Mengatur navigasi antar bagian konten di halaman profil.
   */
  navigateToSection(sectionId, clickedLink) {
    // Sembunyikan semua bagian konten terlebih dahulu.
    document.querySelectorAll('.profile-content-section, .edit-profile-container').forEach(section => {
      section.style.display = 'none';
    });

    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
      targetSection.style.display = 'block';
    } else if (sectionId === 'edit-profile') {
      document.querySelector('.edit-profile-container').style.display = 'block';
    }

    // Perbarui status 'active' pada menu sidebar.
    document.querySelectorAll('.profile-menu a').forEach(item => item.classList.remove('active'));
    if (clickedLink) {
      clickedLink.classList.add('active');
    }
  }

  /**
   * Proses logout pengguna.
   */
  logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('tripTaktikCurrentUser');
      // Data profil tidak dihapus agar pengaturan pengguna tersimpan jika login kembali.
      this.showNotification('Berhasil keluar!', 'success');
      setTimeout(() => this.redirectToAuth(), 1500);
    }
  }

  /**
   * Mengalihkan pengguna ke halaman otentikasi.
   */
  redirectToAuth() {
    window.location.href = this.authPageUrl;
  }

  /**
   * Menampilkan notifikasi sementara di pojok kanan atas.
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      padding: 12px 20px;
      margin-bottom: 10px;
      border-radius: 5px;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      transform: translateX(100%);
      min-width: 250px;
      text-align: center;
    `;

    if (type === 'success') notification.style.backgroundColor = '#28a745';
    else if (type === 'error') notification.style.backgroundColor = '#dc3545';
    else notification.style.backgroundColor = '#17a2b8';

    container.prepend(notification);

    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Inisialisasi aplikasi setelah seluruh halaman HTML selesai dimuat.
let profileApp;
document.addEventListener('DOMContentLoaded', () => {
  profileApp = new ProfilePage();
});