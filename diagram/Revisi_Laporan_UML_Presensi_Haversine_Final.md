# REVISI FINAL: Laporan Analisis dan Perancangan UML Sistem Presensi Siswa

---

## 1. Ringkasan Perubahan yang Dilakukan

1. **Activity dan Sequence Diagram "Kelola Data Master"**: Diperbaiki menjadi alur gabungan (dengan *decision/alt*) yang secara eksplisit memperlihatkan operasi terhadap `Siswa`, `Guru`, `Kelas`, dan `Pengaturan Absensi` lengkap dengan Model yang berkaitan di source code aktual.
2. **Activity dan Sequence Diagram "Pengajuan Izin dan Sakit"**: Aktor Administrator dihilangkan. Aktor yang ada hanya **Orang Tua/Wali** (sebagai pemohon) dan **Guru** (sebagai pemberi persetujuan).
3. **Class Diagram - Orang Tua/Wali**: Source code mengonfirmasi keberadaan `app/Models/OrangTuaWali.php`. Model ini ditambahkan secara utuh ke dalam Class Diagram dengan relasinya terhadap `User` dan `Siswa`.
4. **Class Diagram - Administrator (Autentikasi)**: Source code mengonfirmasi bahwa seluruh autentikasi login (Admin, Guru, Siswa, Ortu) dipusatkan di tabel `tbl_pengguna` melalui model `User.php`. Di Class Diagram, Administrator bukan class terpisah, melainkan direpresentasikan oleh `User` dengan atribut `level = 'admin'`.
5. **Tabel Tracing**: Diperbarui 100% menggunakan format detail yang menjelaskan peran tiap participant (apakah ia `<<Boundary>>`, `<<Controller>>`, `<<Service>>`, atau `<<Model>>`) dan melacaknya langsung ke Class Diagram (jika participant tersebut adalah Model/Service).

---

## 2. PlantUML Use Case Diagram Final

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

## 3. PlantUML Activity Diagram Final (7 Diagram)

### 3.1. Activity Diagram Login

```plantuml
@startuml
title Activity Diagram Login
skinparam monochrome true

|Aktor (Administrator/Guru/Siswa/OrangTua)|
start
:Membuka Halaman Login;
:Mengisi Username dan Password;
:Menekan Tombol Login;

|Sistem|
:Memvalidasi Kredensial di Database;
if (Data Valid?) then (Ya)
  :Memeriksa Hak Akses (Level User);
  :Membuat Sesi Pengguna (Session);
  :Mengarahkan (Redirect) ke Dashboard;
else (Tidak)
  :Menampilkan Pesan Kesalahan (Error);
  |Aktor (Administrator/Guru/Siswa/OrangTua)|
  :Kembali ke Form Login;
  stop
endif

|Aktor (Administrator/Guru/Siswa/OrangTua)|
:Melihat Halaman Dashboard Sesuai Hak Akses;
stop
@enduml
```

### 3.2. Activity Diagram Kelola Data Master

```plantuml
@startuml
title Activity Diagram Kelola Data Master
skinparam monochrome true

|Administrator|
start
:Membuka Halaman Kelola Data Master;
:Memilih Jenis Data;

if (Jenis Data?) then (Siswa)
  :Menginput/Mengubah Data Siswa;
else if (Jenis Data?) then (Guru)
  :Menginput/Mengubah Data Guru;
else if (Jenis Data?) then (Kelas)
  :Menginput/Mengubah Data Kelas;
else (Pengaturan Absensi)
  :Mengubah Data Jam Masuk, Jam Pulang, \nRadius, & Koordinat;
endif

:Menyimpan Perubahan;

|Sistem|
:Memvalidasi Format Data Input;
if (Valid?) then (Ya)
  :Menyimpan/Mengupdate Data ke Database Terkait;
  :Menampilkan Notifikasi Sukses;
else (Tidak)
  :Menampilkan Pesan Kesalahan Validasi;
endif

|Administrator|
stop
@enduml
```

### 3.3. Activity Diagram Presensi Masuk

