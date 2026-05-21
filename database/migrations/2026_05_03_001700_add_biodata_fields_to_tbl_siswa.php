<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan kolom biodata lengkap ke tabel siswa.
     */
    public function up(): void
    {
        Schema::table('tbl_siswa', function (Blueprint $table) {
            // Data Pribadi Tambahan
            $table->unsignedTinyInteger('anak_ke')->nullable()->after('alamat_lengkap');
            $table->unsignedTinyInteger('jumlah_saudara')->nullable()->after('anak_ke');

            // Asal Sekolah
            $table->string('sekolah_asal', 100)->nullable()->after('jumlah_saudara');
            $table->string('tahun_lulus', 4)->nullable()->after('sekolah_asal');

            // Data Keluarga - Ayah
            $table->string('nama_ayah', 100)->nullable()->after('tahun_lulus');
            $table->string('nik_ayah', 16)->nullable()->after('nama_ayah');
            $table->string('pendidikan_ayah', 50)->nullable()->after('nik_ayah');
            $table->string('pekerjaan_ayah', 50)->nullable()->after('pendidikan_ayah');
            $table->string('penghasilan_ayah', 50)->nullable()->after('pekerjaan_ayah');

            // Data Keluarga - Ibu
            $table->string('nama_ibu', 100)->nullable()->after('penghasilan_ayah');
            $table->string('nik_ibu', 16)->nullable()->after('nama_ibu');
            $table->string('pendidikan_ibu', 50)->nullable()->after('nik_ibu');
            $table->string('pekerjaan_ibu', 50)->nullable()->after('pendidikan_ibu');
            $table->string('penghasilan_ibu', 50)->nullable()->after('pekerjaan_ibu');

            // Kontak Orang Tua / Wali
            $table->string('nama_wali', 100)->nullable()->after('penghasilan_ibu');
            $table->string('no_hp_wali', 20)->nullable()->after('nama_wali');
            $table->text('alamat_wali')->nullable()->after('no_hp_wali');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_siswa', function (Blueprint $table) {
            $table->dropColumn([
                'anak_ke', 'jumlah_saudara',
                'sekolah_asal', 'tahun_lulus',
                'nama_ayah', 'nik_ayah', 'pendidikan_ayah', 'pekerjaan_ayah', 'penghasilan_ayah',
                'nama_ibu', 'nik_ibu', 'pendidikan_ibu', 'pekerjaan_ibu', 'penghasilan_ibu',
                'nama_wali', 'no_hp_wali', 'alamat_wali',
            ]);
        });
    }
};
