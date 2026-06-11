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
        Schema::table('tbl_pengaturan', function (Blueprint $table) {
            $table->json('jadwal_hari')->nullable()->after('radius_absen_meters');
            $table->json('jadwal_waktu')->nullable()->after('jadwal_hari');
        });

        // Seed default data
        $defaultHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $defaultWaktu = [
            ["id" => "duha", "type" => "istirahat", "label" => "07:00 - 08:00", "keterangan" => "Wajib Shalat Duha", "start" => "07:00", "end" => "08:00"],
            ["id" => "1", "type" => "pelajaran", "label" => "08:00 - 09:30", "start" => "08:00", "end" => "09:30"],
            ["id" => "2", "type" => "pelajaran", "label" => "09:30 - 11:00", "start" => "09:30", "end" => "11:00"],
            ["id" => "ist1", "type" => "istirahat", "label" => "11:00 - 11:15", "keterangan" => "Istirahat", "start" => "11:00", "end" => "11:15"],
            ["id" => "3", "type" => "pelajaran", "label" => "11:15 - 12:00", "start" => "11:15", "end" => "12:00"],
            ["id" => "ist2", "type" => "istirahat", "label" => "12:00 - 13:00", "keterangan" => "Istirahat & Shalat Dzuhur", "start" => "12:00", "end" => "13:00"],
            ["id" => "4", "type" => "pelajaran", "label" => "13:00 - 14:30", "start" => "13:00", "end" => "14:30"]
        ];

        DB::table('tbl_pengaturan')->update([
            'jadwal_hari' => json_encode($defaultHari),
            'jadwal_waktu' => json_encode($defaultWaktu)
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pengaturan', function (Blueprint $table) {
            $table->dropColumn(['jadwal_hari', 'jadwal_waktu']);
        });
    }
};
