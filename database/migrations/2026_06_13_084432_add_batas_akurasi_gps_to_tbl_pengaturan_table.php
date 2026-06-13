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
            $table->integer('batas_akurasi_gps')->default(50)->after('radius_absen_meters')->comment('Batas maksimal akurasi GPS dalam meter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pengaturan', function (Blueprint $table) {
            $table->dropColumn('batas_akurasi_gps');
        });
    }
};
