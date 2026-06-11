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
        Schema::create('tbl_remedial', function (Blueprint $table) {
            $table->id('id_remedial');
            $table->unsignedBigInteger('id_penilaian');
            $table->string('komponen')->nullable();
            $table->decimal('nilai_awal', 5, 2)->nullable();
            $table->decimal('nilai_remedial', 5, 2)->nullable();
            $table->date('tanggal')->nullable();
            $table->string('metode')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Foreign key to tbl_penilaian_mapel
            $table->foreign('id_penilaian')->references('id_penilaian')->on('tbl_penilaian_mapel')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_remedial');
    }
};
