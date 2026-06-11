<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_pengaturan_predikat', function (Blueprint $table) {
            $table->id();
            $table->string('id_tahun_ajaran', 20);
            $table->enum('semester', ['Ganjil', 'Genap']);
            $table->char('predikat', 2);
            $table->decimal('batas_bawah', 5, 2);
            $table->decimal('batas_atas', 5, 2);
            $table->timestamps();

            $table->foreign('id_tahun_ajaran')->references('id_tahun_ajaran')->on('tbl_tahun_ajaran')->onDelete('cascade');
            $table->unique(['id_tahun_ajaran', 'semester', 'predikat'], 'predikat_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_pengaturan_predikat');
    }
};
