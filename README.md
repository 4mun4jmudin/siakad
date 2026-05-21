# SIAKAD - Sistem Informasi Akademik & Absensi Sekolah

<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Laravel Logo">
  <span style="font-size: 40px; font-weight: bold; margin: 0 20px; vertical-align: middle;">+</span>
  <img src="https://raw.githubusercontent.com/reactjs/reactjs.org/main/src/icons/logo.svg" width="100" style="vertical-align: middle;" alt="React Logo">
</p>

---

## 🌟 Tentang Sistem

**SIAKAD (Sistem Informasi Akademik)** adalah platform manajemen sekolah modern yang dirancang untuk mengintegrasikan proses akademik, presensi/absensi harian dan mata pelajaran, pemantauan materi, hingga penilaian siswa dalam satu sistem terpusat. 

Sistem ini didesain dengan antarmuka yang modern, dinamis, dan responsif guna menyajikan pengalaman pengguna yang intuitif bagi seluruh civitas akademika, mulai dari Administrator, Guru, Siswa, hingga Orang Tua Wali.

---

## 🚀 Fitur Utama Berdasarkan Peran (Role)

### 👑 1. Portal Administrator (Admin)
* **Dashboard Analitis:** Menampilkan statistik real-time jumlah guru/siswa, jadwal hari ini, rekap absensi harian & bulanan, diagram kelulusan/ketuntasan KKM, serta sparkline keaktifan 30 hari terakhir.
* **Manajemen Pengguna:** Pengelolaan terpusat akun pengguna (`tbl_pengguna`) beserta fitur **Reset Password** sekali-klik untuk guru, siswa, dan wali.
* **Manajemen Guru & Staf:** Pengelolaan data guru lengkap beserta fitur registrasi kode barcode ID unik dan sidik jari untuk integrasi mesin presensi.
* **Manajemen Siswa:** CRUD lengkap siswa dengan kemampuan **Import dari Excel**, pembaruan massal (*bulk-update*), dan penghapusan massal (*bulk-delete*).
* **Manajemen Kelas:** Pengaturan kelas, pengisian wali kelas (*homeroom teacher*), serta distribusi siswa masuk/keluar kelas secara interaktif.
* **Manajemen Akademik:** Konfigurasi mata pelajaran, jadwal pelajaran mingguan per kelas, tahun ajaran aktif, dan pengaturan semester aktif.
* **Monitoring Akademik:** Pemantauan real-time nilai siswa, rekap presensi harian/mapel, status pengajuan surat izin sakit/izin, jurnal mengajar guru, hingga persentase ketercapaian materi pelajaran.
* **Utilitas & Backup Sistem:** Fitur pencadangan (*backup*) database manual/otomatis, pemulihan (*restore*) database sekali-klik dari file ZIP hasil backup, serta optimalisasi tabel database dan pembersihan cache.

### 👨‍🏫 2. Portal Guru (Teacher)
* **Jurnal Mengajar Elektronik:** Pencatatan materi pembahasan kelas secara langsung per jam pelajaran untuk rekam jejak ketercapaian kurikulum.
* **Manajemen Rencana Materi:** Merancang rencana materi pembelajaran sebelum masuk kelas agar pembelajaran lebih terstruktur.
* **Manajemen Tugas & Evaluasi:** Membuat tugas harian/proyek, menentukan tipe pengumpulan (berkas PDF/gambar/teks), dan memeriksa serta memberikan nilai (*grading*) langsung dari panel guru secara interaktif.
* **Input Nilai Terintegrasi:** Memasukkan nilai komponen (Tugas, Ulangan Harian, PTS, PAS) dengan persentase bobot otomatis yang langsung tersinkronisasi menjadi nilai rapor akhir.
* **Input Absensi Kelas & Mapel:** Pengisian kehadiran siswa per jam pelajaran atau secara harian melalui antarmuka web yang efisien.
* **Laporan & Rekapitulasi:** Cetak dan ekspor lembar nilai kelas, presensi bulanan, serta rapor siswa ke format Excel atau PDF secara instan.

