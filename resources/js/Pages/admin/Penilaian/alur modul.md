# Alur Modul Penilaian

## Alur besar

**Admin setup master data** → **Guru input nilai** → **Sistem menghitung rekap otomatis** → **Guru/kurikulum validasi** → **Publish** → **Ortu dan siswa melihat hasil**

---

## Alur detailnya

### 1. Admin menyiapkan master penilaian

Admin mengatur:

* tahun ajaran
* semester
* kelas
* mapel
* guru pengampu
* KKM
* bobot penilaian
* jenis penilaian yang dipakai sekolah

Contoh jenis penilaian:

* harian
* tugas
* praktik
* proyek
* PTS
* PAS
* sikap
* portofolio
* remedial
* pengayaan

---

### 2. Guru memilih kelas dan mapel

Guru masuk ke modul penilaian lalu memilih:

* kelas
* mapel
* semester
* jenis penilaian

Setelah itu guru bisa melihat daftar siswa otomatis sesuai jadwal mengajarnya.

---

### 3. Guru input nilai

Guru bisa input nilai dengan beberapa cara:

* satu per satu
* massal per kelas
* import Excel
* copy nilai dari kelas sebelumnya
* input berdasarkan komponen/rubrik

Untuk SMK, nilai praktik sebaiknya punya  **rubrik** , misalnya:

* ketepatan kerja
* kerapian hasil
* prosedur kerja
* waktu pengerjaan
* penggunaan alat
* keselamatan kerja

---

### 4. Sistem menghitung nilai otomatis

Setelah nilai diinput, sistem langsung menghitung:

* nilai per komponen
* nilai akhir mapel
* rata-rata
* predikat
* status tuntas / belum tuntas
* rekomendasi remedial

---

### 5. Validasi nilai

Sebelum dipublish, nilai masuk status:

* **draft**
* **menunggu validasi**
* **disetujui**
* **dipublish**

Ini penting supaya data tidak berantakan dan bisa dicek dulu.

---

### 6. Publish ke siswa dan orang tua

Kalau sudah final:

* siswa bisa lihat nilainya
* orang tua bisa pantau hasil anak
* guru bisa cetak rekap
* admin bisa audit data

---

# Fitur Modul Penilaian yang Profesional

## A. Fitur untuk Admin

Admin harus bisa:

* kelola tahun ajaran dan semester
* atur bobot penilaian per mapel
* atur KKM
* atur jenis penilaian yang aktif
* atur hak akses guru
* melihat rekap semua kelas
* lock nilai setelah final
* buka tutup periode input nilai

### Contoh pengaturan fleksibel

Admin bisa menentukan:

* Mapel umum: harian 30%, PTS 30%, PAS 40%
* Mapel produktif SMK: teori 20%, praktik 50%, proyek 20%, sikap 10%

Jadi sistem tidak kaku.

---

## B. Fitur untuk Guru

Guru adalah pengguna paling aktif.

Guru harus bisa:

* lihat kelas yang dia ajar
* lihat daftar siswa otomatis
* input nilai per jenis penilaian
* upload nilai via Excel
* edit nilai sebelum publish
* tambah catatan guru
* input remedial dan pengayaan
* lihat rekap nilai akhir
* cetak daftar nilai

### Untuk mapel SMK, guru juga perlu:

* input nilai praktik
* input nilai proyek
* input penilaian kompetensi
* input rubrik penilaian
* input sikap kerja / kedisiplinan saat praktik

---

## C. Fitur untuk Siswa

Siswa hanya lihat data miliknya sendiri:

* nilai per mapel
* nilai per komponen
* status tuntas / belum tuntas
* catatan guru
* riwayat remedial
* progres semester
* rekomendasi perbaikan

### Nilai yang tampil ke siswa sebaiknya:

* rapi
* mudah dibaca
* ada warna status
* ada penjelasan singkat

---

## D. Fitur untuk Orang Tua

Ortu perlu tampilan yang mudah dipahami, bukan data mentah.

Ortu bisa melihat:

* perkembangan nilai anak
* nilai per mapel
* tren naik/turun
* status ketuntasan
* catatan guru
* pemberitahuan jika nilai belum tuntas
* hasil remedial

### Tampilan ortu yang bagus:

* ringkasan nilai
* grafik progres
* highlight mapel merah
* catatan wali kelas/guru

---

# Model Penilaian yang Paling Cocok untuk SMK

Karena ini untuk  **SMK** , sistemnya harus mendukung beberapa bentuk penilaian berikut:

## 1. Penilaian Harian

Untuk aktivitas rutin:

* quiz
* tugas kelas
* ulangan singkat

## 2. Penilaian Tugas

* tugas individu
* tugas kelompok
* proyek kecil

## 3. Penilaian Praktik

Penting banget untuk SMK:

* praktik lab
* praktik bengkel
* praktik komputer
* praktik produksi

## 4. Penilaian Proyek

Untuk tugas berbasis produk:

* aplikasi
* desain
* alat
* laporan proyek

## 5. Penilaian Tengah Semester

Biasanya PTS.

## 6. Penilaian Akhir Semester

Biasanya PAS.

## 7. Penilaian Sikap / Afektif

Misalnya:

