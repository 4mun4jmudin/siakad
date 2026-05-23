<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BobotPenilaian extends Model
{
    protected $table = 'tbl_bobot_penilaian';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'id_mapel',
        'id_tahun_ajaran',
        'semester',
        'id_komponen',
        'bobot',
    ];

    protected $casts = [
        'bobot' => 'decimal:2',
    ];

    public function mapel()
    {
        return $this->belongsTo(MataPelajaran::class, 'id_mapel', 'id_mapel');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'id_tahun_ajaran', 'id_tahun_ajaran');
    }

    public function komponen()
    {
        return $this->belongsTo(KomponenPenilaian::class, 'id_komponen', 'id_komponen');
    }
}
