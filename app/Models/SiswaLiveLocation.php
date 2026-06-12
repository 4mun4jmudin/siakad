<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiswaLiveLocation extends Model
{
    use HasFactory;

    protected $table = 'tbl_siswa_live_locations';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'id_siswa',
        'latitude',
        'longitude',
        'accuracy',
        'distance_meters',
        'status',
        'is_online',
        'ip_address',
        'user_agent',
        'network_meta',
        'location_meta',
        'last_seen_at',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'last_seen_at' => 'datetime',
        'network_meta' => 'array',
        'location_meta' => 'array',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }
}
