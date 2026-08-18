# REVISI FINAL: Laporan Analisis dan Perancangan UML Sistem Presensi Siswa

---

## 1. Hasil Audit Source Code

Berdasarkan pengecekan aktual terhadap source code aplikasi (terutama pada modul presensi), didapatkan temuan berikut yang akan menjadi landasan pembuatan UML:
1. **Presensi Masuk & Pulang**: Proses validasi lokasi menggunakan **Algoritma Haversine** (`calculateDistance`), pengecekan batas akurasi (`accuracy`), dan deteksi VPN/Proxy (`AntiVpnService`) dilakukan pada method `store()` di `AbsensiController.php` **SEBELUM** sistem membedakan apakah mode absensi yang dilakukan adalah `masuk` atau `pulang`. Oleh karena itu, **Presensi Pulang secara source code aktual juga melakukan validasi lokasi Haversine**. 
2. **Kelola Data Master**: Data master yang dikelola oleh Administrator dalam konteks pendukung presensi meliputi `Siswa`, `Guru`, `Kelas`, dan `Pengaturan` (yang menyimpan radius dan koordinat sekolah).
3. **Pengajuan Izin dan Sakit**: Controller `SuratIzinController` menunjukkan bahwa proses pengajuan (create) dilakukan dan disetujui (approve) oleh Guru.
4. **Model/Class yang tersedia**: `User`, `Siswa`, `Guru`, `Kelas`, `Pengaturan`, `AbsensiSiswa`, `SuratIzin`, `AbsensiSiswaLogLokasi` (log tabel yang disimpan langsung via query builder), dan layanan pihak ketiga `AntiVpnService`.

---

## 2. Daftar Final 7 Use Case dan Aktor

1. **Login** (Aktor: Administrator, Guru, Siswa, Orang Tua/Wali)
2. **Kelola Data Master** (Aktor: Administrator)
3. **Presensi Masuk** (Aktor: Siswa)
4. **Presensi Pulang** (Aktor: Siswa)
5. **Monitoring Presensi** (Aktor: Administrator, Guru)
6. **Melihat Riwayat Presensi** (Aktor: Siswa, Orang Tua/Wali)
7. **Pengajuan Izin dan Sakit** (Aktor: Orang Tua/Wali, Guru)

---

## 3. PlantUML Use Case Diagram

```plantuml
@startuml
left to right direction

actor Administrator
actor Guru
actor Siswa
actor "Orang Tua/Wali" as OrangTua

rectangle "Sistem Presensi Siswa" {

    usecase "Login" as UC1
    usecase "Kelola Data Master" as UC2
    usecase "Presensi Masuk" as UC3
    usecase "Presensi Pulang" as UC4
    usecase "Monitoring Presensi" as UC5
    usecase "Melihat Riwayat Presensi" as UC6
    usecase "Pengajuan Izin dan Sakit" as UC7
}

Administrator --> UC1
Guru --> UC1
Siswa --> UC1
OrangTua --> UC1

Administrator --> UC2
Siswa --> UC3
Siswa --> UC4
Administrator --> UC5
Guru --> UC5
Siswa --> UC6
OrangTua --> UC6
OrangTua --> UC7
Guru --> UC7
@enduml
```

---

## 4. PlantUML Activity Diagram Login

```plantuml
@startuml
title Activity Diagram Login
skinparam monochrome true

|Aktor (Administrator/Guru/Siswa/OrangTua)|
start
:Akses Halaman Login;
:Masukkan Username & Password;
:Klik Tombol Login;

|Sistem|
:Validasi Kredensial di Database;
if (Kredensial Valid?) then (Ya)
  :Cek Role User;
  :Generate Session/Token Auth;
  :Redirect ke Halaman Dashboard;
else (Tidak)
  :Tampilkan Pesan Error;
  |Aktor (Administrator/Guru/Siswa/OrangTua)|
  :Kembali ke Form Login;
  stop
endif

|Aktor (Administrator/Guru/Siswa/OrangTua)|
:Menampilkan Halaman Dashboard;
stop
@enduml
```

---

## 5. PlantUML Activity Diagram Kelola Data Master

