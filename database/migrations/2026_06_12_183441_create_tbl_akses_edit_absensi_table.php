<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_akses_edit_absensi', function (Blueprint $table) {
            $table->id();

            // Scope: 1 guru + 1 jadwal + 1 tanggal
            $table->string('id_guru')->comment('FK → tbl_guru');
            $table->string('id_jadwal')->comment('FK → tbl_jadwal_mengajar');
            $table->date('tanggal_absensi')->comment('Tanggal absensi yang ingin diedit');

            $table->text('alasan')->comment('Alasan guru minta akses edit');

            $table->enum('status', ['Diajukan', 'Disetujui', 'Ditolak'])
                  ->default('Diajukan');

            $table->text('catatan_admin')->nullable()->comment('Catatan admin saat approve/reject');

            // Admin yang memproses
            $table->unsignedBigInteger('disetujui_oleh')->nullable()->comment('FK → tbl_pengguna');
            $table->timestamp('disetujui_pada')->nullable();

            // Batas akses & tracking penggunaan
            $table->timestamp('expired_at')->nullable()->comment('Kapan akses berakhir (disetujui_pada + 24 jam)');
            $table->timestamp('used_at')->nullable()->comment('Kapan guru pertama kali menggunakan akses');
            $table->timestamp('last_edited_at')->nullable()->comment('Kapan terakhir guru mengedit absensi via akses ini');

            $table->timestamps();
            $table->softDeletes();

            // Index untuk query cepat
            $table->index(['id_guru', 'status']);
            $table->index(['id_jadwal', 'tanggal_absensi']);
            $table->index('status');

            // Foreign keys
            $table->foreign('id_guru')->references('id_guru')->on('tbl_guru')->cascadeOnDelete();
            $table->foreign('id_jadwal')->references('id_jadwal')->on('tbl_jadwal_mengajar')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_akses_edit_absensi');
    }
};
