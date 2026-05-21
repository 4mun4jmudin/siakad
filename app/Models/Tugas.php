<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tugas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tbl_tugas';
    protected $primaryKey = 'id_tugas';
    
    protected $fillable = [
        'id_jadwal',
        'judul_tugas',
        'deskripsi_tugas',
        'file_lampiran',
        'tenggat_waktu',
        'status',
        'tipe_tugas',
    ];

    protected $casts = [
        'tenggat_waktu' => 'datetime',
    ];

    protected $appends = [
        'deskripsi',
        'file_tugas',
    ];

    public function getDeskripsiAttribute()
    {
        return $this->deskripsi_tugas;
    }

    public function getFileTugasAttribute()
    {
        return $this->file_lampiran;
    }

    public function jadwalMengajar()
    {
        return $this->belongsTo(JadwalMengajar::class, 'id_jadwal', 'id_jadwal');
    }

    public function pengumpulan()
    {
        return $this->hasMany(PengumpulanTugas::class, 'id_tugas', 'id_tugas');
    }

    public function pengumpulanTugas()
    {
        return $this->hasMany(PengumpulanTugas::class, 'id_tugas', 'id_tugas');
    }
}
