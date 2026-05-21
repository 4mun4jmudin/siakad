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
        Schema::table('tbl_tugas', function (Blueprint $table) {
            $table->enum('tipe_tugas', ['Upload', 'Pemberitahuan'])->default('Upload')->after('id_jadwal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_tugas', function (Blueprint $table) {
            $table->dropColumn('tipe_tugas');
        });
    }
};
