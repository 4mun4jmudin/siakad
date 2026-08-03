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
        Schema::table('tbl_pengaturan', function (Blueprint $table) {
            $table->enum('mode_admin', ['full', 'absensi'])->default('full')->after('is_kunci_jurnal');
            $table->enum('mode_guru', ['full', 'absensi'])->default('full')->after('mode_admin');
            $table->enum('mode_siswa', ['full', 'absensi'])->default('full')->after('mode_guru');
            $table->enum('mode_ortu', ['full', 'absensi'])->default('full')->after('mode_siswa');
            if (Schema::hasColumn('tbl_pengaturan', 'mode_sistem')) {
                $table->dropColumn('mode_sistem');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pengaturan', function (Blueprint $table) {
            $table->dropColumn(['mode_admin', 'mode_guru', 'mode_siswa', 'mode_ortu']);
            $table->enum('mode_sistem', ['full', 'absensi'])->default('full');
        });
    }
};
