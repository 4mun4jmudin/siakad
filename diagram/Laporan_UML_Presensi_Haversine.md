# Laporan Analisis dan Perancangan UML Sistem Presensi Siswa

**(Fokus: Validasi Lokasi dengan Algoritma Haversine)**

---

## 1. Daftar Final 7 Use Case dan Aktornya

Sesuai dengan analisis source code dan batasan penelitian, berikut adalah 7 Use Case utama yang berfokus pada sistem presensi siswa:

1. **Login**
   - **Aktor:** Administrator, Guru, Siswa, Orang Tua/Wali
   - **Deskripsi:** Proses otentikasi untuk masuk ke dalam sistem SIAKAD sesuai hak akses.
2. **Kelola Data Master**
   - **Aktor:** Administrator
   - **Deskripsi:** Mengelola data pendukung presensi (Siswa, Kelas, Guru) dan melakukan pengaturan jam sekolah serta koordinat lokasi (latitude/longitude) dan radius presensi.
3. **Presensi Masuk**
   - **Aktor:** Siswa
   - **Deskripsi:** Proses siswa melakukan absensi masuk menggunakan Geolocation browser. Sistem menghitung jarak menggunakan *Haversine*, memeriksa batas radius, mendeteksi VPN/Proxy, dan mencatat log kehadiran.
4. **Presensi Pulang**
   - **Aktor:** Siswa
   - **Deskripsi:** Proses absensi saat pulang sekolah. Membutuhkan data presensi masuk pada hari yang sama dan meng-update jam pulang.
5. **Monitoring Presensi**
   - **Aktor:** Administrator, Guru
   - **Deskripsi:** Memantau rekapitulasi kehadiran siswa (harian maupun bulanan) serta melihat persentase kehadiran.
6. **Melihat Riwayat Presensi**
   - **Aktor:** Siswa, Orang Tua/Wali
   - **Deskripsi:** Mengakses riwayat kehadiran individu berdasarkan filter (mingguan, bulanan, tahunan) beserta statusnya.
7. **Pengajuan Izin dan Sakit**
   - **Aktor:** Orang Tua/Wali, Guru
   - **Deskripsi:** Proses pengajuan ketidakhadiran dengan melampirkan surat. Jika disetujui, sistem akan otomatis melakukan sinkronisasi dengan tabel absensi.

---

## 2. Use Case Diagram

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam monochrome true
skinparam shadowing false

actor Administrator as Admin
actor Guru
actor Siswa
actor "Orang Tua/Wali" as Wali

rectangle "Sistem Presensi Siswa (Haversine)" {
    usecase "Login" as UC1
    usecase "Kelola Data Master\n(Siswa, Guru, Pengaturan)" as UC2
    usecase "Presensi Masuk\n(Validasi Haversine)" as UC3
    usecase "Presensi Pulang" as UC4
    usecase "Monitoring Presensi" as UC5
    usecase "Melihat Riwayat Presensi" as UC6
    usecase "Pengajuan Izin dan Sakit" as UC7
}

Admin --> UC1
Guru --> UC1
Siswa --> UC1
Wali --> UC1

Admin --> UC2
Admin --> UC5
Guru --> UC5

Siswa --> UC3
Siswa --> UC4

Siswa --> UC6
Wali --> UC6

Wali --> UC7
Guru --> UC7
@enduml
```

---

## 3. Activity Diagram: Login

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|User (Aktor)|
start
:Buka Halaman Login;
:Masukkan Username & Password;
:Klik Tombol Login;

|Sistem|
:Validasi Kredensial di Database;
if (Kredensial Valid?) then (Ya)
  :Cek Role User;
  :Generate Session/Token Auth;
  :Redirect ke Dashboard sesuai Role;
else (Tidak)
  :Tampilkan Pesan Error;
  |User (Aktor)|
  :Kembali ke Form Login;
  stop
endif

|User (Aktor)|
:Menampilkan Halaman Dashboard;
stop
@enduml
```

---

## 4. Activity Diagram: Kelola Data Master

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|Administrator|
start
:Akses Menu Pengaturan / Data Master;
:Pilih Form Pengaturan Absensi;
:Input/Update Jam Masuk & Pulang;
:Input/Update Latitude & Longitude Sekolah;
:Input Radius Absensi (Meters);
:Klik Simpan;