```plantuml
@startuml
title Activity Diagram Presensi Masuk
skinparam monochrome true

|Siswa|
start
:Membuka Halaman Absensi;
:Mengizinkan Akses Lokasi (Geolocation API);
:Memperoleh Latitude, Longitude, & Accuracy;
:Menekan Tombol "Absen Masuk";

|Sistem|
:Menerima Permintaan Presensi Masuk;
:Mengambil Pengaturan Absensi (Jam & Lokasi Sekolah);
:Memeriksa Batas Waktu Masuk;

if (Sesuai Waktu?) then (Ya)
  :Menghitung Jarak dengan Algoritma Haversine;
  :Membandingkan Jarak dengan Radius Absen;
  
  if (Jarak <= Radius & Akurasi Terpenuhi?) then (Ya)
    :Memeriksa Koneksi (AntiVpnService);
    if (VPN/Proxy Terdeteksi?) then (Ya)
      :Menyimpan Log Lokasi (Gagal - VPN);
      :Menolak Absensi;
    else (Tidak)
      :Menyimpan Log Lokasi (Sukses);
      :Menyimpan Data Presensi Masuk (tbl_absensi_siswa);
      :Menampilkan Notifikasi Berhasil;
    endif
  else (Tidak)
    :Menyimpan Log Lokasi (Gagal - Diluar Radius);
    :Menolak Absensi;
  endif
else (Tidak)
  :Menolak Absensi (Di luar jam operasional);
endif

|Siswa|
:Melihat Hasil/Notifikasi Presensi;
stop
@enduml
```

### 3.4. Activity Diagram Presensi Pulang

```plantuml
@startuml
title Activity Diagram Presensi Pulang
skinparam monochrome true

|Siswa|
start
:Membuka Halaman Absensi;
:Mengizinkan Akses Lokasi (Geolocation API);
:Memperoleh Latitude, Longitude, & Accuracy;
:Menekan Tombol "Absen Pulang";

|Sistem|
:Menerima Permintaan Presensi Pulang;
:Mengambil Pengaturan Absensi;
:Menghitung Jarak dengan Algoritma Haversine;
:Memeriksa Koneksi (AntiVpnService);

if (Valid Jarak & Bebas VPN?) then (Ya)
  :Memeriksa Riwayat Absensi Masuk Hari Ini;
  if (Sudah Absen Masuk?) then (Ya)
    if (Belum Absen Pulang?) then (Ya)
      :Menyimpan Log Lokasi (Sukses);
      :Memperbarui Jam Pulang (tbl_absensi_siswa);
      :Menampilkan Notifikasi Berhasil;
    else (Tidak)
      :Menolak (Sudah absen pulang sebelumnya);
    endif
  else (Tidak)
    :Menolak (Belum absen masuk hari ini);
  endif
else (Tidak)
  :Menyimpan Log Lokasi (Gagal);
  :Menolak Absensi;
endif

|Siswa|
:Melihat Hasil/Notifikasi Presensi;
stop
@enduml
```

### 3.5. Activity Diagram Monitoring Presensi

```plantuml
@startuml
title Activity Diagram Monitoring Presensi
skinparam monochrome true

|Administrator/Guru|
start
:Membuka Halaman Monitoring Presensi;
:Menerapkan Filter (Kelas dan Waktu);

|Sistem|
:Mencari Data Siswa Berdasarkan Kelas;
:Mengambil Data Absensi Berdasarkan Waktu;
:Mengkalkulasi Statistik Kehadiran \n(Hadir, Izin, Sakit, Alfa, Terlambat);
:Menampilkan Tabel Rekapitulasi;

|Administrator/Guru|
:Melihat Tabel & Rekapitulasi;
if (Mengekspor Data?) then (Ya)
  |Sistem|
  :Menghasilkan File Excel/PDF;
  :Memberikan File untuk Diunduh;
  |Administrator/Guru|
  :Menerima File;
else (Tidak)
endif

stop
@enduml
```

### 3.6. Activity Diagram Melihat Riwayat Presensi

