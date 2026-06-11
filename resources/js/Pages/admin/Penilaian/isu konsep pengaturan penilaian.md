Nah bro, **halaman Pengaturan Penilaian** itu sebenarnya pusat kontrol utama sistem penilaian.

Jadi halaman ini bukan tempat input nilai siswa, tetapi tempat:

* mengatur aturan penilaian,
* sistem bobot,
* KKM,
* komponen nilai,
* periode semester,
* dan konfigurasi global penilaian sekolah.

Kalau dibuat profesional, halaman ini sangat penting untuk admin dan kurikulum.

---

# Konsep Halaman Pengaturan Penilaian

## Fungsi Utama

Sebagai:

👉 pusat konfigurasi seluruh sistem penilaian sekolah.

Jadi guru tinggal pakai aturan yang sudah dibuat admin.

---

# Isi Halaman Pengaturan Penilaian

## 1. Pengaturan Tahun Ajaran & Semester

### Isi:

* Tahun ajaran aktif
* Semester aktif
* Status semester:
* aktif
* selesai
* arsip

### Fungsi:

Supaya semua nilai otomatis masuk ke semester yang benar.

---

# 2. Pengaturan KKM

## Yang bisa diatur:

* KKM per mapel
* KKM per jurusan
* KKM global sekolah
* KKM per kelas

### Contoh:

| Mapel             | Jurusan | KKM |
| ----------------- | ------- | --- |
| Pemrograman Dasar | RPL     | 75  |
| TKJ Dasar         | TKJ     | 78  |

---

# 3. Pengaturan Predikat Nilai

## Untuk menentukan:

* A
* B
* C
* D
* E

### Contoh:

| Predikat | Nilai   |
| -------- | ------- |
| A        | 90–100 |
| B        | 80–89  |
| C        | 70–79  |
| D        | 60–69  |

---

# 4. Pengaturan Komponen Penilaian

Ini paling penting.

## Admin menentukan:

jenis nilai apa saja yang dipakai sekolah.

### Contoh:

* Tugas
* Harian
* Praktik
* Proyek
* PTS
* PAS
* Sikap
* Portofolio

---

# 5. Pengaturan Bobot Penilaian

## Fungsi:

Menentukan persentase tiap komponen.

### Contoh Mapel Umum:

| Komponen | Bobot |
| -------- | ----- |
| Harian   | 20%   |
| Tugas    | 20%   |
| PTS      | 30%   |
| PAS      | 30%   |

---

### Contoh Mapel Produktif SMK:

| Komponen    | Bobot |
| ----------- | ----- |
| Praktik     | 50%   |
| Proyek      | 20%   |
| Teori       | 20%   |
| Sikap Kerja | 10%   |

Ini yang bikin sistem fleksibel.

---

# 6. Pengaturan Formula Nilai

Kalau mau lebih profesional.

## Fungsi:

Menentukan cara sistem menghitung nilai akhir.

### Contoh:

* rata-rata
* weighted average
* nilai tertinggi
* kombinasi teori + praktik

---

# 7. Pengaturan Publish Nilai

## Fitur:

* buka/tutup akses nilai
* publish nilai massal
* lock nilai
* unlock nilai

### Status:

* Draft
* Validasi
* Published
* Locked

---

# 8. Pengaturan Remedial

## Isi:

* batas remedial
* jumlah maksimal remedial
* metode perhitungan remedial
* nilai pengganti otomatis/manual

---

# 9. Pengaturan Pengayaan

Untuk siswa nilai tinggi.

### Contoh:

Jika nilai > 90:

* masuk pengayaan
* tugas tambahan
* bonus nilai

---

# 10. Pengaturan Validasi Nilai

Kalau mau sistem sekolah lebih profesional.

## Alur:

Guru input → wali kelas validasi → admin publish

---

# 11. Pengaturan Role Akses Penilaian

## Contoh:

### Guru:

* input nilai
* edit draft

### Wali Kelas:

* lihat rekap kelas

### Admin:

* lock nilai
* publish

### Ortu:

* hanya lihat hasil

---

# 12. Pengaturan Ranking

Kalau sekolah masih pakai ranking.

### Pilihan:

* ranking kelas
* ranking paralel
* ranking jurusan

---

# 13. Pengaturan Deskripsi Nilai Otomatis

Untuk rapor.

### Contoh:

“Aktif dan memahami dasar pemrograman dengan baik.”

Generate otomatis berdasarkan nilai.

---

# Struktur Layout Halaman yang Bagus

## TAB / SECTION

### Tab 1 — Semester & Tahun Ajaran

* tahun aktif
* semester aktif

---

### Tab 2 — KKM & Predikat

* setting KKM
* setting A/B/C/D

---

### Tab 3 — Komponen & Bobot

* komponen nilai
* bobot penilaian

---

### Tab 4 — Publish & Validasi

* lock nilai
* publish
* validasi

---

### Tab 5 — Remedial & Pengayaan

* aturan remedial
* aturan pengayaan

---

# KPI Card di Atas Halaman

Biar modern.

Contoh:

* Semester Aktif
* Total Komponen Nilai
* Total Mapel Menggunakan Bobot
* Status Publish

---

# Tombol Action Penting

## Harus ada:

* Simpan Pengaturan
* Reset Pengaturan
* Publish Nilai
* Lock Semester
* Sinkronisasi Nilai

---

# Yang Jangan Ditaruh di Halaman Ini

❌ Input nilai siswa

❌ Tabel nilai siswa besar

❌ Rekap detail siswa

Karena itu masuk halaman:

* Penilaian
* Rekapitulasi Nilai

---

# Konsep Profesionalnya

Jadi:

## Pengaturan Penilaian

= tempat mengatur aturan sistem

## Penilaian

= tempat input nilai

## Rekapitulasi

= tempat melihat hasil

## Laporan

= tempat cetak/output

Ini struktur yang paling rapi dan scalable.

---

# Kesimpulan

Halaman Pengaturan Penilaian sebaiknya berisi:

✅ Tahun ajaran

✅ Semester

✅ KKM

✅ Predikat

✅ Komponen nilai

✅ Bobot nilai

✅ Formula penilaian

✅ Publish & lock

✅ Validasi

✅ Remedial

✅ Pengayaan

✅ Hak akses penilaian