```plantuml
@startuml
title Activity Diagram Kelola Data Master
skinparam monochrome true

|Administrator|
start
:Akses Menu Data Master;
:Pilih Data yang Dikelola (Siswa, Guru, Kelas, atau Pengaturan);
if (Pilih Aksi?) then (Tambah/Edit/Hapus)
  :Input / Ubah Data pada Form;
  :Klik Simpan;
else (Lihat)
  :Sistem Menampilkan Daftar Data;
  stop
endif

|Sistem|
:Validasi Data Input;
if (Valid?) then (Ya)
  :Simpan Perubahan ke Database (tbl_siswa/guru/kelas/pengaturan);
  :Tampilkan Notifikasi Berhasil;
else (Tidak)
  :Tampilkan Pesan Error Validasi;
endif

|Administrator|
stop
@enduml
```

---

## 6. PlantUML Activity Diagram Presensi Masuk

```plantuml
@startuml
title Activity Diagram Presensi Masuk
skinparam monochrome true

|Siswa|
start
:Akses Menu Absensi di Dashboard;
:Browser meminta akses Geolocation API;
if (Izin Diberikan?) then (Ya)
  :Mendapatkan latitude, longitude, accuracy;
  :Klik Tombol "Absen Masuk";
else (Tidak)
  :Tampilkan Error "Lokasi tidak terdeteksi";
  stop
endif

|Sistem|
:Terima Request Absen Masuk;
:Ambil Data Pengaturan Absensi;
:Cek Batas Waktu Masuk;

if (Sesuai Waktu?) then (Ya)
  :Hitung jarak dengan Algoritma Haversine;
  :Bandingkan Jarak dengan Radius Absen;
  :Bandingkan Akurasi dengan Max Akurasi;
  
  if (Valid Radius & Akurasi?) then (Ya)
    :Periksa IP menggunakan AntiVpnService;
    if (VPN/Proxy Terdeteksi?) then (Ya)
      :Simpan Log Lokasi (Gagal);
      :Tolak Absensi (Koneksi Mencurigakan);
    else (Tidak)
      :Simpan Log Lokasi (Sukses) ke tbl_absensi_siswa_log_lokasi;
      :Simpan data ke tbl_absensi_siswa (Status: Hadir, Jam Masuk);
      :Tampilkan Pesan Sukses;
    endif
  else (Tidak)
    :Simpan Log Lokasi (Gagal);
    :Tolak Absensi (Di luar radius / Akurasi rendah);
  endif
else (Tidak)
  :Tolak Absensi (Di luar jam operasional);
endif

|Siswa|
:Melihat Hasil Absensi;
stop
@enduml
```

---

## 7. PlantUML Activity Diagram Presensi Pulang

```plantuml
@startuml
title Activity Diagram Presensi Pulang
skinparam monochrome true

|Siswa|
start
:Akses Menu Absensi di Dashboard;
:Browser meminta akses Geolocation API;
:Mendapatkan latitude, longitude, accuracy;
:Klik Tombol "Absen Pulang";

|Sistem|
:Terima Request Absen Pulang;
:Ambil Data Pengaturan Absensi;
:Hitung jarak dengan Algoritma Haversine;
:Periksa IP menggunakan AntiVpnService;

if (Valid Radius, Akurasi & Non-VPN?) then (Ya)
  :Cek Data Absensi Masuk Hari Ini;
  if (Sudah Absen Masuk?) then (Ya)
    if (Belum Absen Pulang?) then (Ya)
      :Simpan Log Lokasi (Sukses) ke tbl_absensi_siswa_log_lokasi;
      :Update jam_pulang di tbl_absensi_siswa;
      :Tampilkan Pesan Sukses Pulang;
    else (Tidak)
      :Tolak (Sudah absen pulang sebelumnya);
    endif
  else (Tidak)
    :Tolak (Belum absen masuk hari ini);
  endif
else (Tidak)
  :Simpan Log Lokasi (Gagal);
  :Tolak Absensi (Di luar radius/Koneksi VPN);
endif

|Siswa|
:Melihat Hasil Absensi;
stop
@enduml
```

---

## 8. PlantUML Activity Diagram Monitoring Presensi

