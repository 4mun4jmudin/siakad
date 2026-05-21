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
        Schema::table('tbl_mata_pelajaran', function (Blueprint $table) {
            $table->string('id_guru_default', 20)->nullable()->after('kategori');
            
            // Optional: add foreign key constraint if tbl_guru exists and primary key is string
            $table->foreign('id_guru_default')->references('id_guru')->on('tbl_guru')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_mata_pelajaran', function (Blueprint $table) {
            $table->dropForeign(['id_guru_default']);
            $table->dropColumn('id_guru_default');
        });
    }
};
