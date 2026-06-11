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
        Schema::table('tbl_komponen_penilaian', function (Blueprint $table) {
            $table->string('kode', 10)->nullable()->after('nama');
            $table->string('tipe', 50)->nullable()->after('kode');
            $table->integer('bobot_default')->default(0)->after('tipe');
            $table->boolean('aktif')->default(true)->after('bobot_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_komponen_penilaian', function (Blueprint $table) {
            $table->dropColumn(['kode', 'tipe', 'bobot_default', 'aktif']);
        });
    }
};