```plantuml
@startuml
title Activity Diagram Melihat Riwayat Presensi
skinparam monochrome true

|Siswa/OrangTua|
start
:Membuka Halaman Riwayat Presensi;
:Memilih Filter Waktu (Bulan/Tahun);

|Sistem|
:Mencari Data Absensi Berdasarkan ID Siswa;
:Menerapkan Filter Tanggal;
:Menyajikan Data Riwayat ke Tampilan;

|Siswa/OrangTua|
:Melihat Daftar Kehadiran dan Status;
stop
@enduml
```

### 3.7. Activity Diagram Pengajuan Izin dan Sakit

```plantuml
@startuml
title Activity Diagram Pengajuan Izin dan Sakit
skinparam monochrome true

|Orang Tua/Wali|
start
:Membuka Halaman Pengajuan Izin/Sakit;
:Mengisi Formulir Pengajuan (Tanggal, Jenis, Keterangan);
:Mengunggah Lampiran Surat;
:Mengirim Pengajuan;

|Sistem|
:Menyimpan Lampiran Dokumen;
:Membuat Record Surat Izin (Status: Diajukan);

|Guru|
:Membuka Halaman Daftar Pengajuan Izin;
:Memeriksa Pengajuan & Bukti Lampiran;
if (Setujui Pengajuan?) then (Ya)
  :Mengeklik Tombol Setujui;
  |Sistem|
  :Memperbarui Status Surat Izin menjadi "Disetujui";
  :Sinkronisasi ke Tabel Absensi Siswa (Hadir -> Izin/Sakit);
else (Tidak)
  |Guru|
  :Mengeklik Tombol Tolak;
  |Sistem|
  :Memperbarui Status Surat Izin menjadi "Ditolak";
endif

|Sistem|
:Menampilkan Perubahan Status;
|Orang Tua/Wali|
:Melihat Status Akhir Pengajuan;
stop
@enduml
```

---

## 4. PlantUML Sequence Diagram Final (7 Diagram)

### 4.1. Sequence Diagram Login

```plantuml
@startuml
title Sequence Diagram Login
skinparam monochrome true

actor "Aktor" as Aktor
boundary "Halaman Login" as UI
control "AuthController" as C
entity "User" as M
database "Database" as DB

Aktor -> UI : Input Username & Password
UI -> C : POST /login
C -> M : attempt()
M -> DB : SELECT * FROM tbl_pengguna WHERE username
DB --> M : Record User
M --> C : Auth Valid/Invalid

alt Autentikasi Sukses
    C -> C : Periksa Level (Admin/Guru/Siswa/Wali)
    C --> UI : Redirect to Dashboard
    UI --> Aktor : Tampilkan Dashboard
else Autentikasi Gagal
    C --> UI : Return Error Message
    UI --> Aktor : Tampilkan Pesan Kesalahan
end
@enduml
```

### 4.2. Sequence Diagram Kelola Data Master

```plantuml
@startuml
title Sequence Diagram Kelola Data Master
skinparam monochrome true
skinparam maxMessageSize 100

actor "Administrator" as Admin
boundary "Halaman Data Master" as UI
control "SiswaController" as SC
entity "Siswa" as SM
control "GuruController" as GC
entity "Guru" as GM
control "KelasController" as KC
entity "Kelas" as KM
control "PengaturanController" as PC
entity "Pengaturan" as PM
database "Database" as DB

Admin -> UI : Mengisi Form & Submit
UI -> UI : Menentukan Tipe Form
alt Form Siswa
    UI -> SC : POST /admin/siswa
    SC -> SM : save() / update()
    SM -> DB : INSERT / UPDATE tbl_siswa
else Form Guru
    UI -> GC : POST /admin/guru
    GC -> GM : save() / update()
    GM -> DB : INSERT / UPDATE tbl_guru
else Form Kelas
    UI -> KC : POST /admin/kelas
    KC -> KM : save() / update()
    KM -> DB : INSERT / UPDATE tbl_kelas
else Form Pengaturan
    UI -> PC : POST /admin/pengaturan
    PC -> PM : save() / update()
    PM -> DB : UPDATE tbl_pengaturan
end

DB --> SM : Result
DB --> GM : Result
DB --> KM : Result
DB --> PM : Result
SM --> SC : Object
GM --> GC : Object
KM --> KC : Object
PM --> PC : Object
SC --> UI : Redirect
GC --> UI : Redirect
KC --> UI : Redirect
PC --> UI : Redirect
UI --> Admin : Notifikasi Berhasil
@enduml
```