### 🎓 3. Portal Siswa (Student)
* **Dashboard Akademik Premium:** Menyajikan visualisasi data nilai berupa grafik evaluasi berkala, persentase kelengkapan biodata pribadi, dan notifikasi tugas aktif.
* **Lihat Nilai Komprehensif:** Dashboard nilai interaktif per semester yang menampilkan rata-rata nilai, status ketuntasan KKM, serta kartu evaluasi komponen detail (Tugas, UH, PTS, PAS) dengan bobot nilai lengkap beserta catatan guru pengajar.
* **Lihat Absensi Interaktif:** Kalender absensi bulanan berbentuk grid lingkaran sel dinamis berwana (Sakit, Izin, Hadir, Alfa), panel status kehadiran harian, serta riwayat presensi yang dapat difilter berdasarkan rentang tanggal.
* **Lihat Jadwal Pelajaran:** Tampilan jadwal pelajaran mingguan yang dikelompokkan per hari, lengkap dengan highlight hari aktif saat ini untuk kemudahan akses.
* **Materi & Tugas Mandiri:** Mengunduh materi pembelajaran yang dibagikan guru, melihat tugas aktif, serta mengunggah berkas pengumpulan tugas secara langsung di sistem.

### 👨‍👩‍👦 4. Portal Orang Tua / Wali (Parent)
* **Pemantauan Nilai Anak:** Melihat perkembangan nilai akademik anak secara transparan, lengkap dengan detail komponen penilaian dan catatan guru kelas.
* **Pemantauan Absensi Real-time:** Memantau riwayat kehadiran harian anak di sekolah guna meminimalisir tingkat ketidakhadiran tanpa keterangan.
* **Jadwal & Agenda Kelas:** Melihat jadwal harian kelas anak untuk membantu proses belajar anak di rumah.

---

## 🛠️ Spesifikasi Teknologi

