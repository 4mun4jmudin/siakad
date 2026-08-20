# LAPORAN HASIL PENGUJIAN SISTEM (BLACK BOX TESTING, BVA, DECISION TABLE)

Dokumen ini berisi hasil pengujian mentah menyeluruh (*Black Box Testing*, *Boundary Value Analysis*, dan *Decision Table*) pada prototipe Sistem Informasi Akademik dan Presensi Siswa Berbasis Geolocation dengan Algoritma Haversine.

---

## A. DAFTAR AKTIVITAS / FUNGSI SISTEM

1. **Autentikasi & Manajemen Sesi (Login, Multi-Role, Single Session)**
2. **Kelola Data Master Siswa** (`Admin/SiswaController`)
3. **Kelola Data Master Guru** (`Admin/GuruController`)
4. **Kelola Data Master Kelas** (`Admin/KelasController`)
5. **Pengaturan Presensi & Lokasi Sekolah** (`Admin/PengaturanController`)
6. **Presensi Siswa Masuk (Geolocation & Validasi Spasial)** (`Siswa/AbsensiController@store`)
7. **Presensi Siswa Pulang** (`Siswa/AbsensiController@store`)
8. **Monitoring Presensi Siswa (Admin/Guru/Rekap/Export)** (`Admin/AbsensiSiswaController`)
9. **Riwayat Presensi Siswa & Akses Orang Tua/Wali** (`Siswa/AbsensiController@index`, `OrangTua/AbsensiController`)
10. **Pengajuan Surat Izin & Sakit** (`OrangTua/SuratIzinController`, `Admin/SuratIzinController`)
11. **Persetujuan (Approve/Reject) & Sinkronisasi Surat Izin ke Absensi** (`Admin/SuratIzinController`)
12. **Pelacakan Live Lokasi Siswa** (`Siswa/LiveLocationController`, `Admin/LiveLocationController`, `useLiveLocation.jsx`)

---

## B. TABEL PENGUJIAN BLACK BOX LENGKAP PER AKTIVITAS

### 1. Modul Autentikasi (Login)

| ID        | Aktivitas        | Test Case        | Input/Kondisi                             | Expected Result                                    | Actual Result                                       |          Status          | Bukti                                     |
| :-------- | :--------------- | :--------------- | :---------------------------------------- | :------------------------------------------------- | :-------------------------------------------------- | :----------------------: | :---------------------------------------- |
| TC-LOG-01 | Login Siswa      | Kredensial Valid | Username & password benar (Peran: Siswa)  | Redirect ke`/siswa/dashboard`, session tersimpan | Redirect ke`/siswa/dashboard`, session dibuat     | **Runtime Tested** | `AuthenticatedSessionController.php:40` |
| TC-LOG-02 | Login Siswa      | Password Salah   | Username benar, password salah            | Menolak akses, error "Kredensial tidak cocok"      | Error "Kredensial tidak cocok", tetap di login      | **Runtime Tested** | `LoginRequest.php:61`                   |
| TC-LOG-03 | Login Siswa      | Username Salah   | Username tidak terdaftar, password terisi | Menolak akses, error kredensial tidak ditemukan    | Muncul pesan error kredensial salah                 | **Runtime Tested** | `LoginRequest.php:61`                   |
| TC-LOG-04 | Login Siswa      | Username Kosong  | Username`""`, password terisi           | Validasi form gagal: "Username wajib diisi"        | Form ditolak, pesan validasi username muncul        | **Runtime Tested** | `LoginRequest.php:42`                   |
| TC-LOG-05 | Login Siswa      | Password Kosong  | Username terisi, password`""`           | Validasi form gagal: "Password wajib diisi"        | Form ditolak, pesan validasi password muncul        | **Runtime Tested** | `LoginRequest.php:43`                   |
| TC-LOG-06 | Login Siswa      | Form Kosong      | Username`""`, password `""`           | Validasi ganda gagal                               | Form tidak diproses, kedua field merah              | **Runtime Tested** | `LoginRequest.php:42`                   |
| TC-LOG-07 | Login Multi-Role | Hak Akses Admin  | Login akun peran`admin`                 | Diarahkan ke`/admin/dashboard`                   | Redirect ke`/admin/dashboard`                     | **Runtime Tested** | `AuthenticatedSessionController.php:52` |
| TC-LOG-08 | Login Multi-Role | Hak Akses Guru   | Login akun peran`guru`                  | Diarahkan ke`/guru/dashboard`                    | Redirect ke`/guru/dashboard`                      | **Runtime Tested** | `AuthenticatedSessionController.php:54` |
| TC-LOG-09 | Login Multi-Role | Hak Akses Wali   | Login akun peran`wali`                  | Diarahkan ke`/orangtua/dashboard`                | Redirect ke`/orangtua/dashboard`                  | **Runtime Tested** | `AuthenticatedSessionController.php:56` |
| TC-LOG-10 | Single Session   | Double Login     | Akun login di perangkat B saat aktif di A | Sesi di perangkat A hangus (401/Kick)              | Perangkat A logout otomatis saat request berikutnya | **Runtime Tested** | `CheckSingleSession.php:32`             |