### 4.3. Sequence Diagram Presensi Masuk

```plantuml
@startuml
title Sequence Diagram Presensi Masuk
skinparam monochrome true

actor "Siswa" as Siswa
boundary "Halaman Absensi" as UI
control "AbsensiController" as C
entity "Pengaturan" as P
entity "AbsensiSiswaLogLokasi" as Log
entity "AbsensiSiswa" as AS
entity "AntiVpnService" as VPN
database "Database" as DB

Siswa -> UI : Izinkan Lokasi & Klik Absen Masuk
UI -> UI : navigator.geolocation.getCurrentPosition()
UI -> C : POST /absensi (mode=masuk, lat, lng, acc)

C -> P : first()
P -> DB : SELECT lat, lng, radius FROM tbl_pengaturan
DB --> P : Data Pengaturan
P --> C : Pengaturan Object

C -> C : calculateDistance(lat_siswa, lng_siswa, lat_sekolah, lng_sekolah)
C -> VPN : checkIp(clientIp)
VPN --> C : Array(is_blocked)

alt Invalid (Radius / VPN / Akurasi / Jam)
    C -> Log : insert()
    Log -> DB : INSERT INTO tbl_absensi_siswa_log_lokasi (gagal)
    C --> UI : Redirect with Error
    UI --> Siswa : Tampilkan Pesan Gagal
else Valid
    C -> Log : insert()
    Log -> DB : INSERT INTO tbl_absensi_siswa_log_lokasi (sukses)
    C -> AS : create(id_siswa, tanggal, jam_masuk)
    AS -> DB : INSERT INTO tbl_absensi_siswa
    DB --> AS : Success
    AS --> C : Absensi Object
    C --> UI : Redirect with Success
    UI --> Siswa : Tampilkan Pesan Berhasil
end
@enduml
```

### 4.4. Sequence Diagram Presensi Pulang

```plantuml
@startuml
title Sequence Diagram Presensi Pulang
skinparam monochrome true

actor "Siswa" as Siswa
boundary "Halaman Absensi" as UI
control "AbsensiController" as C
entity "Pengaturan" as P
entity "AntiVpnService" as VPN
entity "AbsensiSiswaLogLokasi" as Log
entity "AbsensiSiswa" as AS
database "Database" as DB

Siswa -> UI : Izinkan Lokasi & Klik Absen Pulang
UI -> UI : navigator.geolocation.getCurrentPosition()
UI -> C : POST /absensi (mode=pulang, lat, lng, acc)

C -> P : first()
P -> DB : SELECT * FROM tbl_pengaturan
DB --> P : Pengaturan
P --> C : Pengaturan Object

C -> C : calculateDistance(...)
C -> VPN : checkIp(clientIp)
VPN --> C : Array(is_blocked)

alt Invalid (Radius / VPN)
    C -> Log : insert()
    Log -> DB : INSERT log lokasi (gagal)
    C --> UI : Return Error
else Valid Lokasi
    C -> AS : Check Absensi Masuk (where id_siswa, tanggal)
    AS -> DB : SELECT * FROM tbl_absensi_siswa
    DB --> AS : Data Kehadiran
    AS --> C : AbsensiRecord
  
    alt Belum Absen Masuk atau Sudah Absen Pulang
        C --> UI : Return Error Message
    else Valid Pulang
        C -> Log : insert()
        Log -> DB : INSERT log lokasi (sukses)
        C -> AS : update(jam_pulang)
        AS -> DB : UPDATE tbl_absensi_siswa
        DB --> AS : Success
        C --> UI : Redirect with Success
        UI --> Siswa : Tampilkan Pesan Berhasil
    end
end
@enduml
```

### 4.5. Sequence Diagram Monitoring Presensi

