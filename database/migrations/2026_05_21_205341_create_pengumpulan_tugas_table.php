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
        Schema::create('tbl_pengumpulan_tugas', function (Blueprint $table) {
            $table->id('id_pengumpulan');
            
            $table->unsignedBigInteger('id_tugas');
            $table->foreign('id_tugas')->references('id_tugas')->on('tbl_tugas')->onDelete('cascade');
            
            $table->string('id_siswa', 20);
            $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa')->onDelete('cascade');
            
            $table->string('file_jawaban')->nullable();
            $table->text('teks_jawaban')->nullable();
            $table->dateTime('waktu_pengumpulan');
            $table->enum('status_pengumpulan', ['Tepat Waktu', 'Terlambat'])->default('Tepat Waktu');
            
            $table->integer('nilai')->nullable();
            $table->text('catatan_guru')->nullable();

            $table->timestamps();
            $table->softDeletes();
            
            // Satu siswa hanya bisa mengumpulkan satu kali per tugas
            $table->unique(['id_tugas', 'id_siswa'], 'unique_tugas_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_pengumpulan_tugas');
    }
};
