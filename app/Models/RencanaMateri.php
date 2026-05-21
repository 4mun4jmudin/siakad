<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RencanaMateri extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tbl_rencana_materi';
    protected $primaryKey = 'id_rencana';
    
    protected $fillable = [
        'id_mapel',
        'tingkat_kelas',
        'judul_materi',
        'deskripsi',
        'pertemuan_ke',
    ];

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'id_mapel', 'id_mapel');
    }

    public function jurnalMengajar()
    {
        return $this->hasMany(JurnalMengajar::class, 'id_rencana_materi', 'id_rencana');
    }
}
