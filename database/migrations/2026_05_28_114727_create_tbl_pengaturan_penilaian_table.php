<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_pengaturan_penilaian', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default values
        DB::table('tbl_pengaturan_penilaian')->insert([
            ['key' => 'formula_nilai',       'value' => 'weighted_average', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'batas_remedial',      'value' => '2',                'created_at' => now(), 'updated_at' => now()],
            ['key' => 'metode_remedial',     'value' => 'manual',           'created_at' => now(), 'updated_at' => now()],
            ['key' => 'nilai_pengayaan_min', 'value' => '90',               'created_at' => now(), 'updated_at' => now()],
            ['key' => 'validasi_enabled',    'value' => 'false',            'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_pengaturan_penilaian');
    }
};
