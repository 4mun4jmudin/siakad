<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanPredikat extends Model
{
    protected $table = 'tbl_pengaturan_predikat';

    protected $fillable = [
        'id_tahun_ajaran',
        'semester',
        'predikat',
        'batas_bawah',
        'batas_atas',
    ];

    protected $casts = [
        'batas_bawah' => 'decimal:2',
        'batas_atas'  => 'decimal:2',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'id_tahun_ajaran', 'id_tahun_ajaran');
    }
}