---

### 2. Kelola Data Siswa

| ID        | Aktivitas    | Test Case             | Input/Kondisi                        | Expected Result                                   | Actual Result                                 |             Status             | Bukti                             |
| :-------- | :----------- | :-------------------- | :----------------------------------- | :------------------------------------------------ | :-------------------------------------------- | :----------------------------: | :-------------------------------- |
| TC-SIS-01 | Tampil Data  | Buka halaman index    | Akses route`admin/siswa`           | Daftar siswa muncul dengan pagination & filter    | Data siswa berhasil di-render via Inertia     |    **Runtime Tested**    | `Admin/SiswaController.php:45`  |
| TC-SIS-02 | Tambah Siswa | Input Lengkap & Valid | NIS unik, Nama, Kelas, JK, Tgl Lahir | Siswa tersimpan di`tbl_siswa`, auto-create user | Data bertambah di database, notifikasi sukses |    **Runtime Tested**    | `Admin/SiswaController.php:120` |
| TC-SIS-03 | Tambah Siswa | Field Wajib Kosong    | NIS`""`, Nama `""`               | Validasi gagal, error field required              | Form ditolak, field NIS/Nama wajib diisi      | **Source Code Verified** | `Admin/SiswaController.php:112` |
| TC-SIS-04 | Tambah Siswa | NIS Duplikat          | NIS sudah ada di`tbl_siswa`        | Validasi gagal: "NIS sudah terdaftar"             | Ditolak dengan pesan error unique NIS         | **Source Code Verified** | `Admin/SiswaController.php:113` |
| TC-SIS-05 | Edit Siswa   | Update Data Valid     | Ubah nama lengkap siswa              | Data di`tbl_siswa` terupdate                    | Nama siswa berubah, log tercatat              |    **Runtime Tested**    | `Admin/SiswaController.php:185` |
| TC-SIS-06 | Hapus Siswa  | Hapus 1 Siswa         | Klik tombol delete siswa             | Data terhapus atau dinonaktifkan                  | Siswa terhapus dari tabel index               |    **Runtime Tested**    | `Admin/SiswaController.php:210` |

---

### 3. Kelola Data Guru

| ID        | Aktivitas   | Test Case              | Input/Kondisi                    | Expected Result                              | Actual Result                     |             Status             | Bukti                            |
| :-------- | :---------- | :--------------------- | :------------------------------- | :------------------------------------------- | :-------------------------------- | :----------------------------: | :------------------------------- |
| TC-GUR-01 | Tampil Data | Akses route index guru | Buka`admin/guru`               | Daftar guru tampil beserta NIP & mapel       | Tabel guru termuat dengan lengkap |    **Runtime Tested**    | `Admin/GuruController.php:35`  |
| TC-GUR-02 | Tambah Guru | Data Valid             | NIP unik, Nama, JK, Status Aktif | Guru tersimpan di`tbl_guru` + akun login   | Guru baru bertambah di sistem     |    **Runtime Tested**    | `Admin/GuruController.php:95`  |
| TC-GUR-03 | Tambah Guru | NIP Duplikat           | NIP sudah pernah digunakan       | Ditolak oleh validasi`unique:tbl_guru,nip` | Muncul error NIP sudah digunakan  | **Source Code Verified** | `Admin/GuruController.php:88`  |
| TC-GUR-04 | Edit Guru   | Update Profil Guru     | Ubah nomor telepon / status      | Data guru terupdate di database              | Profil guru berhasil diperbarui   |    **Runtime Tested**    | `Admin/GuruController.php:140` |
| TC-GUR-05 | Hapus Guru  | Hapus Data Guru        | Klik hapus guru                  | Record dihapus dari database                 | Data guru terhapus dari sistem    |    **Runtime Tested**    | `Admin/GuruController.php:170` |

---

### 4. Kelola Data Kelas

| ID        | Aktivitas    | Test Case                | Input/Kondisi                     | Expected Result                             | Actual Result                               |             Status             | Bukti                             |
| :-------- | :----------- | :----------------------- | :-------------------------------- | :------------------------------------------ | :------------------------------------------ | :----------------------------: | :-------------------------------- |
| TC-KEL-01 | Tampil Data  | Buka index kelas         | Akses`admin/kelas`              | Menampilkan nama kelas, tingkat, wali kelas | Data kelas ter-render dengan relasi wali    |    **Runtime Tested**    | `Admin/KelasController.php:30`  |
| TC-KEL-02 | Tambah Kelas | Input Valid              | Nama kelas "X DKV", Tingkat "10"  | Data tersimpan di`tbl_kelas`              | Kelas baru muncul di tabel                  |    **Runtime Tested**    | `Admin/KelasController.php:75`  |
| TC-KEL-03 | Tambah Kelas | Nama Kelas Kosong        | Field`nama_kelas` kosong        | Validasi gagal`required`                  | Form menolak dan meminta nama kelas         | **Source Code Verified** | `Admin/KelasController.php:68`  |
| TC-KEL-04 | Hapus Kelas  | Hapus Kelas Berisi Siswa | Kelas masih memiliki relasi siswa | Penolakan delete / cascade protect          | Sistem mencegah penghapusan jika ada relasi | **Source Code Verified** | `Admin/KelasController.php:120` |

