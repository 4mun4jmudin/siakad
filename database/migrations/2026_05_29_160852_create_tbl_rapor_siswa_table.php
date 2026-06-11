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
        Schema::create('tbl_rapor_siswa', function (Blueprint $table) {
            $table->id('id_rapor');
            $table->string('id_siswa');
            $table->string('id_kelas');
            $table->string('id_tahun_ajaran');
            $table->enum('semester', ['Ganjil', 'Genap']);
            $table->decimal('rata_rata', 5, 2)->nullable();
            $table->integer('peringkat_kelas')->nullable();
            $table->text('catatan_wali')->nullable();
            $table->timestamps();

            // Foreign keys if necessary (assuming they exist in your schema)
            // $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_rapor_siswa');
    }
};