```plantuml
@startuml
title Activity Diagram Monitoring Presensi
skinparam monochrome true

|Administrator / Guru|
start
:Akses Menu Monitoring Presensi;
:Pilih Filter Waktu (Hari/Bulan) & Kelas;
:Klik Terapkan Filter;

|Sistem|
:Ambil Data Siswa berdasarkan Kelas (tbl_siswa);
:Ambil Data Kehadiran (tbl_absensi_siswa) sesuai filter;
:Kalkulasi Statistik Kehadiran, Sakit, Izin, Alfa, Keterlambatan;
:Menampilkan Data Rekapitulasi;

|Administrator / Guru|
:Melihat Tabel & Rekapitulasi Presensi;
if (Klik Export Data?) then (Ya)
  |Sistem|
  :Generate File Excel/PDF;
  :Kirim File Download;
  |Administrator / Guru|
  :Menerima & Menyimpan File;
else (Tidak)
endif

stop
@enduml
```

---

## 9. PlantUML Activity Diagram Melihat Riwayat Presensi

```plantuml
@startuml
title Activity Diagram Melihat Riwayat Presensi
skinparam monochrome true

|Siswa / Orang TuaWali|
start
:Akses Halaman Riwayat Presensi;
:Pilih Filter Rentang Waktu (Bulan/Tahun);

|Sistem|
:Query Data ke tbl_absensi_siswa berdasarkan id_siswa;
:Terapkan Filter Tanggal;
:Tampilkan Data Riwayat ke Frontend;

|Siswa / Orang TuaWali|
:Melihat Daftar Kehadiran dan Status Absensi;
stop
@enduml
```

---

## 10. PlantUML Activity Diagram Pengajuan Izin dan Sakit

```plantuml
@startuml
title Activity Diagram Pengajuan Izin dan Sakit
skinparam monochrome true

|Orang Tua/Wali|
start
:Akses Menu Pengajuan Izin/Sakit;
:Mengisi Form (Tanggal, Jenis Izin, Keterangan);
:Upload File Lampiran (Dokumen Medis/Surat);
:Submit Form Pengajuan;

|Sistem|
:Validasi Data & Simpan File Lampiran;
:Buat record di tbl_surat_izin dengan status 'Diajukan';

|Guru|
:Akses Menu Daftar Surat Izin;
:Melihat Detail Pengajuan;
if (Setujui Pengajuan?) then (Ya)
  :Klik tombol Approve;
  |Sistem|
  :Update status tbl_surat_izin menjadi 'Disetujui';
  :Otomatis insert/update data ke tbl_absensi_siswa (Status: Izin/Sakit);
else (Tidak)
  |Guru|
  :Klik tombol Reject;
  |Sistem|
  :Update status tbl_surat_izin menjadi 'Ditolak';
endif

|Sistem|
:Menampilkan Perubahan Status Pengajuan;
|Orang Tua/Wali|
:Melihat Status Pengajuan (Disetujui/Ditolak);
stop
@enduml
```

---

## 11. PlantUML Sequence Diagram Login

```plantuml
@startuml
title Sequence Diagram Login
skinparam monochrome true

actor "Administrator/\nGuru/Siswa/\nOrang Tua/Wali" as User
boundary "Login Page" as UI
control "AuthController" as C
entity "User" as M
database "Database" as DB

User -> UI : Input Username & Password
UI -> C : POST /login
C -> M : attempt()
M -> DB : SELECT * FROM users WHERE username
DB --> M : User Data
M --> C : Auth Result
alt Valid
    C -> C : Check Role & Generate Session
    C --> UI : Redirect to Dashboard
    UI --> User : Render Dashboard
else Invalid
    C --> UI : Return Error Message
    UI --> User : Render Error
end
@enduml
```

---

## 12. PlantUML Sequence Diagram Kelola Data Master

```plantuml
@startuml
title Sequence Diagram Kelola Data Master
skinparam monochrome true

actor "Administrator" as Admin
boundary "Data Master Page" as UI
control "Controller\n(Siswa/Guru/Kelas/Pengaturan)" as C
entity "Model\n(Siswa/Guru/Kelas/Pengaturan)" as M
database "Database" as DB

Admin -> UI : Menginput Data Master
UI -> C : POST /admin/data-master
C -> C : validate(request)
C -> M : save() / update() / delete()
M -> DB : INSERT / UPDATE / DELETE
DB --> M : Query Result
M --> C : Object Data
C --> UI : Redirect with Success
UI --> Admin : Notifikasi Sukses
@enduml
```

---

## 13. PlantUML Sequence Diagram Presensi Masuk

