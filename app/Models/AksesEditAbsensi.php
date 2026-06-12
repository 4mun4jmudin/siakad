<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AksesEditAbsensi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tbl_akses_edit_absensi';

    protected $fillable = [
        'id_guru',
        'id_jadwal',
        'tanggal_absensi',
        'alasan',
        'status',
        'catatan_admin',
        'disetujui_oleh',
        'disetujui_pada',
        'expired_at',
        'used_at',
        'last_edited_at',
    ];

    protected $casts = [
        'tanggal_absensi' => 'date',
        'disetujui_pada'  => 'datetime',
        'expired_at'      => 'datetime',
        'used_at'         => 'datetime',
        'last_edited_at'  => 'datetime',
    ];

    // ----- Relasi -----

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'id_guru', 'id_guru');
    }

    public function jadwal()
    {
        return $this->belongsTo(JadwalMengajar::class, 'id_jadwal', 'id_jadwal');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh', 'id_pengguna');
    }

    // ----- Helper -----

    /**
     * Cek apakah akses edit ini masih aktif (disetujui dan belum expired).
     */
    public function isAktif(): bool
    {
        return $this->status === 'Disetujui'
            && $this->expired_at
            && Carbon::now()->lt($this->expired_at);
    }

    /**
     * Scope: hanya pengajuan yang statusnya 'Diajukan'.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'Diajukan');
    }

    /**
     * Scope: hanya akses yang masih aktif (disetujui & belum expired).
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'Disetujui')
                     ->where('expired_at', '>', Carbon::now());
    }

    /**
     * Scope: pengajuan untuk guru + jadwal + tanggal tertentu.
     */
    public function scopeForContext($query, string $idGuru, string $idJadwal, string $tanggal)
    {
        return $query->where('id_guru', $idGuru)
                     ->where('id_jadwal', $idJadwal)
                     ->whereDate('tanggal_absensi', $tanggal);
    }
}
