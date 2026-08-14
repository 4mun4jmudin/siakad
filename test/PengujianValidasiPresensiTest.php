<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Siswa;
use App\Models\User;
use App\Models\Pengaturan;
use App\Models\AbsensiSiswa;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * Pengujian Fungsi Validasi Presensi
 * 
 * Pengujian ini memastikan bahwa sistem memberikan hasil yang sesuai:
 * 1. Berhasil presensi ketika dalam radius dan waktu yang tepat.
 * 2. Gagal presensi ketika berada di luar radius sekolah.
 * 3. Gagal presensi ketika jam masuk belum dibuka (lebih dari 15 menit sebelum jam masuk).
 * 4. Gagal presensi jika terdeteksi Fake GPS atau tidak ada data lokasi.
 */
class ValidasiPresensiTest extends TestCase
{
    use RefreshDatabase;

    protected $siswa;
    protected $pengaturan;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Buat Pengaturan Mock (Jam Masuk: 07:00, Radius: 200 meter)
        $this->pengaturan = Pengaturan::create([
            'nama_sekolah' => 'SMK Negeri 1 Test',
            'jam_masuk' => '07:00:00',
            'jam_pulang' => '15:00:00',
            'latitude' => '-6.175110',
            'longitude' => '106.865039',
            'radius_absen_meters' => 200,
        ]);

        // 2. Buat Akun Siswa Mock
        $user = User::create([
            'id_pengguna' => 'USR-TEST-01',
            'username' => 'siswa_test',
            'password' => Hash::make('password123'),
            'peran' => 'siswa'
        ]);

        $this->siswa = Siswa::create([
            'id_siswa' => 'SISWA-01',
            'id_pengguna' => $user->id_pengguna,
            'nis' => '12345678',
            'nama_lengkap' => 'Siswa Test Validasi',
            'jenis_kelamin' => 'L'
        ]);
    }

    /**
     * Skenario 1: Kondisi Terpenuhi (Berhasil Presensi Masuk)
     * Jarak valid (50 meter), Waktu valid (06:55)
     */
    public function test_absensi_berhasil_saat_kondisi_terpenuhi()
    {
        // Simulasi waktu ke 06:55 (5 menit sebelum jam masuk)
        Carbon::setTestNow(Carbon::today()->setTime(6, 55));

        $response = $this->actingAs($this->siswa->user)->post(route('siswa.absensi.store'), [
            'mode' => 'masuk',
            'latitude' => '-6.175110', 
            'longitude' => '106.865039',
            'accuracy' => '15',
            'distance_to_school' => '50', // 50m < 200m (Valid)
            'location_meta' => json_encode(['is_fake_gps' => false])
        ]);

        // Memastikan presensi masuk berhasil dan tercatat di database
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('tbl_absensi_siswa', [
            'id_siswa' => $this->siswa->id_siswa,
            'status_kehadiran' => 'Hadir',
            'jam_masuk' => '06:55:00',
        ]);
    }

    /**
     * Skenario 2: Kondisi Tidak Terpenuhi (Di Luar Radius)
     * Jarak tidak valid (350 meter), Waktu valid (06:50)
     */
    public function test_absensi_gagal_karena_di_luar_radius()
    {
        Carbon::setTestNow(Carbon::today()->setTime(6, 50));

        $response = $this->actingAs($this->siswa->user)->post(route('siswa.absensi.store'), [
            'mode' => 'masuk',
            'latitude' => '-6.178000', 
            'longitude' => '106.869000',
            'accuracy' => '20',
            'distance_to_school' => '350', // 350m > 200m (Tidak Valid)
            'location_meta' => json_encode(['is_fake_gps' => false])
        ]);

        // Memastikan sistem menolak presensi dengan pesan error
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('tbl_absensi_siswa', [
            'id_siswa' => $this->siswa->id_siswa,
            'status_kehadiran' => 'Hadir'
        ]);
    }

    /**
     * Skenario 3: Kondisi Tidak Terpenuhi (Belum Waktunya Absen)
     * Jarak valid (10 meter), Waktu tidak valid (06:30 - lebih dari 15 menit sebelum 07:00)
     */
    public function test_absensi_gagal_karena_waktu_belum_dibuka()
    {
        Carbon::setTestNow(Carbon::today()->setTime(6, 30)); // Terlalu pagi

        $response = $this->actingAs($this->siswa->user)->post(route('siswa.absensi.store'), [
            'mode' => 'masuk',
            'latitude' => '-6.175110', 
            'longitude' => '106.865039',
            'accuracy' => '10',
            'distance_to_school' => '10', // Jarak aman
            'location_meta' => json_encode(['is_fake_gps' => false])
        ]);

        // Memastikan sistem menolak dengan pesan error waktu
        $response->assertSessionHas('error');
        $this->assertStringContainsString('Absensi belum dibuka', session('error'));
    }

    /**
     * Skenario 4: Kondisi Tidak Terpenuhi (Terindikasi Fake GPS)
     */
    public function test_absensi_gagal_karena_indikasi_fake_gps()
    {
        Carbon::setTestNow(Carbon::today()->setTime(6, 50));

        $response = $this->actingAs($this->siswa->user)->post(route('siswa.absensi.store'), [
            'mode' => 'masuk',
            'latitude' => '-6.175110', 
            'longitude' => '106.865039',
            'accuracy' => '5',
            'distance_to_school' => '15',
            'location_meta' => json_encode(['is_fake_gps' => true]) // Indikasi Fake GPS True
        ]);

        // Memastikan sistem menolak dengan pesan error keamanan
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('tbl_absensi_siswa', [
            'id_siswa' => $this->siswa->id_siswa
        ]);
    }
}
