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
        Schema::create('tbl_tugas', function (Blueprint $table) {
            $table->id('id_tugas');
            $table->string('id_jadwal', 20);
            $table->foreign('id_jadwal')->references('id_jadwal')->on('tbl_jadwal_mengajar')->onDelete('cascade');
            
            $table->string('judul_tugas', 150);
            $table->text('deskripsi_tugas')->nullable();
            $table->string('file_lampiran')->nullable();
            $table->dateTime('tenggat_waktu');
            $table->enum('status', ['Aktif', 'Ditutup'])->default('Aktif');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_tugas');
    }
};
