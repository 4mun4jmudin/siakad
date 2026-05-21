<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Buat tabel pivot
        Schema::create('tbl_wali_siswa', function (Blueprint $table) {
            $table->string('id_wali', 50);
            $table->string('id_siswa', 50);
            
            $table->primary(['id_wali', 'id_siswa']);
            $table->foreign('id_wali')->references('id_wali')->on('tbl_orang_tua_wali')->onDelete('cascade');
            $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa')->onDelete('cascade');
        });

        // 2. Migrasi data lama dari tbl_orang_tua_wali ke tbl_wali_siswa
        $walis = DB::table('tbl_orang_tua_wali')->whereNotNull('id_siswa')->get();
        foreach ($walis as $wali) {
            DB::table('tbl_wali_siswa')->insert([
                'id_wali' => $wali->id_wali,
                'id_siswa' => $wali->id_siswa,
            ]);
        }

        // 3. Drop foreign key dan kolom id_siswa dari tbl_orang_tua_wali
        $constraint = DB::selectOne('
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = "tbl_orang_tua_wali" 
            AND COLUMN_NAME = "id_siswa"
            AND CONSTRAINT_NAME != "PRIMARY"
        ');

        Schema::table('tbl_orang_tua_wali', function (Blueprint $table) use ($constraint) {
            if ($constraint) {
                $table->dropForeign($constraint->CONSTRAINT_NAME);
            }
        });

        Schema::table('tbl_orang_tua_wali', function (Blueprint $table) {
            $table->dropColumn('id_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Tambahkan kembali kolom id_siswa
        Schema::table('tbl_orang_tua_wali', function (Blueprint $table) {
            $table->string('id_siswa', 50)->nullable()->after('id_wali');
        });

        // 2. Kembalikan data (ambil satu anak saja per wali, karena batasan struktur lama)
        $pivotData = DB::table('tbl_wali_siswa')->groupBy('id_wali')->select('id_wali', DB::raw('MAX(id_siswa) as id_siswa'))->get();
        foreach ($pivotData as $data) {
            DB::table('tbl_orang_tua_wali')
                ->where('id_wali', $data->id_wali)
                ->update(['id_siswa' => $data->id_siswa]);
        }

        Schema::table('tbl_orang_tua_wali', function (Blueprint $table) {
            $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa')->onDelete('cascade');
        });

        // 3. Drop tabel pivot
        Schema::dropIfExists('tbl_wali_siswa');
    }
};