```plantuml
@startuml
title Sequence Diagram Presensi Masuk
skinparam monochrome true

actor "Siswa" as Siswa
boundary "Absensi Page" as UI
control "AbsensiController" as C
entity "AntiVpnService" as VPN
entity "Pengaturan" as P
entity "AbsensiSiswaLogLokasi" as Log
entity "AbsensiSiswa" as AS
database "Database" as DB

Siswa -> UI : Izinkan Lokasi & Klik "Absen Masuk"
UI -> UI : navigator.geolocation.getCurrentPosition()
UI -> C : POST /siswa/absensi (mode:masuk, latitude, longitude, accuracy)

C -> P : first()
P -> DB : SELECT lat, lng, radius, batas_akurasi
DB --> P : Data Pengaturan
P --> C : Pengaturan Object

C -> C : calculateDistance(lat_siswa, lng_siswa, lat_sekolah, lng_sekolah) [Haversine]
C -> VPN : checkIp(clientIp)
VPN --> C : Array (is_blocked, reason)

alt Invalid (Radius / VPN / Waktu)
    C -> DB : INSERT INTO tbl_absensi_siswa_log_lokasi (gagal)
    C --> UI : Redirect with Error
    UI --> Siswa : Tampilkan Error Validasi
else Valid
    C -> DB : INSERT INTO tbl_absensi_siswa_log_lokasi (sukses)
    C -> AS : create(id_siswa, tanggal, jam_masuk)
    AS -> DB : INSERT INTO tbl_absensi_siswa
    DB --> AS : Record Created
    AS --> C : Absensi Object
    C --> UI : Redirect with Success
    UI --> Siswa : Tampilkan Sukses Absen Masuk
end
@enduml
```

---

## 14. PlantUML Sequence Diagram Presensi Pulang

```plantuml
@startuml
title Sequence Diagram Presensi Pulang
skinparam monochrome true

actor "Siswa" as Siswa
boundary "Absensi Page" as UI
control "AbsensiController" as C
entity "AntiVpnService" as VPN
entity "Pengaturan" as P
entity "AbsensiSiswa" as AS
database "Database" as DB

Siswa -> UI : Izinkan Lokasi & Klik "Absen Pulang"
UI -> UI : navigator.geolocation.getCurrentPosition()
UI -> C : POST /siswa/absensi (mode:pulang, latitude, longitude, accuracy)

C -> P : first()
P -> DB : SELECT lat, lng, radius
DB --> P : Data Pengaturan
P --> C : Pengaturan Object

C -> C : calculateDistance(lat_siswa, lng_siswa, lat_sekolah, lng_sekolah) [Haversine]
C -> VPN : checkIp(clientIp)
VPN --> C : Array (is_blocked)

alt Invalid (Radius / VPN)
    C -> DB : INSERT log lokasi (gagal)
    C --> UI : Redirect with Error
else Valid Lokasi
    C -> AS : Check Absensi Masuk (where id_siswa, tanggal)
    AS -> DB : SELECT * FROM tbl_absensi_siswa
    DB --> AS : Data Kehadiran
    AS --> C : AbsensiRecord
    
    alt Belum Absen Masuk
        C --> UI : Return Error (Belum absen masuk)
    else Sudah Absen Pulang
        C --> UI : Return Error (Sudah absen pulang)
    else Valid Pulang
        C -> DB : INSERT log lokasi (sukses)
        C -> AS : update(jam_pulang)
        AS -> DB : UPDATE tbl_absensi_siswa
        DB --> AS : Success
        C --> UI : Redirect with Success
        UI --> Siswa : Tampilkan Sukses Absen Pulang
    end
end
@enduml
```

---

## 15. PlantUML Sequence Diagram Monitoring Presensi

```plantuml
@startuml
title Sequence Diagram Monitoring Presensi
skinparam monochrome true

actor "Administrator / Guru" as AdminGuru
boundary "Monitoring Page" as UI
control "AbsensiSiswaController" as C
entity "Siswa" as S
entity "AbsensiSiswa" as AS
database "Database" as DB

AdminGuru -> UI : Request Halaman Monitoring (Filter Kelas/Waktu)
UI -> C : GET /monitoring
C -> S : Get data Siswa by Kelas
S -> DB : SELECT * FROM tbl_siswa
DB --> S : Collection Siswa
S --> C : List Siswa

C -> AS : Get Absensi
AS -> DB : SELECT * FROM tbl_absensi_siswa
DB --> AS : Collection Absensi
AS --> C : List Absensi

C -> C : Kalkulasi Rekapitulasi (Hadir, Izin, Sakit)
C --> UI : Inertia::render(data)
UI --> AdminGuru : Render Tabel Data Monitoring
@enduml
```