Sistem ini dibangun menggunakan teknologi mutakhir guna menjamin performa cepat, keamanan tinggi, dan kemudahan skalabilitas:
* **Backend:** [Laravel 11.x](https://laravel.com) (PHP 8.2+)
* **Frontend:** [React.js](https://react.dev) dengan [Inertia.js](https://inertiajs.com) (Tanpa rendering API eksternal yang lambat, menyajikan pengalaman Single Page Application (SPA) yang sangat mulus).
* **Styling (CSS):** [TailwindCSS 3.x](https://tailwindcss.com) untuk UI modern, bersih, dan responsif.
* **Database:** [MySQL 8.x](https://www.mysql.com) atau MariaDB.
* **Asset Bundler:** [Vite](https://vitejs.dev) untuk proses hot-reload aset frontend yang super cepat saat pengembangan.
* **Format Dokumen:** Integrasi library ekspor data (Excel & PDF) untuk rekap laporan otomatis.

---

## 📂 Panduan Instalasi Lengkap dari Nol

Ikuti langkah-langkah di bawah ini untuk memasang dan menjalankan proyek SIAKAD di lingkungan pengembangan lokal Anda:

### 📋 Prasyarat Sistem
Sebelum memulai, pastikan perangkat Anda telah terpasang:
1. **PHP >= 8.2** (dengan ekstensi: `BCMath`, `Ctype`, `Fileinfo`, `JSON`, `Mbstring`, `OpenSSL`, `PDO`, `Tokenizer`, `XML`, `ZIP`, `GD`).
2. **Composer** (Dependency manager untuk PHP).
3. **Node.js (LTS)** & **NPM** atau **PNPM** (Package manager untuk Javascript/React).
4. **MySQL / MariaDB Server** (Bisa menggunakan XAMPP, Laragon, atau MySQL installer mandiri).
5. **Git** (Opsional, untuk clone repositori).

---

### 💻 Langkah demi Langkah Pemasangan

#### Langkah 1: Kloning Repositori
Buka terminal/command prompt Anda, lalu arahkan ke direktori kerja Anda dan jalankan perintah:
```bash
git clone https://github.com/4mun4jmudin/siakad.git
cd siakad
```

#### Langkah 2: Instalasi Dependensi PHP (Backend)
Unduh semua library PHP yang dibutuhkan menggunakan Composer:
```bash
composer install
```

#### Langkah 3: Instalasi Dependensi Javascript (Frontend)
Unduh semua paket NodeJS yang dibutuhkan untuk React & TailwindCSS:
```bash
npm install
# ATAU jika Anda menggunakan pnpm:
pnpm install
```

#### Langkah 4: Konfigurasi Environment File
Salin berkas template konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` yang baru dibuat dengan teks editor Anda (VSCode, Notepad++, dll), lalu sesuaikan konfigurasi database Anda:
```env
APP_NAME="SIAKAD"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_sistem    # Nama database yang akan Anda buat
DB_USERNAME=root         # Username database Anda (bawaan xampp/laragon biasanya 'root')
DB_PASSWORD=             # Password database Anda (kosongkan jika xampp)
```

#### Langkah 5: Buat Database Baru
Buka aplikasi pengelola database Anda (phpMyAdmin, TablePlus, DBeaver, HeidiSQL, atau terminal MySQL), lalu buat database kosong dengan nama yang sesuai dengan `.env` Anda (contoh: `db_sistem`).
```sql
CREATE DATABASE db_sistem;
```

#### Langkah 6: Generate Application Key
Jalankan perintah berikut untuk mengacak dan menghasilkan kunci enkripsi unik aplikasi Laravel Anda:
```bash
php artisan key:generate
```

#### Langkah 7: Jalankan Migrasi & Pengisian Data Awal (Seeders)
Kirimkan skema tabel database dan isi data awal bawaan sistem (seperti akun administrator default, beberapa akun guru, data kelas, mata pelajaran, dll):
```bash
php artisan migrate --seed
```

#### Langkah 8: Buat Symbolic Link (Junction Storage)
Hubungkan folder penyimpanan file internal (`storage/app/public`) dengan folder publik (`public/storage`) agar semua dokumen yang diunggah (seperti foto profil & berkas tugas) dapat diakses langsung oleh browser:
```bash
php artisan storage:link
```

#### Langkah 9: Kompilasi Aset Frontend (React)
* **Untuk Lingkungan Pengembangan (Development):**
  Jalankan server Vite agar perubahan frontend React dapat termuat secara otomatis (*Hot Reload*):
  ```bash
  npm run dev
  # ATAU dengan pnpm:
  pnpm dev
  ```
* **Untuk Lingkungan Produksi (Production):**
  Lakukan proses build mandiri guna mengompres berkas React menjadi satu bundel aset statis siap pakai:
  ```bash
  npm run build
  ```

#### Langkah 10: Jalankan Server Lokal Laravel
Di jendela terminal baru (tanpa mematikan server Vite di Langkah 9), jalankan server Laravel Anda:
```bash
php artisan serve
```
Sekarang, buka browser Anda dan akses tautan berikut: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**. Sistem SIAKAD Anda sudah aktif dan siap digunakan! 🎉

---

## 🔑 Akun Uji Coba Default (Default Credentials)

Gunakan akun-akun berikut untuk masuk dan menguji fungsionalitas sistem sesuai dengan peran masing-masing:

| Peran (Role) | Username | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `password` | Kontrol penuh sistem, manajemen user, backup database |
| **Guru** | `guru` | `password` | Mengelola materi, jurnal, absensi kelas, penugasan, input nilai |
| **Siswa** | *Daftarkan via Admin* | *Bawaan sistem* | Melihat jadwal, mengunduh materi, mengumpulkan tugas, presensi bulanan |
| **Orang Tua / Wali** | *Daftarkan via Admin* | *Bawaan sistem* | Memantau perkembangan nilai dan kehadiran anak |

---

## 🛠️ Panduan Pemeliharaan (Maintenance)

Jika Anda melakukan pengembangan di lingkungan jaringan lokal agar dapat diakses oleh perangkat lain (misalnya menggunakan Wi-Fi internal kantor/sekolah), kami telah menyediakan file batch khusus:

### Utilitas Jaringan Wi-Fi (`wifi.bat`)
Untuk menjalankan server secara instan dan mengeksposnya ke alamat IP jaringan lokal (sehingga bisa diakses oleh komputer lain/smartphone melalui WiFi), Anda cukup menjalankan berkas:
```bash
wifi.bat
```
Script otomatis di dalam `wifi.bat` akan melakukan:
1. Mematikan proses server Vite dev jika masih berjalan.
2. Membangun aset kompilasi produksi React (`npm run build`).
3. Membersihkan cache konfigurasi Laravel (`php artisan config:clear`).
4. Menjalankan server serve dengan parameter host universal (`--host=0.0.0.0 --port=8000`).

---

## 📄 Lisensi

Sistem Informasi Akademik & Absensi Sekolah ini berlisensi di bawah lisensi terbuka [MIT](https://opensource.org/licenses/MIT). Silakan dikembangkan dan digunakan secara bijak.