|Sistem|
:Validasi Data Input;
if (Valid?) then (Ya)
  :Update tabel tbl_pengaturan;
  :Tampilkan Notifikasi Berhasil;
else (Tidak)
  :Tampilkan Pesan Error Validasi;
endif

|Administrator|
stop
@enduml
```

---

## 5. Activity Diagram: Presensi Masuk

*(Fokus pada proses pengambilan lokasi, Haversine, dan validasi radius)*

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|Siswa|
start
:Akses Menu Absensi;
:Browser meminta akses Geolocation;
if (Izin Diberikan?) then (Ya)
  :Ambil Latitude, Longitude, & Accuracy;
  :Klik Tombol "Absen Masuk";
else (Tidak)
  :Tampilkan Error "Lokasi tidak terdeteksi";
  stop
endif

|Sistem|
:Terima Request Absen Masuk;
:Ambil Pengaturan (Jam, Lat/Lng Sekolah, Radius, Akurasi Max);
:Cek Batas Waktu Absen;

if (Waktu Sesuai?) then (Ya)
  :Hitung Jarak (Haversine Algorithm) 
  antara Lokasi Siswa & Sekolah;
  
  if (Jarak <= Radius && Akurasi <= Max Akurasi?) then (Ya)
    :Cek Anti-VPN/Proxy;
    if (Terdeteksi VPN/Proxy?) then (Ya)
      :Tolak Absensi (Pesan Mencurigakan);
    else (Tidak)
      :Simpan data ke tbl_absensi_siswa_log_lokasi;
      :Simpan data kehadiran ke tbl_absensi_siswa 
      (Status: Hadir, Waktu Masuk, Keterlambatan);
      :Tampilkan Pesan Sukses;
    endif
  else (Tidak)
    :Tolak Absensi (Di luar radius / Akurasi rendah);
  endif
else (Tidak)
  :Tolak Absensi (Diluar jam operasional);
endif

|Siswa|
:Melihat Notifikasi Hasil Absensi;
stop
@enduml
```

---

## 6. Activity Diagram: Presensi Pulang

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|Siswa|
start
:Akses Menu Absensi;
:Ambil Lokasi via Geolocation (Lat/Lng);
:Klik Tombol "Absen Pulang";

|Sistem|
:Terima Request Absen Pulang;
:Cek apakah sudah Absen Masuk hari ini?;
if (Sudah Absen Masuk?) then (Ya)
  :Cek apakah sudah Absen Pulang?;
  if (Belum Absen Pulang?) then (Ya)
    :Simpan Log Lokasi ke tbl_absensi_siswa_log_lokasi;
    :Update jam_pulang di tbl_absensi_siswa;
    :Tampilkan Pesan Sukses Absen Pulang;
  else (Tidak)
    :Tolak Absensi (Sudah absen pulang);
  endif
else (Tidak)
  :Tolak Absensi (Belum absen masuk);
endif

|Siswa|
stop
@enduml
```

---

## 7. Activity Diagram: Monitoring Presensi

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|Admin / Guru|
start
:Akses Menu Monitoring Absensi;
:Pilih Filter (Kelas, Tanggal, Bulan);

|Sistem|
:Ambil Data tbl_siswa berdasarkan Kelas;
:Ambil Data tbl_absensi_siswa;
:Kalkulasi Statistik (Hadir, Izin, Sakit, Alfa, Terlambat);
:Kembalikan Data Rekap & Daftar Siswa;

|Admin / Guru|
:Melihat Data Rekapitulasi di Dashboard;
:Memilih Opsi Export (PDF/Excel) - Opsional;

if (Export Data?) then (Ya)
  |Sistem|
  :Generate File Export;
  :Download File;
  |Admin / Guru|
endif
stop
@enduml
```

---

## 8. Activity Diagram: Melihat Riwayat Presensi

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|Siswa / Wali|
start
:Akses Halaman Riwayat Kehadiran;
:Pilih Filter Waktu (Minggu/Bulan/Tahun);

