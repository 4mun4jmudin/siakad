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
        // 1. Rename 'Absensi' to 'Kehadiran' and update bobot
        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'Absensi')
            ->update([
                'nama' => 'Kehadiran',
                'bobot_default' => 5,
                'updated_at' => now(),
            ]);

        // 2. Update 'Tugas'
        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'Tugas')
            ->update([
                'bobot_default' => 25,
                'updated_at' => now(),
            ]);

        // 3. Rename 'UTS' to 'UTS/STS' and update bobot
        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'UTS')
            ->update([
                'nama' => 'UTS/STS',
                'bobot_default' => 15,
                'updated_at' => now(),
            ]);

        // 4. Rename 'UAS' to 'UAS/SAS' and update bobot
        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'UAS')
            ->update([
                'nama' => 'UAS/SAS',
                'bobot_default' => 25,
                'updated_at' => now(),
            ]);

        // 5. Delete 'PAS' if exists
        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'PAS')
            ->delete();

        // 6. Insert 'Praktik/Projek' if it doesn't exist
        $exists = DB::table('tbl_komponen_penilaian')->where('nama', 'Praktik/Projek')->exists();
        if (!$exists) {
            DB::table('tbl_komponen_penilaian')->insert([
                'nama' => 'Praktik/Projek',
                'kode' => 'PRJ',
                'tipe' => 'Formatif',
                'bobot_default' => 30,
                'aktif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not necessary to reverse precisely, but we can restore basic names
        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'Kehadiran')
            ->update(['nama' => 'Absensi', 'bobot_default' => 15]);

        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'Tugas')
            ->update(['bobot_default' => 20]);

        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'UTS/STS')
            ->update(['nama' => 'UTS', 'bobot_default' => 30]);

        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'UAS/SAS')
            ->update(['nama' => 'UAS', 'bobot_default' => 40]);

        DB::table('tbl_komponen_penilaian')
            ->where('nama', 'Praktik/Projek')
            ->delete();
    }
};