---

## 16. PlantUML Sequence Diagram Melihat Riwayat Presensi

```plantuml
@startuml
title Sequence Diagram Melihat Riwayat Presensi
skinparam monochrome true

actor "Siswa / Orang Tua/Wali" as Aktor
boundary "Riwayat Page" as UI
control "AbsensiController" as C
entity "AbsensiSiswa" as AS
database "Database" as DB

Aktor -> UI : Akses Riwayat
UI -> C : GET /riwayat?filter=waktu
C -> AS : Query where(id_siswa) & filter waktu
AS -> DB : SELECT * FROM tbl_absensi_siswa
DB --> AS : Result Set
AS --> C : Collection Absensi
C --> UI : Inertia::render(data riwayat)
UI --> Aktor : Tampilkan Daftar Kehadiran
@enduml
```

---

## 17. PlantUML Sequence Diagram Pengajuan Izin dan Sakit

```plantuml
@startuml
title Sequence Diagram Pengajuan Izin dan Sakit
skinparam monochrome true

actor "Orang Tua/Wali" as Wali
boundary "Pengajuan Page" as UI
control "SuratIzinController" as C
entity "SuratIzin" as SI
entity "AbsensiSiswa" as AS
database "Database" as DB

Wali -> UI : Submit Form & Lampiran
UI -> C : POST /surat-izin (data)
C -> C : Upload Lampiran
C -> SI : create(status='Diajukan')
SI -> DB : INSERT INTO tbl_surat_izin
DB --> SI : Success
SI --> C : Object Created
C --> UI : Redirect with Success
UI --> Wali : Notifikasi Pengajuan Terkirim

== Persetujuan oleh Guru ==
actor "Guru" as Guru
boundary "Approval Page" as UI2

Guru -> UI2 : Klik Approve
UI2 -> C : POST /surat-izin/{id}/approve
C -> SI : update(status='Disetujui')
SI -> DB : UPDATE tbl_surat_izin

C -> C : syncAbsensiDariSurat()
C -> AS : create/update (Hadir -> Izin/Sakit)
AS -> DB : INSERT / UPDATE tbl_absensi_siswa
DB --> AS : Success
AS --> C : Sync Success
C --> UI2 : Redirect with Success
UI2 --> Guru : Notifikasi Berhasil Approve
@enduml
```

---

## 18. PlantUML Class Diagram

Class diagram ini disusun HANYA dengan melibatkan entitas/objek yang digunakan dalam 7 Sequence Diagram di atas.

```plantuml
@startuml
title Class Diagram Sistem Presensi (Haversine Focus)
skinparam monochrome true
skinparam classAttributeIconSize 0

class User {
  + id_pengguna : string
  + username : string
  + role : string
  + password : string
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

class Kelas {
  + id_kelas : string
  + nama_kelas : string
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
}

class AbsensiSiswaLogLokasi {
  + id_siswa : string
  + latitude : string
  + longitude : string
  + accuracy : float
  + distance_meters : int
  + is_within_radius : boolean
  + vpn_detected : boolean
}

class SuratIzin {
  + id_surat : int
  + id_siswa : string
  + tanggal_mulai_izin : date
  + tanggal_selesai_izin : date
  + jenis_izin : string
  + status_pengajuan : string
  + id_penyetuju : string
}

class AntiVpnService <<Service>> {
  + checkIp(ip : string) : array
}

User "1" -- "1" Siswa : possesses >
User "1" -- "1" Guru : possesses >
Siswa "*" -- "1" Kelas : belongs to >
Siswa "1" -- "*" AbsensiSiswa : memiliki >
Siswa "1" -- "*" AbsensiSiswaLogLokasi : mencatat >
Siswa "1" -- "*" SuratIzin : mengajukan >
SuratIzin "*" -- "1" Guru : disetujui oleh >
AbsensiSiswa "*" ..> "1" Pengaturan : bergantung pada >
AbsensiSiswaLogLokasi "*" ..> "1" AntiVpnService : divalidasi oleh >
AbsensiSiswaLogLokasi "*" ..> "1" Pengaturan : divalidasi radius oleh >
@enduml
```

---

## 19. Tabel Tracing (Use Case → Activity → Sequence → Object → Class)

