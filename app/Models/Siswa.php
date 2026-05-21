<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Siswa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tbl_siswa';
    protected $primaryKey = 'id_siswa';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_siswa',
        'nis',
        'nisn',
        'id_kelas',
        'nama_lengkap',
        'nama_panggilan',
        'foto_profil',
        'nik',
        'nomor_kk',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama',
        'alamat_lengkap',
        'anak_ke',
        'jumlah_saudara',
        'sekolah_asal',
        'tahun_lulus',
        'nama_ayah',
        'nik_ayah',
        'pendidikan_ayah',
        'pekerjaan_ayah',
        'penghasilan_ayah',
        'nama_ibu',
        'nik_ibu',
        'pendidikan_ibu',
        'pekerjaan_ibu',
        'penghasilan_ibu',
        'nama_wali',
        'no_hp_wali',
        'alamat_wali',
        'status',
        'sidik_jari_template',
        'barcode_id',
        'id_pengguna',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['is_data_lengkap', 'kelengkapan_data', 'foto_profil_url'];

    /**
     * Daftar field yang dihitung untuk kelengkapan data.
     */
    private static function biodataFields(): array
    {
        return [
            // Data Pribadi
            'nisn', 'nik', 'nomor_kk', 'tempat_lahir', 'tanggal_lahir',
            'jenis_kelamin', 'agama', 'alamat_lengkap',
            'anak_ke', 'jumlah_saudara',
            // Asal Sekolah
            'sekolah_asal', 'tahun_lulus',
            // Informasi Ayah
            'nama_ayah', 'nik_ayah', 'pendidikan_ayah', 'pekerjaan_ayah', 'penghasilan_ayah',
            // Informasi Ibu
            'nama_ibu', 'nik_ibu', 'pendidikan_ibu', 'pekerjaan_ibu', 'penghasilan_ibu',
            // Kontak Wali
            'nama_wali', 'no_hp_wali', 'alamat_wali',
        ];
    }

    /**
     * Accessor: persentase kelengkapan data (0-100).
     */
    protected function kelengkapanData(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $fields = self::biodataFields();
                $total  = count($fields);
                $filled = 0;

                foreach ($fields as $field) {
                    if (!empty($attributes[$field]) && $attributes[$field] !== '-') {
                        $filled++;
                    }
                }

                return $total > 0 ? round(($filled / $total) * 100) : 0;
            }
        );
    }

    /**
     * Accessor: apakah data sudah 100% lengkap.
     */
    protected function isDataLengkap(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $fields = self::biodataFields();
                foreach ($fields as $field) {
                    if (empty($attributes[$field]) || $attributes[$field] === '-') {
                        return false;
                    }
                }
                return true;
            }
        );
    }

    protected function fotoProfilUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $foto = $attributes['foto_profil'] ?? null;

                if (!$foto) return null;

                // kalau sudah URL penuh
                if (filter_var($foto, FILTER_VALIDATE_URL)) return $foto;

                // normalisasi biar "public/..." atau "/storage/..." nggak bikin exists() gagal
                $foto = ltrim($foto, '/');
                $foto = preg_replace('#^storage/#', '', $foto);
                $foto = preg_replace('#^public/#', '', $foto);

                if (!Storage::disk('public')->exists($foto)) {
                    return null;
                }

                // cache busting: ganti query string ketika updated_at berubah
                $v = $attributes['updated_at'] ?? time();

                return route('storage.public', ['path' => $foto], false) . '?v=' . urlencode($v);
            }
        );
    }



    /**
     * Relasi ke model Kelas.
     */
    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'id_kelas');
    }
    public function orangTuaWalis()
    {
        return $this->belongsToMany(OrangTuaWali::class, 'tbl_wali_siswa', 'id_siswa', 'id_wali');
    }
    public function absensi()
    {
        return $this->hasMany(AbsensiSiswa::class, 'id_siswa', 'id_siswa');
    }

    public function pengguna()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }
}
