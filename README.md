# 📚 Website Perpustakaan App

Website ini merupakan aplikasi manajemen perpustakaan digital berbasis ReactJS yang terhubung ke REST API eksternal. Aplikasi ini memudahkan petugas perpustakaan dalam mengelola data buku, anggota, peminjaman, pengembalian, serta denda secara cepat, efisien, dan terdokumentasi.

---

## 👤 Identitas Pembuat

* **Nama**: Hansen Lucky Gunawan  
* **Rombel**: PPLG XI-2  
* **No. Absen**: 10

---

## 🚀 Fitur-Fitur Utama

### 🔐 Login & Logout

* Autentikasi petugas menggunakan username dan password.
* Menampilkan notifikasi sukses logout dan mencegah akses tanpa login.

### 🏠 Dashboard

* Menampilkan ringkasan data: total buku, anggota, peminjaman, dan denda.
* Navigasi cepat ke seluruh fitur aplikasi.

### 👥 Manajemen Member

* Tambah, edit, lihat detail, dan hapus data anggota.
* Data mencakup: No KTP, Nama, Alamat, Tanggal Lahir.

### 📚 Manajemen Buku

* Tambah, edit, lihat detail, dan hapus buku.
* Data: No Rak, Judul, Pengarang, Penerbit, Tahun Terbit, Stok.

### 🔁 Peminjaman & Pengembalian

* Pencatatan transaksi peminjaman dan pengembalian buku.
* Menampilkan status: Dipinjam, Dikembalikan, atau Terlambat.

### 💸 Denda Otomatis & Manual

* Perhitungan otomatis jika buku dikembalikan terlambat.
* Tambah dan hapus denda secara manual.
* Data: Nama Member, Judul Buku, Jumlah Denda, Jenis, Deskripsi.

### 📊 Grafik Peminjaman

* Visualisasi grafik bar peminjaman buku per bulan.
* Filter berdasarkan tahun.

### 🗂️ Export Data

* Export data peminjaman ke **Excel** dan riwayat member ke **PDF**.

---

## 🧠 Tujuan Proyek

* Meningkatkan efisiensi operasional perpustakaan.
* Menyediakan sistem digital untuk pengelolaan data buku dan anggota.
* Mempermudah pelaporan, pencatatan, dan monitoring aktivitas perpustakaan.
* Menyediakan solusi modern dan ramah pengguna untuk pengelolaan perpustakaan.

---

## 🔧 Teknologi yang Digunakan

* ReactJS
* Axios
* Bootstrap
* React Router DOM
* Chart.js / Recharts
* jsPDF & SheetJS (XLSX)
* JWT Authentication

---

## 🧩 Spesifikasi Proyek

* **CRUD Data** untuk buku, anggota, dan denda.
* **Validasi dan proteksi halaman** jika tidak login.
* **Export Excel & PDF** untuk dokumentasi transaksi.
* **Grafik interaktif** untuk analisis peminjaman bulanan.
* **Terhubung dengan REST API** sebagai backend.

---

## 🧭 Alur Aplikasi

1. Petugas login ke aplikasi.
2. Melihat ringkasan data di dashboard.
3. Mengelola anggota dan buku perpustakaan.
4. Mencatat transaksi peminjaman dan pengembalian.
5. Otomatisasi pencatatan denda jika terjadi keterlambatan.
6. Mengekspor laporan dalam format Excel atau PDF.
7. Logout dan keluar dari sistem dengan aman.

---

## 📄 Lisensi

Website ini dikembangkan untuk keperluan pembelajaran dan tugas proyek sekolah SMK Wikrama Bogor oleh siswa jurusan PPLG XI-2.