```plantuml
@startuml
title Sequence Diagram Monitoring Presensi
skinparam monochrome true

actor "Administrator/\nGuru" as AdminGuru
boundary "Halaman Monitoring" as UI
control "AbsensiSiswaController" as C
entity "Siswa" as S
entity "AbsensiSiswa" as AS
database "Database" as DB

AdminGuru -> UI : Pilih Kelas & Waktu
UI -> C : GET /monitoring
C -> S : Get data by Kelas
S -> DB : SELECT * FROM tbl_siswa
DB --> S : Koleksi Siswa
S --> C : List Siswa

C -> AS : Get Absensi
AS -> DB : SELECT * FROM tbl_absensi_siswa
DB --> AS : Koleksi Absensi
AS --> C : List Absensi

C -> C : Kalkulasi Rekapitulasi Kehadiran
C --> UI : Render Data Monitoring
UI --> AdminGuru : Tampilkan Tabel Presensi
@enduml
```

### 4.6. Sequence Diagram Melihat Riwayat Presensi

```plantuml
@startuml
title Sequence Diagram Melihat Riwayat Presensi
skinparam monochrome true

actor "Siswa/\nOrang Tua/Wali" as Aktor
boundary "Halaman Riwayat" as UI
control "AbsensiController" as C
entity "AbsensiSiswa" as AS
database "Database" as DB

Aktor -> UI : Akses Riwayat
UI -> C : GET /riwayat?filter=bulan
C -> AS : Query where(id_siswa) & filter
AS -> DB : SELECT * FROM tbl_absensi_siswa
DB --> AS : Result Set
AS --> C : Koleksi Absensi
C --> UI : Render Data Riwayat
UI --> Aktor : Tampilkan Daftar Kehadiran
@enduml
```

### 4.7. Sequence Diagram Pengajuan Izin dan Sakit

```plantuml
@startuml
title Sequence Diagram Pengajuan Izin dan Sakit
skinparam monochrome true

actor "Orang Tua/Wali" as Wali
boundary "Form Pengajuan" as UI
control "SuratIzinController" as C
entity "SuratIzin" as SI
entity "AbsensiSiswa" as AS
database "Database" as DB

Wali -> UI : Input Form & Upload Dokumen
UI -> C : POST /surat-izin
C -> C : Simpan Dokumen
C -> SI : create(status='Diajukan')
SI -> DB : INSERT tbl_surat_izin
DB --> SI : Success
SI --> C : Object Created
C --> UI : Return Success
UI --> Wali : Notifikasi Terkirim

== Approval oleh Guru ==
actor "Guru" as Guru
boundary "Halaman Persetujuan" as UI2

Guru -> UI2 : Klik Approve/Setujui
UI2 -> C : POST /surat-izin/{id}/approve
C -> SI : update(status='Disetujui')
SI -> DB : UPDATE tbl_surat_izin

C -> C : syncAbsensiDariSurat()
C -> AS : create/update (Hadir -> Izin/Sakit)
AS -> DB : INSERT / UPDATE tbl_absensi_siswa
DB --> AS : Success
AS --> C : Sync Success
C --> UI2 : Redirect Success
UI2 --> Guru : Notifikasi Berhasil Approve
@enduml
```

---

## 5. PlantUML Class Diagram Final

Class diagram ini disusun HANYA melibatkan entitas/model dan layanan (service) yang berpartisipasi nyata dalam 7 Sequence Diagram di atas. Aktor *Administrator* terangkum dalam `User` dengan level tertentu. Aktor *Orang Tua/Wali* murni menggunakan class `OrangTuaWali`.

