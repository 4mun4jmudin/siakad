<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SusKuesioner extends Model
{
    use HasFactory;

    protected $table = 'tbl_sus_kuesioner';
    protected $primaryKey = 'id_kuesioner';

    protected $fillable = [
        'id_pengguna',
        'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
        'skor_sus'
    ];

    public function pengguna()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }
}