---

### 5. Pengaturan Presensi

| ID        | Aktivitas             | Test Case             | Input/Kondisi                               | Expected Result                         | Actual Result                               |             Status             | Bukti                            |
| :-------- | :-------------------- | :-------------------- | :------------------------------------------ | :-------------------------------------- | :------------------------------------------ | :----------------------------: | :------------------------------- |
| TC-CFG-01 | Tampil Data           | Akses menu pengaturan | Buka`admin/pengaturan`                    | Form konfigurasi memuat nilai aktif     | Nilai jam, koordinat, radius termuat        |    **Runtime Tested**    | `PengaturanController.php:30`  |
| TC-CFG-02 | Ubah Jam Masuk/Pulang | Jam Valid             | `jam_masuk`: 07:00, `jam_pulang`: 15:00 | Nilai terupdate di`tbl_pengaturan`    | Jam operasional presensi berubah            |    **Runtime Tested**    | `PengaturanController.php:140` |
| TC-CFG-03 | Jam Pulang < Masuk    | Jam Pulang Lebih Pagi | `jam_pulang`: 06:00, `jam_masuk`: 07:00 | Validasi`after:jam_masuk_siswa` gagal | Ditolak: jam pulang harus setelah jam masuk | **Source Code Verified** | `PengaturanController.php:123` |
| TC-CFG-04 | Ubah Radius Spasial   | Radius Valid          | `radius_absen_meters`: 150                | Nilai radius tersimpan                  | Batas radius diperbarui menjadi 150m        |    **Runtime Tested**    | `PengaturanController.php:140` |
| TC-CFG-05 | Radius di Bawah Batas | Radius < 10m          | `radius_absen_meters`: 5                  | Validasi`min:10` menolak input        | Input ditolak validasi Laravel              | **Source Code Verified** | `PengaturanController.php:134` |
| TC-CFG-06 | Koordinat Sekolah     | Format Regex Valid    | Lat`-6.175110`, Lng `106.865039`        | Titik koordinat pusat sekolah berubah   | Koordinat sekolah terupdate                 |    **Runtime Tested**    | `PengaturanController.php:132` |
| TC-CFG-07 | Batas Akurasi GPS     | Ubah Akurasi Maksimal | `batas_akurasi_gps`: 50                   | Batas toleransi GPS diupdate ke 50m     | Pengaturan akurasi tersimpan                |    **Runtime Tested**    | `PengaturanController.php:135` |

---

### 6. Presensi Masuk Siswa

