<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_pengaturan_kkm', function (Blueprint $table) {
            $table->id();
            $table->string('id_mapel', 20);
            $table->string('id_tahun_ajaran', 20);
            $table->enum('semester', ['Ganjil', 'Genap']);
            $table->string('jurusan', 50)->nullable();
            $table->decimal('kkm', 5, 2)->default(75);
            $table->timestamps();

            $table->foreign('id_mapel')->references('id_mapel')->on('tbl_mata_pelajaran')->onDelete('cascade');
            $table->foreign('id_tahun_ajaran')->references('id_tahun_ajaran')->on('tbl_tahun_ajaran')->onDelete('cascade');

            $table->unique(['id_mapel', 'id_tahun_ajaran', 'semester', 'jurusan'], 'kkm_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_pengaturan_kkm');
    }
};
