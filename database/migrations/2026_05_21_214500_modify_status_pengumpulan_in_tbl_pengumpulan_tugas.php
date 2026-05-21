<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tbl_pengumpulan_tugas', function (Blueprint $table) {
            $table->string('status_pengumpulan', 50)->default('Menunggu Penilaian')->change();
            $table->dateTime('waktu_pengumpulan')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pengumpulan_tugas', function (Blueprint $table) {
            $table->enum('status_pengumpulan', ['Tepat Waktu', 'Terlambat'])->default('Tepat Waktu')->change();
            $table->dateTime('waktu_pengumpulan')->nullable(false)->change();
        });
    }
};
