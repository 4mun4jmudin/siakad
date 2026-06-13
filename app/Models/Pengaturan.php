<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Pengaturan extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terkait dengan model.
     *
     * @var string
     */
    protected $table = 'tbl_pengaturan';

    /**
     * Atribut yang dapat diisi.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_sekolah',
        'alamat_sekolah',
        'kepala_sekolah',
        'tahun_ajaran_aktif',
        'semester_aktif',
        'logo_url',
        'jam_masuk_siswa',
        'jam_pulang_siswa',
        'jam_masuk_guru',
        'jam_pulang_guru',
        'batas_terlambat_siswa',
        'batas_terlambat_guru',
        'login_barcode_enabled',
        'login_fingerprint_enabled',
        'login_manual_enabled',
        'absensi_manual_guru_enabled',
        'password_min_length',
        'password_require_upper',
        'password_expiry_days',
        'auto_create_user',
        'backup_auto_enabled',
        'backup_time',
        'backup_retention_days',
        'lokasi_sekolah_latitude',
        'lokasi_sekolah_longitude',
        'radius_absen_meters',
        'batas_akurasi_gps',
        'jadwal_hari',
        'jadwal_waktu',
        'is_kunci_absensi',
        'is_kunci_jurnal',
    ];

    /**
     * Tipe data yang dicasting.
     *
     * @var array
     */
    protected $casts = [
        'is_kunci_absensi' => 'boolean',
        'is_kunci_jurnal' => 'boolean',
        'login_barcode_enabled' => 'boolean',
        'login_fingerprint_enabled' => 'boolean',
        'login_manual_enabled' => 'boolean',
        'absensi_manual_guru_enabled' => 'boolean',
        'password_require_upper' => 'boolean',
        'auto_create_user' => 'boolean',
        'backup_auto_enabled' => 'boolean',
        'jadwal_hari' => 'array',
        'jadwal_waktu' => 'array',
    ];

    /**
     * Accessor untuk jadwal_hari fallback
     */
    public function getJadwalHariAttribute($value)
    {
        $decoded = json_decode($value, true);
        return $decoded ?: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    }

    /**
     * Accessor untuk jadwal_waktu fallback
     */
    public function getJadwalWaktuAttribute($value)
    {
        $decoded = json_decode($value, true);
        return $decoded ?: [
            ["id" => "duha", "type" => "istirahat", "label" => "07:00 - 08:00", "keterangan" => "Wajib Shalat Duha", "start" => "07:00", "end" => "08:00"],
            ["id" => "1", "type" => "pelajaran", "label" => "08:00 - 09:30", "start" => "08:00", "end" => "09:30"],
            ["id" => "2", "type" => "pelajaran", "label" => "09:30 - 11:00", "start" => "09:30", "end" => "11:00"],
            ["id" => "ist1", "type" => "istirahat", "label" => "11:00 - 11:15", "keterangan" => "Istirahat", "start" => "11:00", "end" => "11:15"],
            ["id" => "3", "type" => "pelajaran", "label" => "11:15 - 12:00", "start" => "11:15", "end" => "12:00"],
            ["id" => "ist2", "type" => "istirahat", "label" => "12:00 - 13:00", "keterangan" => "Istirahat & Shalat Dzuhur", "start" => "12:00", "end" => "13:00"],
            ["id" => "4", "type" => "pelajaran", "label" => "13:00 - 14:30", "start" => "13:00", "end" => "14:30"]
        ];
    }
}