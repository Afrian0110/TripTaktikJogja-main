# TripTaktik - Sistem Rekomendasi Pariwisata di Yogyakarta 

## Deskripsi Proyek

**TripTaktik** adalah sebuah platform berbasis web yang dikembangkan oleh tim mahasiswa dari Jurusan Teknik Informatika. Platform ini bertujuan untuk memberikan solusi cerdas bagi wisatawan yang ingin merencanakan perjalanan mereka ke Yogyakarta dengan lebih efektif dan efisien. Dengan memanfaatkan teknologi kecerdasan buatan (AI) dan pembelajaran mesin (Machine Learning), TripTaktik menawarkan rekomendasi destinasi wisata yang disesuaikan dengan preferensi pribadi setiap pengguna.

### Anggota Tim:

* (ML) MC179D5Y0226 - Muhammad Fharahbi Fachri - Universitas Ahmad Dahlan
* (ML) MC179D5Y0233 - Faris Nur Rizqiawan - Universitas Ahmad Dahlan
* (ML) MC189D5Y0317 - Davi Sulaiman - Universitas Bengkulu
* (FEBE) FC189D5Y0668 - Fahim Ahmad Saputra - Universitas Bengkulu
* (FEBE) FC189D5Y1046 - Rafi Afrian Al Haritz - Universitas Bengkulu
* (FEBE) FC376D5Y1738 - Ibnu Aditiyo - Universitas Indo Global Mandiri

## Latar Belakang

Jumlah wisatawan yang mengunjungi Yogyakarta semakin meningkat setiap tahunnya. Berdasarkan data dari Badan Pusat Statistik (BPS), tercatat bahwa:

* **38.030.739 wisatawan lokal**
* **7.167 wisatawan mancanegara**

Namun, wisatawan sering kali menghadapi kesulitan dalam memilih destinasi wisata yang sesuai dengan minat mereka. Informasi mengenai destinasi tersebar di berbagai platform yang tidak terstruktur dan tidak dipersonalisasi, sehingga menyebabkan:

* Proses perencanaan perjalanan yang lebih lama
* Pengalaman wisata yang kurang optimal

### Solusi TripTaktik

1. **Rekomendasi Wisata Cerdas** yang disesuaikan dengan preferensi pengguna.
2. **Perencana Harian Otomatis Berbasis AI** yang membantu merencanakan perjalanan harian wisatawan.
3. **Bookmark dan Kelola Rencana Perjalanan** dengan mudah.
4. **Umpan Balik Pengguna** untuk meningkatkan pengalaman wisata secara berkelanjutan.

## Arsitektur Sistem dan Alur Kerja

### 1. **Alur Machine Learning**

TripTaktik menggunakan pembelajaran mesin untuk menganalisis preferensi pengguna dan memberikan rekomendasi destinasi wisata yang relevan. Berikut adalah alur kerja dalam pengembangan model:

* **Persiapan Data**:

  * Pengambilan dataset (destinasi wisata Yogyakarta)
  * Pre-processing data: Encoding, Tokenisasi teks, TF-IDF, dan StandardScaler

* **Pengembangan Model**:

  * Menggunakan arsitektur **Siamese Network** (TensorFlow) untuk memproses dan mengklasifikasikan pasangan destinasi wisata yang mirip atau tidak mirip.
  * **Cosine Similarity** digunakan untuk menghitung jarak antar destinasi.
  * **Pelatihan Model** dengan label pasangan destinasi yang mirip atau tidak mirip dan optimasi menggunakan binary\_crossentropy.
  * **Evaluasi Performansi Model**: Mengukur akurasi dan visualisasi loss vs epoch.

* **Deployment & Inference**:

  * Model disimpan dalam format `.h5` dan digunakan di front-end dengan **TensorFlow\.js**.
  * Menggunakan input dari pengguna untuk mendapatkan rekomendasi destinasi yang paling mirip.

### 2. **Alur Front-End dan Back-End**

TripTaktik memiliki sistem front-end dan back-end yang terintegrasi untuk memberikan pengalaman pengguna yang mulus.

* **Front-End**:

  * Pengembangan antarmuka menggunakan **HTML**, **CSS**, dan **JavaScript** (SPA - Single Page Application).
  * Sistem rekomendasi berbasis AI/ML dengan **TensorFlow\.js**.
  * Mengambil data wisata melalui **Fetch API** dan menampilkan gambar destinasi yang dihosting di **Cloudinary**.
  * Platform di-deploy menggunakan **Netlify**.

* **Back-End**:

  * Pengembangan back-end menggunakan **Node.js** dan **Express.js**.
  * RESTful API untuk mengelola data pengguna, destinasi wisata, dan feedback.
  * Penyimpanan data dilakukan dengan **MongoDB Atlas**.
  * **Cloudinary SDK** digunakan untuk meng-upload gambar destinasi wisata.
  * Hosting menggunakan **Railway**.

## Teknologi yang Digunakan

### **Front-End**:

* **HTML**, **CSS**, **JavaScript**
* **TensorFlow\.js** (untuk AI/ML)
* **Cloudinary** (untuk manajemen gambar)
* **Netlify** (untuk hosting)

### **Back-End**:

* **Node.js**, **Express.js**
* **MongoDB Atlas** (untuk penyimpanan data)
* **Cloudinary SDK** (untuk upload gambar)
* **Railway** (untuk hosting)

### **Machine Learning**:

* **TensorFlow** (untuk pembelajaran mesin)
* **Pandas** (untuk manipulasi data)
* **Colab** (untuk eksperimen dan pelatihan model)

## Demo dan Panduan Penggunaan

Kunjungi website demo TripTaktik di:
[TripTaktik Website](https://triptaktik.netlify.app)

### Video Panduan Penggunaan Website

[Klik di sini untuk melihat video demo penggunaan website](https://bit.ly/WebsiteUsageDemoVideo)

## Instalasi

1. **Clone repositori ini**:

   ```bash
   git clone https://github.com/username/repository.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```



4. **Jalankan aplikasi**:


     ```bash
     npm run start -dev
     ```


5. Akses aplikasi di **localhost** sesuai port yang telah ditentukan.