|Sistem|
:Query ke tbl_absensi_siswa berdasarkan id_siswa;
:Terapkan Filter Tanggal;
:Ambil Data Riwayat & Statistik;
:Tampilkan Data ke Frontend;

|Siswa / Wali|
:Melihat Daftar Riwayat Presensi;
stop
@enduml
```

---

## 9. Activity Diagram: Pengajuan Izin dan Sakit

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false

|Orang Tua/Wali|
start
:Akses Menu Pengajuan Izin;
:Isi Form (Tanggal, Jenis Izin, Keterangan);
:Upload Lampiran Surat;
:Submit Form;

|Sistem|
:Validasi Data & Simpan File Lampiran;
:Buat record di tbl_surat_izin (Status: Diajukan);
:Kirim Notifikasi ke Guru/Admin;

|Guru / Admin|
:Melihat Daftar Pengajuan Izin;
:Verifikasi Surat;
if (Approve?) then (Ya)
  |Sistem|
  :Update status Surat Izin menjadi "Disetujui";
  :Sinkronisasi (Auto-insert) ke tbl_absensi_siswa 
  (Status: Izin/Sakit pada tanggal terkait);
else (Tidak)
  |Sistem|
  :Update status Surat Izin menjadi "Ditolak";
endif

|Sistem|
:Kirim Notifikasi Hasil ke Orang Tua/Wali;
stop
@enduml
```

---

## 10. Sequence Diagram: Login

```plantuml
@startuml
skinparam monochrome true
actor User
boundary "Login Page" as UI
control "AuthController" as C
entity "User Model" as M
database "DB: users" as DB

User -> UI : Memasukkan Username & Password
UI -> C : POST /login (credentials)
C -> M : Attempt Auth
M -> DB : Query user & hash check
DB --> M : Return Result
M --> C : Authentication Status
alt Auth Success
    C -> C : Check Role & Generate Session
    C --> UI : Redirect to Dashboard
    UI --> User : Menampilkan Dashboard
else Auth Failed
    C --> UI : Error Response
    UI --> User : Tampilkan Pesan Error
end
@enduml
```

---

## 11. Sequence Diagram: Kelola Data Master

```plantuml
@startuml
skinparam monochrome true
actor Administrator as Admin
boundary "Pengaturan Page" as UI
control "PengaturanController" as C
entity "Pengaturan Model" as M
database "DB: tbl_pengaturan" as DB

Admin -> UI : Mengisi Data (Jam Sekolah, Lat, Lng, Radius)
UI -> C : POST /pengaturan
C -> C : Validate Request
C -> M : updateOrCreate()
M -> DB : UPDATE data
DB --> M : Query Success
M --> C : Return object
C --> UI : Success Response
UI --> Admin : Notifikasi Berhasil
@enduml
```

---

## 12. Sequence Diagram: Presensi Masuk (Fokus Haversine)

```plantuml
@startuml
skinparam monochrome true
actor Siswa
boundary "Absensi Page (React)" as UI
control "AbsensiController" as C
entity "AntiVpnService" as VPN
entity "Pengaturan Model" as P
entity "AbsensiSiswa Model" as AS
entity "AbsensiSiswaLogLokasi" as Log
database "Database" as DB

Siswa -> UI : Izinkan Lokasi & Klik "Absen Masuk"
UI -> UI : navigator.geolocation.getCurrentPosition()
UI -> C : POST /siswa/absensi (mode:masuk, lat, lng, accuracy)

C -> P : first() (Ambil Pengaturan)
P -> DB : SELECT lat, lng, radius
DB --> P : Data Pengaturan
P --> C : Return Pengaturan

C -> C : calculateDistance(lat_siswa, lng_siswa, lat_sekolah, lng_sekolah) [Haversine]
C -> VPN : checkIp(clientIp)
VPN --> C : vpn_status

alt VPN Detected / Diluar Radius / Akurasi Rendah
    C -> Log : insert() log gagal
    Log -> DB : INSERT log
    C --> UI : Return Error (Diluar radius / VPN terdeteksi)
    UI --> Siswa : Tampilkan Error
else Lokasi Valid
    C -> Log : insert() log sukses
    Log -> DB : INSERT log
    C -> AS : create(id_siswa, tanggal, jam_masuk, dll)
    AS -> DB : INSERT tbl_absensi_siswa
    DB --> AS : Success
    AS --> C : Record Created
    C --> UI : Return Success
    UI --> Siswa : Tampilkan Pesan Sukses
end
@enduml
```

