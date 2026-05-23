<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KomponenPenilaian extends Model
{
    protected $table = 'tbl_komponen_penilaian';
    protected $primaryKey = 'id_komponen';
    public $incrementing = true;

    protected $fillable = [
        'nama',
    ];

    public function bobots()
    {
        return $this->hasMany(BobotPenilaian::class, 'id_komponen', 'id_komponen');
    }

    public function details()
    {
        return $this->hasMany(PenilaianDetail::class, 'id_komponen', 'id_komponen');
    }
}
