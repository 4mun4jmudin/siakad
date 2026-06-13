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
        Schema::create('tbl_pengajuan_guru_pengganti', function (Blueprint $table) {
            $table->id('id_pengajuan');
            $table->string('id_jadwal', 20);
            $table->date('tanggal');
            
            // Siapa yang meminta
            $table->string('id_guru_peminta', 20)->nullable();
            // Jika diajukan admin
            $table->unsignedBigInteger('id_admin')->nullable();
            
            // Siapa yang menerima/menggantikan
            $table->string('id_guru_pengganti', 20)->nullable();
            
            $table->enum('status', ['pending', 'accepted', 'closed'])->default('pending');
            $table->text('keterangan')->nullable();
            
            $table->timestamps();

            $table->foreign('id_jadwal')->references('id_jadwal')->on('tbl_jadwal_mengajar')->onDelete('cascade');
            $table->foreign('id_guru_peminta')->references('id_guru')->on('tbl_guru')->onDelete('cascade');
            $table->foreign('id_guru_pengganti')->references('id_guru')->on('tbl_guru')->onDelete('set null');
            $table->foreign('id_admin')->references('id_pengguna')->on('tbl_pengguna')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_pengajuan_guru_pengganti');
    }
};