```plantuml
@startuml
title Class Diagram Sistem Presensi (Haversine Focus)
skinparam monochrome true
skinparam classAttributeIconSize 0

class User <<Model>> {
  + id_pengguna : string
  + username : string
  + password : string
  + level : string
  + attempt()
}

class Siswa <<Model>> {
  + id_siswa : string
  + nis : string
  + nama_lengkap : string
  + id_kelas : string
  + status : string
}

class Guru <<Model>> {
  + id_guru : string
  + nip : string
  + nama_lengkap : string
}

class OrangTuaWali <<Model>> {
  + id_wali : string
  + id_pengguna : string
  + hubungan : string
  + nama_lengkap : string
  + no_telepon_wa : string
}

class Kelas <<Model>> {
  + id_kelas : string
  + nama_kelas : string
}

class Pengaturan <<Model>> {
  + jam_masuk_siswa : time
  + jam_pulang_siswa : time
  + lokasi_sekolah_latitude : string
  + lokasi_sekolah_longitude : string
  + radius_absen_meters : int
  + batas_akurasi_gps : int
}

class AbsensiSiswa <<Model>> {
  + id_absensi : string
  + id_siswa : string
  + tanggal : date
  + jam_masuk : time
  + jam_pulang : time
  + status_kehadiran : string
  + menit_keterlambatan : int
}

class AbsensiSiswaLogLokasi <<Model>> {
  + id_siswa : string
  + latitude : string
  + longitude : string
  + accuracy : float
  + distance_meters : int
  + is_within_radius : boolean
  + vpn_detected : boolean
}

class SuratIzin <<Model>> {
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

User "1" -- "1" Siswa : memiliki >
User "1" -- "1" Guru : memiliki >
User "1" -- "1" OrangTuaWali : memiliki >
OrangTuaWali "*" -- "*" Siswa : perwalian atas >
Siswa "*" -- "1" Kelas : tergabung di >
Siswa "1" -- "*" AbsensiSiswa : melakukan >
Siswa "1" -- "*" AbsensiSiswaLogLokasi : mencatat >
Siswa "1" -- "*" SuratIzin : diajukan atas nama >
SuratIzin "*" -- "1" Guru : diverifikasi oleh >
AbsensiSiswa "*" ..> "1" Pengaturan : divalidasi waktu oleh >
AbsensiSiswaLogLokasi "*" ..> "1" Pengaturan : divalidasi radius oleh >
AbsensiSiswaLogLokasi "*" ..> "1" AntiVpnService : divalidasi koneksi oleh >
@enduml
```

---

## 6. Tabel Tracing Use Case → Activity → Sequence → Object → Class

Berikut adalah validasi penelusuran objek dari awal hingga menjadi Class. Kolom **Participant/Object** menjelaskan stereotipenya pada Sequence Diagram.