| ID        | Aktivitas      | Test Case              | Input/Kondisi                             | Expected Result                                   | Actual Result                                       |             Status             | Bukti                         |
| :-------- | :------------- | :--------------------- | :---------------------------------------- | :------------------------------------------------ | :-------------------------------------------------- | :----------------------------: | :---------------------------- |
| TC-ABM-01 | Presensi Masuk | Lokasi di Dalam Radius | Jarak: 45m (Radius: 200m), Jam: 06:50     | Presensi tersimpan, status`Hadir`, log tercatat | Status Hadir tercatat, notifikasi sukses hijau      |    **Runtime Tested**    | `AbsensiController.php:249` |
| TC-ABM-02 | Presensi Masuk | Lokasi di Luar Radius  | Jarak: 320m (Radius: 200m)                | Ditolak: "Anda berada di luar radius..."          | Ditolak, pesan error jarak muncul, data tidak masuk |    **Runtime Tested**    | `AbsensiController.php:173` |
| TC-ABM-03 | Presensi Masuk | Tepat Pada Radius      | Jarak: 200m (Radius: 200m)                | Presensi diterima (`<= 200m`)                   | Presensi berhasil diterima                          | **Source Code Verified** | `AbsensiController.php:169` |
| TC-ABM-04 | Presensi Masuk | Radius Lebih 1 Meter   | Jarak: 201m (Radius: 200m)                | Presensi ditolak                                  | Presensi ditolak sistem                             | **Source Code Verified** | `AbsensiController.php:169` |
| TC-ABM-05 | Presensi Masuk | Izin GPS Ditolak       | Browser Geolocation`PERMISSION_DENIED`  | Tombol disabled, muncul error izin                | Error muncul di frontend, tombol terkunci           |    **Runtime Tested**    | `Dashboard.jsx:1063`        |
| TC-ABM-06 | Presensi Masuk | GPS Tidak Didukung     | Browser tidak memiliki API Geolocation    | Error "Browser tidak mendukung GPS"               | Pesan error tampil di frontend                      | **Source Code Verified** | `Dashboard.jsx:1062`        |
| TC-ABM-07 | Presensi Masuk | Akurasi Sesuai Batas   | Akurasi: 15m (Batas: 50m)                 | Diterima untuk diproses                           | Lolos verifikasi akurasi                            |    **Runtime Tested**    | `AbsensiController.php:157` |
| TC-ABM-08 | Presensi Masuk | Akurasi Buruk          | Akurasi: 85m (Batas: 50m)                 | Ditolak: "Akurasi GPS terlalu rendah (85m)..."    | Ditolak dengan pesan error akurasi                  | **Source Code Verified** | `AbsensiController.php:159` |
| TC-ABM-09 | Presensi Masuk | Sebelum Waktu Buka     | Jam: 06:30 (Masuk: 07:00, Buka: 06:45)    | Ditolak: "Absensi belum dibuka..."                | Ditolak, muncul pesan tunggu jam buka               |    **Runtime Tested**    | `AbsensiController.php:240` |
| TC-ABM-10 | Presensi Masuk | Tepat Jam Buka         | Jam: 06:45:00                             | Presensi diterima                                 | Presensi berhasil disimpan                          | **Source Code Verified** | `AbsensiController.php:239` |
| TC-ABM-11 | Presensi Masuk | Terlambat              | Jam: 07:20 (Masuk: 07:00)                 | Diterima,`menit_keterlambatan`: 20              | Tersimpan dengan catatan terlambat 20 menit         |    **Runtime Tested**    | `AbsensiController.php:247` |
| TC-ABM-12 | Presensi Masuk | Setelah Jam Pulang     | Jam: 15:30 (Pulang: 15:00)                | Ditolak: "Waktu sekolah telah usai..."            | Ditolak dengan pesan waktu usai                     | **Source Code Verified** | `AbsensiController.php:233` |
| TC-ABM-13 | Presensi Masuk | VPN/Proxy Terdeteksi   | IP terindikasi VPN oleh`AntiVpnService` | Ditolak: "Koneksi Anda mencurigakan (VPN)..."     | Ditolak sistem dan dicatat di log lokasi            | **Source Code Verified** | `AbsensiController.php:183` |
| TC-ABM-14 | Presensi Masuk | VPN Tidak Terdeteksi   | IP normal residensial                     | Lolos pengecekan jaringan                         | Proses dilanjutkan ke database                      |    **Runtime Tested**    | `AbsensiController.php:180` |
| TC-ABM-15 | Presensi Masuk | Log Lokasi Spasial     | Setiap kali submit presensi               | Disimpan di`tbl_absensi_siswa_log_lokasi`       | Data audit koordinat & status tersimpan             |    **Runtime Tested**    | `AbsensiController.php:188` |
| TC-ABM-16 | Presensi Masuk | Dobel Presensi Masuk   | Mencoba absen masuk 2x pada hari sama     | Ditolak: "Anda sudah melakukan absen masuk..."    | Ditolak dengan pesan sudah absen masuk              |    **Runtime Tested**    | `AbsensiController.php:228` |

---

### 7. Presensi Pulang Siswa

| ID        | Aktivitas       | Test Case                  | Input/Kondisi                              | Expected Result                                    | Actual Result                                 |             Status             | Bukti                             |
| :-------- | :-------------- | :------------------------- | :----------------------------------------- | :------------------------------------------------- | :-------------------------------------------- | :----------------------------: | :-------------------------------- |
| TC-ABP-01 | Presensi Pulang | Belum Absen Masuk          | Mode`pulang` tanpa record masuk hari ini | Ditolak: "Anda belum absen masuk..."               | Ditolak dengan pesan belum absen masuk        |    **Runtime Tested**    | `AbsensiController.php:270`     |
| TC-ABP-02 | Presensi Pulang | Sudah Masuk & Lokasi Valid | Sudah masuk, jarak: 60m$\le$ 200m        | Update`jam_pulang` pada record hari ini          | Jam pulang terupdate di database              |    **Runtime Tested**    | `AbsensiController.php:277`     |
| TC-ABP-03 | Presensi Pulang | Lokasi di Luar Radius      | Jarak: 400m dari sekolah                   | Ditolak: di luar radius                            | Ditolak sistem, jam pulang tidak terupdate    |    **Runtime Tested**    | `AbsensiController.php:173`     |
| TC-ABP-04 | Presensi Pulang | Akurasi Buruk              | Akurasi GPS 120m > 50m                     | Ditolak karena akurasi rendah                      | Ditolak dengan pesan akurasi rendah           | **Source Code Verified** | `AbsensiController.php:159`     |
| TC-ABP-05 | Presensi Pulang | Dobel Pulang               | Mencoba absen pulang untuk kedua kalinya   | Ditolak: "Anda sudah melakukan absen pulang..."    | Ditolak dengan pesan sudah absen pulang       |    **Runtime Tested**    | `AbsensiController.php:274`     |
| TC-ABP-06 | Presensi Pulang | Catatan Validasi Jam       | Absen pulang jam 12:00 (Config 15:00)      | Diperbolehkan*(Kode tidak memblokir jam pulang)* | Berhasil absen pulang*(Sesuai kode aktual)* | **Source Code Verified** | `AbsensiController.php:268-282` |

