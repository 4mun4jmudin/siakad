TABEL CHECKLIST AUDIT FITUR ROLE ADMIN
No	Modul / Fitur	Status	Rincian & Catatan Teknis
1	Akses Penuh Sistem	✅ Ya	Middleware CheckUserLevel (check.level:Admin) mengamankan seluruh rute berpola /admin/*.
2	Halaman Admin	✅ Ya	Admin layout (AdminLayout.jsx) digunakan untuk semua halaman panel Admin.
3	Authentication		
- Login Admin	✅ Ya	Menggunakan sistem otentikasi standard Laravel Breeze (/login).
- Logout	✅ Ya	Rute /logout sudah terintegrasi penuh.
4	Dashboard		
- Dashboard Admin	✅ Ya	Terimplementasi penuh pada AdminDashboardController dengan rendering halaman admin/Dashboard.
- Statistik Akademik	✅ Ya	Menampilkan grafik tren, jumlah guru/siswa, jadwal hari ini, rekap absensi harian & bulanan, dan sparkline 30 hari.
5	Manajemen User		
- Kelola User	⚠️ Sebagian	Tidak ada halaman terpusat untuk melihat daftar seluruh user tbl_pengguna (misalnya untuk menambahkan Admin baru atau melihat semua akun dalam satu tabel).
- Tambah User	⚠️ Sebagian	Akun user dibuat secara otomatis saat membuat data Guru, Siswa, atau Orang Tua Wali. Namun, Admin tidak bisa membuat akun mandiri di luar ketiga role tersebut (misalnya Admin tambahan).
- Edit User	⚠️ Sebagian	Data akun diperbarui otomatis saat sinkronisasi edit data Guru/Siswa/Orang Tua.
- Hapus User	⚠️ Sebagian	Akun user otomatis terhapus saat data Guru/Siswa/Orang Tua dihapus dari database.
- Reset Password	✅ Ya	Sudah ada halaman khusus reset password default untuk Guru, Siswa, dan Orang Tua Wali.
6	Manajemen Guru		
- Data Guru	✅ Ya	Resource GuruController dan halaman admin/Guru terimplementasi lengkap.
- Tambah / Edit / Hapus	✅ Ya	CRUD lengkap beserta fitur tambahan barcode ID dan registrasi sidik jari.
7	Manajemen Siswa		
- Data Siswa	✅ Ya	Resource SiswaController dan halaman admin/Siswa terimplementasi lengkap.
- Tambah / Edit / Hapus	✅ Ya	CRUD lengkap beserta fitur bulk-delete, bulk-update, dan import template Excel.
8	Manajemen Kelas		
- Data Kelas	✅ Ya	Resource KelasController dan halaman admin/Kelas terimplementasi lengkap.
- Tambah / Edit / Hapus	✅ Ya	CRUD lengkap dengan fitur assign wali kelas dan tambah/keluarkan siswa.
9	Manajemen Mata Pelajaran		
- Data Mata Pelajaran	✅ Ya	Resource MataPelajaranController dan halaman admin/MataPelajaran.
- Tambah / Edit / Hapus	✅ Ya	CRUD lengkap.
10	Manajemen Jadwal		
- Jadwal Pelajaran	✅ Ya	Rute admin/jadwal-pelajaran dan admin/jadwal-mengajar sudah tersedia.
- Tambah / Edit / Hapus	✅ Ya	CRUD lengkap untuk jadwal mengajar guru per hari dan per jam pelajaran.
11	Monitoring Akademik		
- Monitoring Nilai	✅ Ya	Modul penilaian (penilaian.dashboard) sudah sangat lengkap dengan analitik nilai, rata-rata kelas, dan grafik ketuntasan.
- Monitoring Absensi	✅ Ya	Terimplementasi untuk absensi harian siswa, absensi bulanan, absensi per mapel, absensi guru, dan verifikasi surat izin.
- Monitoring Materi	⚠️ Sebagian	Materi pembelajaran ("Materi Pembahasan") dicatat oleh guru di dalam Jurnal Mengajar (admin/jurnal-mengajar), namun belum ada dashboard visual/rekap khusus yang memonitor persentase ketercapaian materi pelajaran per kelas secara spesifik.
- Monitoring Tugas	❌ Belum	Sama sekali belum ada modul tugas. Di database dan sistem, istilah "Tugas" saat ini baru sebatas bobot nilai tugas (grading component) dan status kehadiran kelas. Belum ada fitur bagi guru untuk mengunggah tugas, atau siswa mengumpulkan tugas.
12	Laporan		
- Rekap Nilai	✅ Ya	Dapat dilihat di submodul Rapor (admin/rapor) dengan kalkulasi nilai akhir otomatis.
- Rekap Absensi	✅ Ya	Menu rekap bulanan siswa dan guru sudah terimplementasi lengkap.
- Cetak / Export PDF & Excel	✅ Ya	Seluruh rekap absensi, jadwal, jurnal mengajar, rapor, dan data siswa sudah memiliki fitur cetak PDF/Excel.
13	Pengaturan Sistem		
- Pengaturan Sekolah	✅ Ya	Tab "Umum" di Pengaturan memiliki kontrol nama sekolah, alamat, logo, tahun ajaran aktif, dan semester aktif.
- Pengaturan Role	❌ Belum	Role/Level bersifat hardcoded (Admin, Guru, Siswa, Orang Tua). Belum ada antarmuka untuk menambah role baru atau mengedit tingkatan akses level.
- Pengaturan Permission	❌ Belum	Hak akses rute/halaman bersifat static dan dikunci langsung di kode program (Inertia & Middleware). Belum ada fitur manajemen permission dinamis (seperti Spatie Laravel-Permission).