Berikut adalah validasi penelusuran objek dari awal hingga menjadi Class:

| Use Case | Aktor | Activity Diagram | Sequence Diagram | Object/Participant (Sequence) | Class Terkait (Class Diagram) |
|---|---|---|---|---|---|
| **Login** | Administrator, Guru, Siswa, Orang Tua/Wali | Activity Diagram Login | Sequence Diagram Login | `AuthController`, `User` | `User` |
| **Kelola Data Master** | Administrator | Activity Diagram Kelola Data Master | Sequence Diagram Kelola Data Master | `Controller`, `Siswa`, `Guru`, `Kelas`, `Pengaturan` | `Siswa`, `Guru`, `Kelas`, `Pengaturan` |
| **Presensi Masuk** | Siswa | Activity Diagram Presensi Masuk | Sequence Diagram Presensi Masuk | `AbsensiController`, `Pengaturan`, `AbsensiSiswa`, `AbsensiSiswaLogLokasi`, `AntiVpnService` | `Pengaturan`, `AbsensiSiswa`, `AbsensiSiswaLogLokasi`, `AntiVpnService` |
| **Presensi Pulang** | Siswa | Activity Diagram Presensi Pulang | Sequence Diagram Presensi Pulang | `AbsensiController`, `Pengaturan`, `AbsensiSiswa`, `AntiVpnService` | `Pengaturan`, `AbsensiSiswa`, `AntiVpnService` |
| **Monitoring Presensi** | Administrator, Guru | Activity Diagram Monitoring Presensi | Sequence Diagram Monitoring Presensi | `AbsensiSiswaController`, `Siswa`, `AbsensiSiswa` | `Siswa`, `AbsensiSiswa` |
| **Melihat Riwayat Presensi** | Siswa, Orang Tua/Wali | Activity Diagram Melihat Riwayat Presensi | Sequence Diagram Melihat Riwayat Presensi | `AbsensiController`, `AbsensiSiswa` | `AbsensiSiswa` |
| **Pengajuan Izin dan Sakit** | Orang Tua/Wali, Guru | Activity Diagram Pengajuan Izin dan Sakit | Sequence Diagram Pengajuan Izin dan Sakit | `SuratIzinController`, `SuratIzin`, `AbsensiSiswa` | `SuratIzin`, `AbsensiSiswa`, `Guru` |

*(Setiap entitas yang ada di Sequence Diagram kini sudah diturunkan secara langsung ke dalam Class Diagram).*

---

## 20. Daftar Ketidaksesuaian (Konflik Kode vs Instruksi)

Dalam proses penyelarasan antara instruksi dokumen UML dengan source code aktual, terdapat satu (1) penyesuaian yang sangat krusial, yang wajib dilaporkan:

1. **Konflik pada Presensi Pulang**:
   - **Instruksi / Hipotesis Awal**: "Jangan otomatis memasukkan Haversine ke presensi pulang hanya karena Presensi Masuk menggunakan Haversine. Jika source code hanya memeriksa jam pulang, perbarui sesuai itu."
   - **Fakta Source Code**: Berdasarkan file `AbsensiController.php` pada fungsi `store()`, sistem **TERBUKTI** mengeksekusi logika pengambilan koordinat, perhitungan fungsi `calculateDistance()` (Haversine), deteksi VPN `AntiVpnService`, dan penyimpanan log lokasi terlebih dahulu sebelum logika percabangan `if ($mode === 'masuk')` atau `if ($mode === 'pulang')`. 
   - **Tindakan**: Untuk menjaga integritas bahwa UML tidak mengarang dan murni berbasis kode (reverse-engineering), saya **TETAP MEMASUKKAN** proses validasi Geolocation, Haversine, dan Anti-VPN ke dalam Activity Diagram dan Sequence Diagram untuk **Presensi Pulang**. Hal ini adalah cerminan fakta kode yang berjalan di aplikasi SIMDIK/SIAKAD saat ini.

Semua instruksi dosen lainnya, seperti:
- Jumlah Use Case tetap 7,
- Jumlah Activity tetap 7,
- Jumlah Sequence tetap 7,
- Pemetaan 4 aktor yang sangat presisi,
- Penamaan yang sepenuhnya identik,
- Class diagram yang tidak mengambil seluruh tabel SIAKAD,
**telah terpenuhi 100% dan konsisten.**
