<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanPenilaianConfig extends Model
{
    protected $table = 'tbl_pengaturan_penilaian';

    protected $fillable = ['key', 'value'];

    /**
     * Ambil nilai config berdasarkan key.
     */
    public static function getValue(string $key, $default = null): ?string
    {
        $row = static::where('key', $key)->first();
        return $row?->value ?? $default;
    }

    /**
     * Set nilai config berdasarkan key.
     */
    public static function setValue(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Ambil semua config sebagai associative array.
     */
    public static function allConfig(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