* disiplin
* tanggung jawab
* kerja sama
* sopan santun
* keaktifan

## 8. Remedial dan Pengayaan

Supaya sistem benar-benar realistis di sekolah.

---

# Struktur Alur yang Paling Rapi

Kalau dibuat profesional, alurnya bisa seperti ini:

## Tahap 1: Setup

* admin set tahun ajaran
* admin set semester
* admin set mapel
* admin set guru pengampu
* admin set bobot nilai
* admin set KKM

## Tahap 2: Input

* guru pilih kelas
* guru pilih mapel
* guru pilih jenis penilaian
* guru input nilai siswa

## Tahap 3: Proses

* sistem validasi nilai
* sistem hitung rata-rata
* sistem hitung nilai akhir
* sistem tentukan predikat
* sistem cek ketuntasan

## Tahap 4: Review

* guru cek hasil rekap
* wali kelas / kurikulum verifikasi
* koreksi jika ada salah input

## Tahap 5: Publish

* nilai dibuka ke siswa dan orang tua
* nilai bisa dicetak
* nilai bisa dilaporkan

---

# Status Data Penilaian yang Profesional

Supaya sistem fleksibel, data penilaian sebaiknya punya status:

* **draft** = baru dibuat
* **input berlangsung** = guru masih isi
* **menunggu validasi** = siap dicek
* **disetujui** = aman
* **dipublish** = tampil ke ortu dan siswa
* **dikunci** = tidak bisa diubah lagi

Ini bikin sistem jauh lebih rapi dan aman.

---

# Desain Fitur yang Fleksibel

Kalau mau benar-benar fleksibel, modul penilaian jangan dibuat satu model nilai saja.

Lebih bagus kalau ada:

## 1. Master komponen nilai

Contoh:

* harian
* tugas
* praktik
* proyek
* PTS
* PAS

## 2. Bobot per mapel

Contoh:

* Mapel A: tugas 20%, praktik 50%, PAS 30%
* Mapel B: harian 40%, PTS 30%, PAS 30%

## 3. Rubrik per jenis nilai

Contoh praktik punya aspek:

* prosedur
* hasil
* kerapian
* waktu
* kerja sama

## 4. Penilaian per semester

Jangan campur nilai semester ganjil dan genap.

## 5. Penilaian per kelas dan mapel

Karena satu guru bisa mengajar banyak kelas.

---

# Contoh Tampilan Menu Modul Penilaian

## Menu Admin

* Pengaturan Penilaian
* Bobot Nilai
* KKM
* Master Komponen
* Rekap Semua Kelas
* Lock Nilai

## Menu Guru

* Kelas Ajar Saya
* Input Nilai
* Nilai Praktik
* Nilai Tugas
* Nilai Ujian
* Remedial
* Rekap Nilai
* Cetak Nilai

## Menu Siswa

* Nilai Saya
* Riwayat Nilai
* Status Ketuntasan
* Catatan Guru

## Menu Ortu

* Perkembangan Anak
* Nilai Semester
* Grafik Progres
* Catatan Wali Kelas

---

# Saran Konsep Database Penilaian

Supaya fleksibel, minimal struktur tabelnya seperti ini:

* `tbl_penilaian`
* `tbl_penilaian_detail`
* `tbl_komponen_penilaian`
* `tbl_bobot_penilaian`
* `tbl_rubrik_penilaian`
* `tbl_remedial`
* `tbl_pengayaan`
* `tbl_nilai_akhir`
* `tbl_predikat_nilai`
* `tbl_status_penilaian`

Kalau mau lebih rapi lagi:

* pisahkan master nilai
* pisahkan transaksi nilai
* pisahkan rekap nilai akhir

---

# Konsep Formula Nilai

Agar fleksibel, sistem jangan pakai rumus hardcode.

Lebih bagus kalau rumus bisa diatur.

Contoh:

* Nilai akhir = jumlah dari semua komponen × bobot
* Predikat = berdasarkan rentang nilai
* Tuntas = nilai akhir >= KKM

Contoh sederhana:

* Harian 30%
* Tugas 20%
* PTS 20%
* PAS 30%

Tapi untuk SMK produktif bisa beda:

* Teori 20%
* Praktik 50%
* Proyek 20%
* Sikap kerja 10%

---

# Rekomendasi Paling Profesional

Kalau saya buatkan yang paling aman untuk sistem sekolah SMK, saya sarankan model ini:

## Penilaian berbasis 3 lapis

### Lapis 1: Komponen

Misalnya harian, tugas, praktik, ujian

### Lapis 2: Rekap otomatis

Sistem hitung nilai akhir per mapel

### Lapis 3: Output laporan

Tampilan khusus untuk:

* admin
* guru
* siswa
* ortu

Jadi satu data, banyak tampilan.

---

# Kesimpulan Konsep

Modul penilaian yang paling bagus untuk SMK adalah modul yang:

* **berbasis komponen**
* **bisa atur bobot**
* **mendukung teori dan praktik**
* **punya alur draft → validasi → publish**
* **bisa diakses admin, guru, siswa, ortu**
* **mudah dikembangkan**
* **tidak kaku**
* **sesuai kebutuhan sekolah**