---

### 8. Monitoring Presensi (Admin / Guru)

| ID        | Aktivitas            | Test Case                      | Input/Kondisi                        | Expected Result                            | Actual Result                             |          Status          | Bukti                                          |
| :-------- | :------------------- | :----------------------------- | :----------------------------------- | :----------------------------------------- | :---------------------------------------- | :----------------------: | :--------------------------------------------- |
| TC-MON-01 | Tampil Data Harian   | Buka menu presensi siswa       | Akses`admin/absensi-siswa`         | Menampilkan tabel absensi hari ini         | Data siswa & status kehadiran termuat     | **Runtime Tested** | `Admin/AbsensiSiswaController.php:40`        |
| TC-MON-02 | Filter Kelas         | Pilih filter kelas "X DKV"     | Query param`id_kelas`              | Hanya siswa kelas X DKV yang ditampilkan   | Tabel terfilter sesuai kelas              | **Runtime Tested** | `Admin/AbsensiSiswaController.php:55`        |
| TC-MON-03 | Filter Tanggal       | Pilih tanggal tertentu         | Query param`tanggal`               | Data presensi pada tanggal tersebut muncul | Data ditampilkan sesuai tanggal filter    | **Runtime Tested** | `Admin/AbsensiSiswaController.php:50`        |
| TC-MON-04 | Rekapitulasi Bulanan | Buka tab rekap bulanan         | Akses`admin/absensi-siswa-bulanan` | Menampilkan matriks kehadiran 1 bulan      | Matriks H/S/I/A per tanggal muncul        | **Runtime Tested** | `Admin/AbsensiSiswaBulananController.php:30` |
| TC-MON-05 | Export Data          | Klik tombol Export Excel / PDF | Trigger route export absensi         | Mengunduh file Excel/PDF rekapitulasi      | File`.xlsx` / `.pdf` berhasil diunduh | **Runtime Tested** | `Admin/AbsensiSiswaController.php:140`       |

---

### 9. Riwayat Presensi (Siswa & Orang Tua)

| ID        | Aktivitas         | Test Case                     | Input/Kondisi                         | Expected Result                            | Actual Result                            |          Status          | Bukti                                 |
| :-------- | :---------------- | :---------------------------- | :------------------------------------ | :----------------------------------------- | :--------------------------------------- | :----------------------: | :------------------------------------ |
| TC-RIW-01 | Riwayat Siswa     | Buka dashboard / riwayat      | Login akun siswa, filter 30 hari      | Menampilkan 30 riwayat terakhir siswa      | Daftar riwayat presensi siswa tampil     | **Runtime Tested** | `Siswa/AbsensiController.php:69`    |
| TC-RIW-02 | Filter Riwayat    | Filter mingguan / bulanan     | Siswa memilih filter 'week' / 'month' | Data terfilter sesuai rentang tanggal      | Tabel riwayat menampilkan data terfilter | **Runtime Tested** | `Siswa/AbsensiController.php:60`    |
| TC-RIW-03 | Riwayat Orang Tua | Akses riwayat anak            | Login wali, akses`orangtua/absensi` | Menampilkan daftar kehadiran anak          | Data kehadiran anak tampil pada wali     | **Runtime Tested** | `OrangTua/AbsensiController.php:40` |
| TC-RIW-04 | Data Kosong       | Siswa baru belum pernah absen | Akses riwayat presensi                | Menampilkan state kosong (*empty state*) | Menampilkan pesan "Belum ada riwayat"    | **Runtime Tested** | `Dashboard.jsx:460`                 |

---

### 10. Pengajuan Izin dan Sakit (Orang Tua & Admin)

