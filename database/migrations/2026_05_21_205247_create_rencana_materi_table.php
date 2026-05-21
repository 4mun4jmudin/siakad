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
        Schema::create('tbl_rencana_materi', function (Blueprint $table) {
            $table->id('id_rencana');
            $table->string('id_mapel', 20);
            $table->foreign('id_mapel')->references('id_mapel')->on('tbl_mata_pelajaran')->onDelete('cascade');
            $table->string('tingkat_kelas', 10)->nullable(); // e.g. X, XI, XII
            $table->string('judul_materi', 150);
            $table->text('deskripsi')->nullable();
            $table->integer('pertemuan_ke')->nullable(); // Target for which meeting
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_rencana_materi');
    }
};
