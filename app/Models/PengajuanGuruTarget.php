<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanGuruTarget extends Model
{
    //
    protected $table = 'tbl_pengajuan_guru_target';
    protected $primaryKey = 'id_target';

    protected $fillable = [
        'id_pengajuan',
        'id_guru_target',
        'status',
    ];

    public function pengajuan()
    {
        return $this->belongsTo(PengajuanGuruPengganti::class, 'id_pengajuan', 'id_pengajuan');
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'id_guru_target', 'id_guru');
    }
}