---

## 13. Sequence Diagram: Presensi Pulang

```plantuml
@startuml
skinparam monochrome true
actor Siswa
boundary "Absensi Page" as UI
control "AbsensiController" as C
entity "AbsensiSiswa Model" as AS
database "DB: tbl_absensi_siswa" as DB

Siswa -> UI : Klik "Absen Pulang"
UI -> UI : Get Geolocation
UI -> C : POST /siswa/absensi (mode:pulang, lat, lng)
C -> AS : Check existing "Absen Masuk" today
AS -> DB : SELECT * WHERE id_siswa, tanggal
DB --> AS : Return Data
AS --> C : AbsensiRecord

alt Belum Absen Masuk
    C --> UI : Return Error "Belum absen masuk"
else Sudah Absen Masuk
    C -> AS : update(jam_pulang = now)
    AS -> DB : UPDATE tbl_absensi_siswa
    DB --> AS : Success
    C --> UI : Return Success
    UI --> Siswa : Tampilkan Pesan Sukses Pulang
end
@enduml
```

---

## 14. Sequence Diagram: Monitoring Presensi

```plantuml
@startuml
skinparam monochrome true
actor "Admin / Guru" as Aktor
boundary "Monitoring Page" as UI
control "AbsensiSiswaController" as C
entity "Siswa Model" as S
entity "AbsensiSiswa Model" as AS
database "Database" as DB

Aktor -> UI : Buka Menu Absensi (Filter: Kelas/Bulan)
UI -> C : GET /admin/absensi-siswa?kelas=X&tanggal=Y
C -> S : Get Siswa di Kelas tsb
S -> DB : SELECT tbl_siswa
DB --> S : Return Siswa
C -> AS : Query Data Absensi Harian/Bulanan
AS -> DB : SELECT tbl_absensi_siswa (Hadir, Sakit, Izin)
DB --> AS : Return Data
C -> C : Kalkulasi Rekap & Persentase
C --> UI : Render Data (Inertia Props)
UI --> Aktor : Tampilkan Tabel & Rekapitulasi
@enduml
```

---

## 15. Sequence Diagram: Melihat Riwayat Presensi

```plantuml
@startuml
skinparam monochrome true
actor "Siswa / Wali" as Siswa
boundary "Riwayat Page" as UI
control "AbsensiController (Siswa)" as C
entity "AbsensiSiswa Model" as AS
database "Database" as DB

Siswa -> UI : Akses Riwayat & Pilih Filter
UI -> C : GET /siswa/riwayat?filter=month
C -> AS : Query tbl_absensi_siswa WHERE id_siswa
AS -> DB : SELECT data
DB --> AS : Return Collection
C --> UI : Inertia Render (Data Riwayat)
UI --> Siswa : Tampilkan List Kehadiran
@enduml
```

---

## 16. Sequence Diagram: Pengajuan Izin dan Sakit

```plantuml
@startuml
skinparam monochrome true
actor "Orang Tua/Wali" as Wali
boundary "Form Izin" as UI
control "SuratIzinController" as C
entity "SuratIzin Model" as SI
entity "AbsensiSiswa Model" as AS
database "Database" as DB

Wali -> UI : Submit Form Izin & File Lampiran
UI -> C : POST /orangtua/surat-izin
C -> C : Upload & Save File
C -> SI : create(data_izin, status: Diajukan)
SI -> DB : INSERT tbl_surat_izin
C --> UI : Success (Menunggu Persetujuan)

== Proses Persetujuan oleh Guru/Admin ==
actor Guru
Guru -> C : POST /guru/surat-izin/{id}/approve
C -> SI : update(status: Disetujui)
SI -> DB : UPDATE tbl_surat_izin
C -> C : syncAbsensiDariSurat()
C -> AS : create/update (Hadir -> Izin/Sakit)
AS -> DB : INSERT/UPDATE tbl_absensi_siswa
C --> Guru : Approve Success
@enduml
```

---

