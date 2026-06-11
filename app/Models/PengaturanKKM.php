<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanKKM extends Model
{
    protected $table = 'tbl_pengaturan_kkm';

    protected $fillable = [
        'id_mapel',
        'id_tahun_ajaran',
        'semester',
        'jurusan',
        'kkm',
    ];

    protected $casts = [
        'kkm' => 'decimal:2',
    ];

    public function mapel()
    {
        return $this->belongsTo(MataPelajaran::class, 'id_mapel', 'id_mapel');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'id_tahun_ajaran', 'id_tahun_ajaran');
    }
}