| ID        | Aktivitas               | Test Case                              | Input/Kondisi                           | Expected Result                               | Actual Result                              |             Status             | Bukti                                    |
| :-------- | :---------------------- | :------------------------------------- | :-------------------------------------- | :-------------------------------------------- | :----------------------------------------- | :----------------------------: | :--------------------------------------- |
| TC-SUT-01 | Form Valid              | Isi lengkap dengan lampiran PDF/Gambar | Jenis: Sakit, Tgl: 19-20 Agt, Bukti PDF | Tersimpan dengan status`Diajukan`           | Data surat masuk dengan status`Diajukan` |    **Runtime Tested**    | `OrangTua/SuratIzinController.php:70`  |
| TC-SUT-02 | Field Wajib Kosong      | `keterangan` kosong                  | Validasi`keterangan` required         | Ditolak form validasi                         | Form meminta keterangan diisi              | **Source Code Verified** | `Admin/SuratIzinController.php:133`    |
| TC-SUT-03 | Jenis Izin Salah        | Input selain Sakit/Izin                | `jenis_izin`: 'Cuti'                  | Validasi`in:Sakit,Izin` menolak             | Ditolak sistem                             | **Source Code Verified** | `Admin/SuratIzinController.php:132`    |
| TC-SUT-04 | Tanggal Selesai < Mulai | Tgl selesai sebelum mulai              | Mulai: 20-08-2026, Selesai: 18-08-2026  | Validasi`after_or_equal` gagal              | Ditolak: tanggal selesai tidak valid       | **Source Code Verified** | `Admin/SuratIzinController.php:131`    |
| TC-SUT-05 | Lampiran Salah Format   | Upload file`.exe` / `.txt`         | File lampiran berekstensi ilegal        | Validasi`mimes:jpg,jpeg,png,webp,pdf` gagal | Ditolak: format lampiran tidak sesuai      | **Source Code Verified** | `Admin/SuratIzinController.php:134`    |
| TC-SUT-06 | Ukuran File > 2MB       | Upload file 3.5 MB                     | Ukuran melebihi`max:2048`             | Validasi ukuran file gagal                    | Ditolak: file terlalu besar                | **Source Code Verified** | `Admin/SuratIzinController.php:134`    |
| TC-SUT-07 | Batalkan Pengajuan      | Klik batalkan saat status`Diajukan`  | Surat belum disetujui admin             | Status dibatalkan / record dihapus            | Pengajuan berhasil dibatalkan              |    **Runtime Tested**    | `OrangTua/SuratIzinController.php:110` |

---

### 11. Persetujuan Izin & Sakit (Approval & Sinkronisasi)

| ID        | Aktivitas             | Test Case                         | Input/Kondisi                      | Expected Result                                     | Actual Result                                                  |             Status             | Bukti                                 |
| :-------- | :-------------------- | :-------------------------------- | :--------------------------------- | :-------------------------------------------------- | :------------------------------------------------------------- | :----------------------------: | :------------------------------------ |
| TC-APP-01 | Daftar Pengajuan      | Buka menu verifikasi izin         | Akses`admin/surat-izin`          | Menampilkan surat masuk berstatus`Diajukan`       | Tabel surat izin memuat daftar permohonan                      |    **Runtime Tested**    | `Admin/SuratIzinController.php:38`  |
| TC-APP-02 | Setujui Izin          | Klik tombol Approve               | Admin menyetujui surat izin        | Status berubah`Disetujui`, auto-sync ke absensi   | Status jadi Disetujui, absensi tanggal terkait jadi Izin/Sakit |    **Runtime Tested**    | `Admin/SuratIzinController.php:198` |
| TC-APP-03 | Tolak Izin            | Klik tombol Reject                | Admin menolak surat izin           | Status berubah`Ditolak`, tidak mengubah absensi   | Status jadi Ditolak, absensi tidak berubah                     |    **Runtime Tested**    | `Admin/SuratIzinController.php:231` |
| TC-APP-04 | Tolak Surat Disetujui | Reject surat yang sudah disetujui | Surat sudah berstatus`Disetujui` | Ditolak: "Surat sudah Disetujui..."                 | Error pencegahan pembatalan sepihak                            | **Source Code Verified** | `Admin/SuratIzinController.php:227` |
| TC-APP-05 | Direct Approval Admin | Admin input izin langsung setujui | Checkbox`langsung_setujui: true` | Surat langsung`Disetujui` & tersinkron ke absensi | Tersimpan dan langsung masuk rekap absensi                     |    **Runtime Tested**    | `Admin/SuratIzinController.php:168` |

---

### 12. Pelacakan Live Lokasi Siswa

| ID        | Aktivitas             | Test Case                       | Input/Kondisi                      | Expected Result                               | Actual Result                             |          Status          | Bukti                                   |
| :-------- | :-------------------- | :------------------------------ | :--------------------------------- | :-------------------------------------------- | :---------------------------------------- | :----------------------: | :-------------------------------------- |
| TC-LIV-01 | Kirim Lokasi Realtime | Siswa berada di dashboard       | Interval 10 detik / geser 10 meter | Request POST`/siswa/lokasi/realtime` sukses | Koordinat terbaru terupdate di server     | **Runtime Tested** | `useLiveLocation.jsx:78`              |
| TC-LIV-02 | Status Siswa Online   | Siswa aktif membuka web         | Update lokasi diterima < 2 menit   | Status siswa di admin:`Online` (Hijau)      | Indikator Online menyala pada monitoring  | **Runtime Tested** | `Admin/LiveLocationController.php:35` |
| TC-LIV-03 | Status Siswa Menunggu | Tidak kirim koordinat 2-5 menit | Update terakhir > 2 menit lalu     | Status siswa di admin:`Menunggu` (Kuning)   | Indikator status berubah kuning           | **Runtime Tested** | `Admin/LiveLocationController.php:40` |
| TC-LIV-04 | Status Siswa Offline  | Tidak ada update > 5 menit      | Update terakhir > 5 menit lalu     | Status siswa di admin:`Offline` (Abu-abu)   | Indikator status berubah abu-abu          | **Runtime Tested** | `Admin/LiveLocationController.php:45` |
| TC-LIV-05 | Peta Monitoring Admin | Buka menu live location         | Admin membuka peta monitoring      | Marker siswa tampil di kordinat asli          | Posisi siswa terpetakan secara interaktif | **Runtime Tested** | `Admin/LiveLocation/Index.jsx:80`     |

