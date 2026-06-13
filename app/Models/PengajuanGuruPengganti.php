<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanGuruPengganti extends Model
{
    //
    protected $table = 'tbl_pengajuan_guru_pengganti';
    protected $primaryKey = 'id_pengajuan';

    protected $fillable = [
        'id_jadwal',
        'tanggal',
        'id_guru_peminta',
        'id_admin',
        'id_guru_pengganti',
        'status',
        'keterangan',
    ];

    public function jadwal()
    {
        return $this->belongsTo(JadwalMengajar::class, 'id_jadwal', 'id_jadwal');
    }

    public function guruPeminta()
    {
        return $this->belongsTo(Guru::class, 'id_guru_peminta', 'id_guru');
    }

    public function guruPengganti()
    {
        return $this->belongsTo(Guru::class, 'id_guru_pengganti', 'id_guru');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'id_admin', 'id_pengguna');
    }

    public function targets()
    {
        return $this->hasMany(PengajuanGuruTarget::class, 'id_pengajuan', 'id_pengajuan');
    }
}
