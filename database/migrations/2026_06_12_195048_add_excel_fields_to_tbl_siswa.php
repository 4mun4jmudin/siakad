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
        Schema::table('tbl_siswa', function (Blueprint $table) {
            // Data Alamat Tambahan
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->string('dusun', 100)->nullable();
            $table->string('kelurahan', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->string('jenis_tinggal', 50)->nullable();
            $table->string('alat_transportasi', 50)->nullable();
            $table->string('jarak_rumah_ke_sekolah', 50)->nullable();
            $table->string('lintang', 50)->nullable();
            $table->string('bujur', 50)->nullable();

            // Kontak Siswa
            $table->string('telepon_siswa', 20)->nullable();
            $table->string('hp_siswa', 20)->nullable();
            $table->string('email_siswa', 100)->nullable();

            // Dokumen Ujian dan SKHUN
            $table->string('skhun', 50)->nullable();
            $table->string('no_peserta_ujian_nasional', 50)->nullable();
            $table->string('no_seri_ijazah', 50)->nullable();
            $table->string('no_registrasi_akta_lahir', 50)->nullable();

            // Kesejahteraan dan Bantuan
            $table->string('penerima_kps', 10)->nullable();
            $table->string('no_kps', 50)->nullable();
            $table->string('penerima_kip', 10)->nullable();
            $table->string('nomor_kip', 50)->nullable();
            $table->string('nama_di_kip', 100)->nullable();
            $table->string('nomor_kks', 50)->nullable();
            $table->string('layak_pip', 10)->nullable();
            $table->string('alasan_layak_pip', 255)->nullable();
            $table->string('bank', 50)->nullable();
            $table->string('nomor_rekening_bank', 50)->nullable();
            $table->string('rekening_atas_nama', 100)->nullable();

            // Data Fisik dan Khusus
            $table->string('kebutuhan_khusus', 100)->nullable();
            $table->integer('berat_badan')->nullable();
            $table->integer('tinggi_badan')->nullable();
            $table->integer('lingkar_kepala')->nullable();

            // Data Keluarga Tambahan
            $table->string('tahun_lahir_ayah', 4)->nullable();
            $table->string('tahun_lahir_ibu', 4)->nullable();
            $table->string('tahun_lahir_wali', 4)->nullable();
            $table->string('pendidikan_wali', 50)->nullable();
            $table->string('pekerjaan_wali', 50)->nullable();
            $table->string('penghasilan_wali', 50)->nullable();
            $table->string('nik_wali', 16)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_siswa', function (Blueprint $table) {
            $table->dropColumn([
                'rt', 'rw', 'dusun', 'kelurahan', 'kecamatan', 'kode_pos', 
                'jenis_tinggal', 'alat_transportasi', 'jarak_rumah_ke_sekolah', 'lintang', 'bujur',
                'telepon_siswa', 'hp_siswa', 'email_siswa',
                'skhun', 'no_peserta_ujian_nasional', 'no_seri_ijazah', 'no_registrasi_akta_lahir',
                'penerima_kps', 'no_kps', 'penerima_kip', 'nomor_kip', 'nama_di_kip', 
                'nomor_kks', 'layak_pip', 'alasan_layak_pip', 'bank', 'nomor_rekening_bank', 'rekening_atas_nama',
                'kebutuhan_khusus', 'berat_badan', 'tinggi_badan', 'lingkar_kepala',
                'tahun_lahir_ayah', 'tahun_lahir_ibu', 'tahun_lahir_wali', 
                'pendidikan_wali', 'pekerjaan_wali', 'penghasilan_wali', 'nik_wali'
            ]);
        });
    }
};
