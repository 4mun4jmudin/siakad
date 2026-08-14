# Dokumen Pengujian Sistem (Black-Box, BVA, & Decision Table)

Sistem Informasi Akademik (SIAKAD) ini memiliki fitur yang kompleks (menggunakan sensor *hardware* GPS), sehingga pengujian dibagi menjadi tiga metode: **Pengujian Fungsional (Black-Box)** untuk antarmuka umum, **Boundary Value Analysis (BVA)** untuk batasan angka absolut (radius & waktu), dan **Decision Table Testing** untuk logika kombinasi validasi absensi.

---

## 1. Pengujian Fungsionalitas Umum (Black-Box Testing)
Pengujian ini memastikan seluruh alur (UI/UX) dan fitur dasar yang bukan berupa hitungan matematika berjalan dengan baik.

| No | Modul / Fitur | Skenario Pengujian (Test Case) | Hasil yang Diharapkan (Expected Result) | Hasil Aktual | Status |
|:---|:---|:---|:---|:---|:---:|
| 1 | **Login Siswa** | Memasukkan kredensial NIS dan Password yang valid lalu klik *Login*. | Sistem memberikan autentikasi, lalu mengarahkan siswa ke halaman Dashboard. | Berhasil masuk ke Dashboard Siswa. | **Pass** |
| 2 | **Login Siswa** | Memasukkan kredensial yang salah (Password salah). | Sistem menolak *login* dan memunculkan *error message*. | Muncul peringatan "Kredensial tidak cocok". | **Pass** |
| 3 | **Akses Izin Lokasi** | Pertama kali membuka Dashboard Absensi. | *Browser* meminta *permission* (izin) untuk mengakses sensor GPS. | Muncul *pop-up* permintaan akses lokasi di *browser*. | **Pass** |
| 4 | **Akses Lokasi Ditolak / Tidak Tersedia** | Siswa secara manual memblokir akses lokasi pada *browser*. | Tombol "Absen" terkunci (*disabled*) dan muncul pesan peringatan gagal akses GPS. | Tombol Absen tidak aktif, tampil peringatan "Akses lokasi ditolak". | **Pass** |
| 5 | **Menampilkan Peta & Titik GPS** | Siswa menyetujui izin lokasi dan GPS aktif. | Peta memuat koordinat (*latitude/longitude*) terkini siswa secara *real-time*. | Peta muncul dengan *marker* biru beserta hitungan jarak ke sekolah. | **Pass** |
| 6 | **Riwayat Presensi** | Siswa membuka tab "Riwayat Absensi". | Menampilkan log lengkap riwayat kehadiran, waktu masuk/pulang, dan status kehadiran. | Kalender/Tabel riwayat tampil dengan akurat sesuai data di *database*. | **Pass** |
| 7 | **Monitoring Admin (Live Location)** | Admin membuka menu "Live Location" saat ada siswa yang mengakses *dashboard*. | Titik lokasi siswa muncul secara *real-time* di peta pusat admin. | *Marker* pergerakan siswa terlihat beserta status radius. | **Pass** |

---

## 2. Boundary Value Analysis (BVA)
Metode ini digunakan untuk menguji nilai pada "batas pinggir" (*boundary*) dari aturan jarak (radius) dan waktu toleransi presensi. 
*Asumsi Aturan: Batas Radius Maksimal = 200 meter. Batas Awal Buka Absen = 06:45 (Toleransi 15 menit sebelum 07:00).*

### 2.1 Pengujian Batas Jarak (Radius Presensi Masuk & Pulang)
| ID Uji | Nilai Jarak Diuji | Penjelasan Nilai | Ekspektasi Sistem | Hasil Aktual | Status |
| :---: | :---: | :--- | :--- | :--- | :---: |
| BVA-01 | 150 meter | Di dalam radius (*Normal*) | Diterima | Presensi berhasil disimpan. | **Pass** |
| BVA-02 | 200 meter | Tepat di garis batas maksimal radius | Diterima | Presensi berhasil disimpan. | **Pass** |
| BVA-03 | 201 meter | Tepat meleset 1 meter di luar radius | Ditolak otomatis | Gagal: Peringatan "Lokasi ditolak. Jarak 201m". | **Pass** |
| BVA-04 | 1500 meter | Jauh di luar jangkauan (Misal: dari rumah) | Ditolak otomatis | Gagal: Peringatan "Lokasi ditolak". | **Pass** |

### 2.2 Pengujian Batas Waktu 
| ID Uji | Jam Absen | Penjelasan Waktu | Ekspektasi Sistem | Hasil Aktual | Status |
| :---: | :---: | :--- | :--- | :--- | :---: |
| BVA-05 | 06:44 | 1 Menit sebelum toleransi absen dibuka | Ditolak otomatis | Gagal: "Absensi belum dibuka". | **Pass** |
| BVA-06 | 06:45 | Tepat saat absen dibuka (*On Boundary*) | Diterima | Presensi berhasil disimpan. | **Pass** |
| BVA-07 | 15:00 | Presensi Pulang (Tepat waktu) | Diterima | Jam pulang berhasil diperbarui. | **Pass** |
| BVA-08 | 14:59 | Presensi Pulang (Terlalu Cepat) | Ditolak otomatis | Gagal: "Belum waktunya pulang". | **Pass** |

---

## 3. Decision Table Testing (Logika Kombinasi Absensi)
Digunakan untuk menguji kondisi majemuk. Siswa **hanya bisa absen** jika seluruh syarat terpenuhi secara bersamaan (AND Logic). Jika salah satu syarat gugur, maka sistem menghasilkan keputusan (Action) yang berbeda.

**Variabel Syarat (Conditions):**
- **C1 (Radius Valid):** Jarak ≤ 200 meter.
- **C2 (Waktu Valid):** Masih dalam rentang jam operasional absensi.
- **C3 (Keamanan GPS Valid):** Sinyal akurat dan **bukan** berasal dari aplikasi *Fake GPS*.

| Test Case | C1 (Jarak) | C2 (Waktu) | C3 (GPS Murni) | Keputusan Sistem (Action) | Status Pengujian |
|:---:|:---:|:---:|:---:|:---|:---:|
| **DT-01** | ✅ True | ✅ True | ✅ True | **DITERIMA** (Data masuk ke database, status: Hadir) | **Valid / Pass** |
| **DT-02** | ❌ False | ✅ True | ✅ True | **DITOLAK** (Sistem menolak karena Jarak berlebih) | **Valid / Pass** |
| **DT-03** | ✅ True | ❌ False | ✅ True | **DITOLAK** (Sistem menolak karena Belum Waktunya) | **Valid / Pass** |
| **DT-04** | ✅ True | ✅ True | ❌ False | **DITOLAK** (Sistem menolak karena Indikasi Fake GPS) | **Valid / Pass** |
| **DT-05** | ❌ False | ❌ False | ✅ True | **DITOLAK** (Penolakan bertingkat: Waktu & Jarak salah) | **Valid / Pass** |
