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
        Schema::create('tbl_pengajuan_guru_target', function (Blueprint $table) {
            $table->id('id_target');
            $table->unsignedBigInteger('id_pengajuan');
            $table->string('id_guru_target', 20);
            
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->foreign('id_pengajuan')->references('id_pengajuan')->on('tbl_pengajuan_guru_pengganti')->onDelete('cascade');
            $table->foreign('id_guru_target')->references('id_guru')->on('tbl_guru')->onDelete('cascade');
            
            // Mencegah duplikasi target pada satu pengajuan
            $table->unique(['id_pengajuan', 'id_guru_target']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_pengajuan_guru_target');
    }
};