| Use Case                           | Aktor                                      | Activity Diagram                          | Sequence Diagram                          | Participant/Object (Sifat)                                                                                                                                                                                                                                                                                                                                                                                           | Class/Model (Class Diagram)                                         |
| ---------------------------------- | ------------------------------------------ | ----------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Login**                    | Administrator, Guru, Siswa, Orang Tua/Wali | Activity Diagram Login                    | Sequence Diagram Login                    | `Halaman Login` (<<Boundary></boundary>>)`AuthController` (<<Controller></controller>>)`User` (<<Model></model>>)`Database` (<<Database></database>>)                                                                                                                                                                                                                                                        | `User`                                                            |
| **Kelola Data Master**       | Administrator                              | Activity Diagram Kelola Data Master       | Sequence Diagram Kelola Data Master       | `Data Master Page` (<<Boundary></boundary>>)`SiswaController` (<<Controller></controller>>)`GuruController` (<<Controller></controller>>)`KelasController` (<<Controller></controller>>)`PengaturanController` (<<Controller></controller>>)`Siswa` (<<Model></model>>)`Guru` (<<Model></model>>)`Kelas` (<<Model></model>>)`Pengaturan` (<<Model></model>>)`Database` (<<Database></database>>) | `SiswaGuru``KelasPengaturan`                                    |
| **Presensi Masuk**           | Siswa                                      | Activity Diagram Presensi Masuk           | Sequence Diagram Presensi Masuk           | `Halaman Absensi` (<<Boundary></boundary>>)`AbsensiController` (<<Controller></controller>>)`Pengaturan` (<<Model></model>>)`AbsensiSiswa` (<<Model></model>>)`AbsensiSiswaLogLokasi` (<<Model></model>>)`AntiVpnService` (<<Service></service>>)`Database` (<<Database></database>>)                                                                                                                  | `PengaturanAbsensiSiswa``AbsensiSiswaLogLokasiAntiVpnService`   |
| **Presensi Pulang**          | Siswa                                      | Activity Diagram Presensi Pulang          | Sequence Diagram Presensi Pulang          | `Halaman Absensi` (<<Boundary></boundary>>)`AbsensiController` (<<Controller></controller>>)`Pengaturan` (<<Model></model>>)`AbsensiSiswa` (<<Model></model>>)`AbsensiSiswaLogLokasi` (<<Model></model>>)`AntiVpnService` (<<Service></service>>)`Database` (<<Database></database>>)                                                                                                                  | `PengaturanAbsensiSiswa``AbsensiSiswaLogLokasiAntiVpnService`   |
| **Monitoring Presensi**      | Administrator, Guru                        | Activity Diagram Monitoring Presensi      | Sequence Diagram Monitoring Presensi      | `Halaman Monitoring` (<<Boundary></boundary>>)`AbsensiSiswaController` (<<Controller></controller>>)`Siswa` (<<Model></model>>)`AbsensiSiswa` (<<Model></model>>)`Database` (<<Database></database>>)                                                                                                                                                                                                      | `SiswaAbsensiSiswa`                                               |
| **Melihat Riwayat Presensi** | Siswa, Orang Tua/Wali                      | Activity Diagram Melihat Riwayat Presensi | Sequence Diagram Melihat Riwayat Presensi | `Halaman Riwayat` (<<Boundary></boundary>>)`AbsensiController` (<<Controller></controller>>)`AbsensiSiswa` (<<Model></model>>)`Database` (<<Database></database>>)                                                                                                                                                                                                                                           | `AbsensiSiswa`                                                    |
| **Pengajuan Izin dan Sakit** | Orang Tua/Wali, Guru                       | Activity Diagram Pengajuan Izin dan Sakit | Sequence Diagram Pengajuan Izin dan Sakit | `Form Pengajuan` (<<Boundary></boundary>>)`Halaman Persetujuan` (<<Boundary></boundary>>)`SuratIzinController` (<<Controller></controller>>)`SuratIzin` (<<Model></model>>)`AbsensiSiswa` (<<Model></model>>)`Database` (<<Database></database>>)                                                                                                                                                        | `SuratIzinAbsensiSiswa` (Guru dipetakan sbg Aktor & relasi Class) |

---

## 7. Daftar Temuan & Ketidaksesuaian (Konflik Instruksi vs Code)

1. **Konflik pada Use Case Presensi Pulang (Penggunaan Haversine)**:
   - **Instruksi Dosen**: Meminta agar tidak sembarangan memasukkan perhitungan Haversine di Presensi Pulang kecuali source code memang melakukannya.
   - **Temuan Source Code**: Berdasarkan file `AbsensiController.php` method `store()`, perhitungan `calculateDistance` (Haversine), pengecekan radius, dan deteksi IP AntiVpnService dieksekusi **SEBELUM** memisahkan *logic* `masuk` atau `pulang`.
   - **Penyelesaian**: Saya wajib menampilkannya secara transparan pada Activity & Sequence Diagram "Presensi Pulang", karena instruksi nomor 13 menegaskan *Jangan mengarang*. Sequence harus mengikuti fakta di source code.
2. **Representasi Aktor Administrator di Class Diagram**:
   - Model khusus Administrator (contoh: `Admin.php`) tidak digunakan untuk Autentikasi utama SIAKAD ini. Melainkan diwakili langsung oleh record di model `User` (`tbl_pengguna`) dengan attribute `level = admin`.
   - **Penyelesaian**: Autentikasi Administrator direpresentasikan oleh model `User` di Class Diagram, tanpa memaksakan membuat Class `Administrator` mandiri yang fiktif.

---

**VALIDASI AKHIR MEMASTIKAN**:

- [X] Tepat 7 Use Case
- [X] Tepat 7 Activity Diagram
- [X] Tepat 7 Sequence Diagram
- [X] Tepat 1 Class Diagram
- [X] Pemetaan 4 Aktor secara konsisten.
- [X] Diagram 100% mengikuti logika aplikasi aktual tanpa asumsi di luar kode.
