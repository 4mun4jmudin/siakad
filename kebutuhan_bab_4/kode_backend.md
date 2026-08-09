### 1. Struktur Database (Migration: `tbl_absensi_siswa`)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_absensi_siswa', function (Blueprint $table) {
            $table->string('id_absensi', 30)->primary();

            $table->string('id_siswa', 20);
            $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa');

            $table->date('tanggal');
            $table->time('jam_masuk')->nullable();
            $table->time('jam_pulang')->nullable();
            $table->integer('menit_keterlambatan')->nullable();

            $table->enum('status_kehadiran', ['Hadir', 'Sakit', 'Izin', 'Alfa']);
            $table->enum('metode_absen', ['GPS', 'Sidik Jari', 'Barcode', 'Manual']);

            $table->string('latitude', 50)->nullable();
            $table->string('longitude', 50)->nullable();

            $table->text('keterangan')->nullable();

            $table->unsignedBigInteger('id_penginput_manual')->nullable();
            $table->foreign('id_penginput_manual')->references('id_pengguna')->on('tbl_pengguna');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_absensi_siswa');
    }
};
```

---

### 2. Model Backend (`AbsensiSiswa.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AbsensiSiswa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tbl_absensi_siswa';
    protected $primaryKey = 'id_absensi';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_absensi',
        'id_siswa',
        'tanggal',
        'jam_masuk',
        'jam_pulang',
        'menit_keterlambatan',
        'status_kehadiran',
        'metode_absen',
        'keterangan',
        'id_penginput_manual',
        'latitude',
        'longitude'
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa');
    }
    
    public function penginputManual()
    {
        return $this->belongsTo(User::class, 'id_penginput_manual');
    }
}
```

---

### 3. Controller Presensi (`AbsensiController.php` - Fungsi Store Utama)

```php
<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\AbsensiSiswa;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AbsensiController extends Controller
{
    public function store(Request $request)
    {
        $siswa = auth()->user()->siswa;
        $tz = 'Asia/Jakarta';
        $now = Carbon::now($tz);
        $today = $now->format('Y-m-d');
        
        $mode = $request->input('mode', 'masuk');
        
        // Cek absensi yang sudah ada hari ini
        $absensiExisting = AbsensiSiswa::where('id_siswa', $siswa->id_siswa)
                                       ->where('tanggal', $today)
                                       ->first();

        // --- PROSES ABSEN MASUK ---
        if ($mode === 'masuk') {
            if ($absensiExisting && $absensiExisting->jam_masuk) {
                return back()->with('error', 'Anda sudah melakukan absen masuk hari ini.');
            }

            // Ambil batas jam masuk dari tabel Pengaturan
            $pengaturan = Pengaturan::first();
            $jamMasukBatas = Carbon::createFromTimeString($pengaturan?->jam_masuk_siswa ?? '07:00:00', $tz);
            
            $statusKehadiran = 'Hadir';
            $menitTerlambat = 0;

            if ($now->greaterThan($jamMasukBatas)) {
                $statusKehadiran = 'Terlambat';
                $menitTerlambat = $now->diffInMinutes($jamMasukBatas);
            }

            // Simpan Data Absen Masuk ke Database
            AbsensiSiswa::create([
                'id_absensi'          => (string) Str::uuid(),
                'id_siswa'            => $siswa->id_siswa,
                'tanggal'             => $today,
                'jam_masuk'           => $now->format('H:i:s'),
                'menit_keterlambatan' => $menitTerlambat,
                'status_kehadiran'    => $statusKehadiran,
                'metode_absen'        => 'GPS',
                'latitude'            => $request->latitude,
                'longitude'           => $request->longitude,
            ]);

            return back()->with('success', 'Berhasil Absen Masuk!');
        } 
        
        // --- PROSES ABSEN PULANG ---
        elseif ($mode === 'pulang') {
            if (!$absensiExisting || !$absensiExisting->jam_masuk) {
                return back()->with('error', 'Anda belum absen masuk. Silakan absen masuk dulu.');
            }

            if ($absensiExisting->jam_pulang) {
                return back()->with('error', 'Anda sudah melakukan absen pulang hari ini.');
            }

            // Update Data Absen Pulang ke Database
            $absensiExisting->update([
                'jam_pulang' => $now->format('H:i:s'),
            ]);

            return back()->with('success', 'Berhasil Absen Pulang! Hati-hati di jalan.');
        }

        return back()->with('error', 'Mode absensi tidak valid.');
    }
}
```

---

### 4. Routing Komunikasi Klien ke Server (`web.php`)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Siswa\AbsensiController;

// Rute untuk fungsionalitas presensi siswa (Membutuhkan otentikasi login)
Route::middleware(['auth', 'role:siswa'])->prefix('siswa')->group(function () {
    
    // Menampilkan Dashboard Utama Absensi (Meneruskan data ke komponen React)
    Route::get('/dashboard', [AbsensiController::class, 'index'])->name('siswa.dashboard');
    
    // Menerima HTTP POST request untuk menyimpan data presensi (Masuk/Pulang)
    Route::post('/absensi', [AbsensiController::class, 'store'])->name('siswa.absensi.store');
    
    // Mengambil dan menampilkan data riwayat kehadiran
    Route::get('/absensi/riwayat', [AbsensiController::class, 'riwayat'])->name('siswa.absensi.riwayat');

});
```