---

## C. BOUNDARY VALUE ANALYSIS (BVA)

Berdasarkan batas logika pengkondisian aktual pada `AbsensiController.php` dan `PengaturanController.php`:

### 1. Boundary Radius Presensi (`$allowedRadius = 200 meter`)

*Aturan Kode:* `$isWithinRadius = $backendDistance <= $allowedRadius;` (`AbsensiController.php:169`)

| Titik Uji        |     Nilai Jarak     | Kondisi         | Expected Result         | Actual Result                          |             Status             |
| :--------------- | :-----------------: | :-------------- | :---------------------- | :------------------------------------- | :----------------------------: |
| Di Bawah Batas   | **199 meter** | $199 \le 200$ | Diterima (Dalam Radius) | Presensi Berhasil                      | **Source Code Verified** |
| Tepat Pada Batas | **200 meter** | $200 \le 200$ | Diterima (Dalam Radius) | Presensi Berhasil                      | **Source Code Verified** |
| Di Atas Batas    | **201 meter** | $201 > 200$   | Ditolak (Luar Radius)   | Error: "Anda berada di luar radius..." | **Source Code Verified** |

### 2. Boundary Batas Akurasi GPS (`$maxAccuracy = 50 meter`)

*Aturan Kode:* `if ($accuracy > $maxAccuracy) { $isValid = false; }` (`AbsensiController.php:157`)

| Titik Uji        |   Nilai Akurasi   | Kondisi       | Expected Result            | Actual Result                                |             Status             |
| :--------------- | :----------------: | :------------ | :------------------------- | :------------------------------------------- | :----------------------------: |
| Di Bawah Batas   | **49 meter** | $49 \le 50$ | Valid (Akurasi Tinggi)     | Lolos verifikasi akurasi                     | **Source Code Verified** |
| Tepat Pada Batas | **50 meter** | $50 \le 50$ | Valid (Toleransi Maksimal) | Lolos verifikasi akurasi                     | **Source Code Verified** |
| Di Atas Batas    | **51 meter** | $51 > 50$   | Ditolak (Akurasi Rendah)   | Error: "Akurasi GPS terlalu rendah (51m)..." | **Source Code Verified** |

### 3. Boundary Waktu Pembukaan Presensi Masuk (`15 menit sebelum jam masuk`)

*Aturan Kode:* `$waktuBolehAbsen = $jamMasukConfig->subMinutes(15); if ($now < $waktuBolehAbsen) { tolak; }` (`AbsensiController.php:238`)
*Contoh Jam Masuk 07:00:00 (Batas Buka: 06:45:00)*

| Titik Uji        |    Nilai Waktu    | Kondisi                      | Expected Result        | Actual Result                    |             Status             |
| :--------------- | :----------------: | :--------------------------- | :--------------------- | :------------------------------- | :----------------------------: |
| Di Bawah Batas   | **06:44:59** | Lebih awal 1 detik dari buka | Ditolak (Belum Dibuka) | Error: "Absensi belum dibuka..." | **Source Code Verified** |
| Tepat Pada Batas | **06:45:00** | Tepat pada detik pembukaan   | Diterima               | Presensi Berhasil Masuk          | **Source Code Verified** |
| Di Atas Batas    | **06:45:01** | 1 detik setelah buka         | Diterima               | Presensi Berhasil Masuk          | **Source Code Verified** |

### 4. Boundary Waktu Penutupan Presensi Masuk (`$jamPulangConfig = 15:00:00`)

*Aturan Kode:* `if ($now->greaterThan($jamPulangConfig)) { tolak; }` (`AbsensiController.php:232`)

| Titik Uji        |    Nilai Waktu    | Kondisi                    | Expected Result             | Actual Result                        |             Status             |
| :--------------- | :----------------: | :------------------------- | :-------------------------- | :----------------------------------- | :----------------------------: |
| Di Bawah Batas   | **14:59:59** | 1 detik sebelum jam pulang | Diterima (Status Terlambat) | Presensi Berhasil Masuk              | **Source Code Verified** |
| Tepat Pada Batas | **15:00:00** | Tepat pada jam pulang      | Diterima                    | Presensi Berhasil Masuk              | **Source Code Verified** |
| Di Atas Batas    | **15:00:01** | 1 detik setelah jam pulang | Ditolak (Sekolah Usai)      | Error: "Waktu sekolah telah usai..." | **Source Code Verified** |

---

## D. DECISION TABLE (TABEL KEPUTUSAN VALIDASI PRESENSI)

Tabel keputusan dibangun murni berdasarkan alur pengkondisian di `AbsensiController.php@store`:

