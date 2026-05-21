<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengumpulanTugas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tbl_pengumpulan_tugas';
    protected $primaryKey = 'id_pengumpulan';
    
    protected $fillable = [
        'id_tugas',
        'id_siswa',
        'file_jawaban',
        'teks_jawaban',
        'waktu_pengumpulan',
        'status_pengumpulan',
        'nilai',
        'catatan_guru',
    ];

    protected $casts = [
        'waktu_pengumpulan' => 'datetime',
    ];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class, 'id_tugas', 'id_tugas');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }
}
