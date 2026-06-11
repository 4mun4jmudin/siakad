<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('tbl_komponen_penilaian')->where('nama', 'Tugas')->update(['kode' => 'TGS', 'tipe' => 'Formatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'UTS/STS')->update(['kode' => 'STS', 'tipe' => 'Sumatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'UAS/SAS')->update(['kode' => 'SAS', 'tipe' => 'Sumatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'Kehadiran')->update(['kode' => 'AB', 'tipe' => 'Non-Akademik']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'Praktik/Projek')->update(['kode' => 'PRJ', 'tipe' => 'Sumatif']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('tbl_komponen_penilaian')->where('nama', 'Tugas')->update(['kode' => null, 'tipe' => 'Formatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'UTS/STS')->update(['kode' => null, 'tipe' => 'Formatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'UAS/SAS')->update(['kode' => null, 'tipe' => 'Formatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'Kehadiran')->update(['kode' => 'AB', 'tipe' => 'Formatif']);
        DB::table('tbl_komponen_penilaian')->where('nama', 'Praktik/Projek')->update(['kode' => 'PRJ', 'tipe' => 'Formatif']);
    }
};