## 17. Class Diagram (Final - Tracing dari Sequence)

Berdasarkan *tracing* objek yang muncul di dalam 7 Sequence Diagram di atas, maka Class Diagram yang terbentuk (berfokus pada modul absensi) adalah sebagai berikut:

```plantuml
@startuml
skinparam monochrome true
skinparam classAttributeIconSize 0

class User {
  + id_pengguna : string
  + username : string
  + role : string
  + attemptAuth()
}

class Siswa {
  + id_siswa : string
  + nis : string
  + nama_lengkap : string
  + id_kelas : string
  + status : string
}

class Guru {
  + id_guru : string
  + nip : string
  + nama_lengkap : string
}

class Pengaturan {
  + jam_masuk_siswa : time
  + jam_pulang_siswa : time
  + lokasi_sekolah_latitude : string
  + lokasi_sekolah_longitude : string
  + radius_absen_meters : int
  + batas_akurasi_gps : int
}

class AbsensiSiswa {
  + id_absensi : string
  + id_siswa : string
  + tanggal : date
  + jam_masuk : time
  + jam_pulang : time
  + status_kehadiran : string
  + menit_keterlambatan : int
  + metode_absen : string
}

class AbsensiSiswaLogLokasi {
  + id_siswa : string
  + latitude : string
  + longitude : string
  + accuracy : float
  + distance_meters : int
  + is_within_radius : boolean
  + vpn_detected : boolean
  + is_valid : boolean
}

class SuratIzin {
  + id_surat : int
  + id_siswa : string
  + tanggal_mulai_izin : date
  + tanggal_selesai_izin : date
  + jenis_izin : string
  + status_pengajuan : string
  + file_lampiran : string
  + id_penyetuju : string
}

class AntiVpnService {
  + checkIp(ip : string) : array
}

User "1" -- "1" Siswa : possesses >
User "1" -- "1" Guru : possesses >
Siswa "1" -- "*" AbsensiSiswa : memiliki >
Siswa "1" -- "*" AbsensiSiswaLogLokasi : mencatat >
Siswa "1" -- "*" SuratIzin : mengajukan >
SuratIzin "*" -- "1" Guru : disetujui oleh >
AbsensiSiswa "*" ..> "1" Pengaturan : bergantung pada batas >
AbsensiSiswaLogLokasi "*" ..> "1" AntiVpnService : divalidasi oleh >
@enduml
```

---

## 18. Tabel Tracing (Keterhubungan Antar Diagram)

| Use Case                | Activity Diagram                | Sequence Diagram                | Objek / Model yang Terlibat (Class)                                                        |
| ----------------------- | ------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| 1. Login                | Activity - Login                | Sequence - Login                | `User`, `Siswa`, `Guru`                                                              |
| 2. Kelola Data Master   | Activity - Kelola Data Master   | Sequence - Kelola Data Master   | `Pengaturan`                                                                             |
| 3. Presensi Masuk       | Activity - Presensi Masuk       | Sequence - Presensi Masuk       | `Siswa`, `Pengaturan`, `AbsensiSiswa`, `AbsensiSiswaLogLokasi`, `AntiVpnService` |
| 4. Presensi Pulang      | Activity - Presensi Pulang      | Sequence - Presensi Pulang      | `Siswa`, `AbsensiSiswa`, `AbsensiSiswaLogLokasi`                                     |
| 5. Monitoring Presensi  | Activity - Monitoring Presensi  | Sequence - Monitoring Presensi  | `Siswa`, `AbsensiSiswa`                                                                |
| 6. Melihat Riwayat      | Activity - Melihat Riwayat      | Sequence - Melihat Riwayat      | `Siswa`, `AbsensiSiswa`                                                                |
| 7. Pengajuan Izin/Sakit | Activity - Pengajuan Izin/Sakit | Sequence - Pengajuan Izin/Sakit | `Siswa`, `Guru`, `SuratIzin`, `AbsensiSiswa`                                       |

---

*Laporan ini diproduksi berdasarkan penelusuran source code dan ditujukan untuk memenuhi persyaratan sinkronisasi 7 Use Case, 7 Activity, 7 Sequence, dan 1 Class Diagram berfokus pada algoritma Haversine.*