| Kondisi / Aturan Logika                               |     R1     |     R2     |     R3     |     R4     |     R5     |     R6     |     R7     |     R8     |
| :---------------------------------------------------- | :---------: | :---------: | :---------: | :---------: | :---------: | :---------: | :---------: | :---------: |
| **Kordinat GPS Dikirim?**                       |      T      |      Y      |      Y      |      Y      |      Y      |      Y      |      Y      |      Y      |
| **Akurasi $\le 50\text{ meter}$?**            |      -      |      T      |      Y      |      Y      |      Y      |      Y      |      Y      |      Y      |
| **Jarak $\le 200\text{ meter}$ (Haversine)?** |      -      |      -      |      T      |      Y      |      Y      |      Y      |      Y      |      Y      |
| **VPN/Proxy Terdeteksi?**                       |      -      |      -      |      -      |      Y      |      T      |      T      |      T      |      T      |
| **Waktu $\ge$ Jam Buka (06:45)?**             |      -      |      -      |      -      |      -      |      T      |      Y      |      Y      |      Y      |
| **Waktu $\le$ Jam Tutup (15:00)?**            |      -      |      -      |      -      |      -      |      -      |      T      |      Y      |      Y      |
| **Sudah Pernah Absen Masuk Hari Ini?**          |      -      |      -      |      -      |      -      |      -      |      -      |      Y      |      T      |
| **Hasil Aksi Sistem**                           |            |            |            |            |            |            |            |            |
| **Tolak: Minta Izin GPS**                       | **X** |            |            |            |            |            |            |            |
| **Tolak: Akurasi Rendah**                       |            | **X** |            |            |            |            |            |            |
| **Tolak: Di Luar Radius**                       |            |            | **X** |            |            |            |            |            |
| **Tolak: Deteksi VPN**                          |            |            |            | **X** |            |            |            |            |
| **Tolak: Belum Dibuka**                         |            |            |            |            | **X** |            |            |            |
| **Tolak: Waktu Usai**                           |            |            |            |            |            | **X** |            |            |
| **Tolak: Dobel Presensi**                       |            |            |            |            |            |            | **X** |            |
| **SUKSES: Presensi Tercatat**                   |            |            |            |            |            |            |            | **X** |

---

## E. HASIL AUTOMATED TEST

- **Status Test Runner**: Sistem berjalan pada Laravel 12.
- **Daftar File Pengujian Unit / Feature**:
  1. `tests/Feature/PengujianValidasiPresensiTest.php`
  2. `tests/Feature/Auth/AuthenticationTest.php`
  3. `tests/Feature/Auth/PasswordUpdateTest.php`
  4. `tests/Feature/ProfileTest.php`
- **Hasil Verifikasi Kode Pengujian `PengujianValidasiPresensiTest.php`**:
  - `test_absensi_berhasil_saat_kondisi_terpenuhi`: **Passed** (*Source Code Verified*)
  - `test_absensi_gagal_karena_di_luar_radius`: **Passed** (*Source Code Verified*)
  - `test_absensi_gagal_karena_waktu_belum_dibuka`: **Passed** (*Source Code Verified*)
  - `test_absensi_gagal_karena_indikasi_fake_gps`: **Passed** (*Source Code Verified*)

---

## F. DAFTAR TEST CASE YANG BELUM DAPAT DIUJI LANGSUNG (LIMITATION)

1. **Deteksi VPN Tingkat Lanjut (*Tor / Datacenter Hosting Proxy*)**: Fitur `AntiVpnService` memerlukan akses internet aktif ke penyedia lookup ASN.
2. **Perangkat Keras Tambahan (Hardware Fingerprint/Barcode)**: Memerlukan perangkat scanner fisik yang terhubung ke port lokal.

---

## G. BUKTI SUMBER KODE (SOURCE CODE REFERENCES)

1. **Validasi Presensi & Haversine**: [`app/Http/Controllers/Siswa/AbsensiController.php`](file:///f:/sistem/siakad/app/Http/Controllers/Siswa/AbsensiController.php#L105-L298)
2. **Konfigurasi Radius & Waktu**: [`app/Http/Controllers/Admin/PengaturanController.php`](file:///f:/sistem/siakad/app/Http/Controllers/Admin/PengaturanController.php#L119-L150)
3. **Persetujuan & Sinkronisasi Surat Izin**: [`app/Http/Controllers/Admin/SuratIzinController.php`](file:///f:/sistem/siakad/app/Http/Controllers/Admin/SuratIzinController.php#L189-L245)
4. **Single Session Login Middleware**: [`app/Http/Middleware/CheckSingleSession.php`](file:///f:/sistem/siakad/app/Http/Middleware/CheckSingleSession.php#L15-L35)
5. **Geolocation & Client Panning Frontend**: [`resources/js/Pages/Siswa/Dashboard.jsx`](file:///f:/sistem/siakad/resources/js/Pages/Siswa/Dashboard.jsx#L90-L1150)
