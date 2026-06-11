<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Consolidate grading module:
     * 1. Ensure all tbl_penilaian_detail rows have id_komponen mapped
     * 2. Drop legacy 'komponen' string column from tbl_penilaian_detail
     * 3. Drop legacy tbl_bobot_nilai_mapel table (data already migrated)
     */
    public function up(): void
    {
        // 1. Auto-map any remaining null id_komponen in tbl_penilaian_detail
        $components = DB::table('tbl_komponen_penilaian')->pluck('id_komponen', 'nama')->toArray();

        // Map old string values to component IDs
        $mappings = [];
        foreach ($components as $name => $id) {
            $mappings[$name] = $id;
        }
        // Legacy aliases
        if (isset($mappings['UTS'])) {
            $mappings['PTS'] = $mappings['UTS'];
        }
        if (isset($mappings['UAS'])) {
            $mappings['PAS'] = $mappings['UAS'];
        }
        if (isset($mappings['Tugas'])) {
            $mappings['UH'] = $mappings['Tugas'];
        }

        foreach ($mappings as $oldName => $kompId) {
            DB::table('tbl_penilaian_detail')
                ->whereNull('id_komponen')
                ->where('komponen', $oldName)
                ->update(['id_komponen' => $kompId]);
        }

        // For any remaining null id_komponen rows, assign the first component as fallback
        $fallbackId = DB::table('tbl_komponen_penilaian')->value('id_komponen');
        if ($fallbackId) {
            DB::table('tbl_penilaian_detail')
                ->whereNull('id_komponen')
                ->update(['id_komponen' => $fallbackId]);
        }

        // 2. Drop the legacy 'komponen' string column
        Schema::table('tbl_penilaian_detail', function (Blueprint $table) {
            $table->dropColumn('komponen');
        });

        // 3. Make id_komponen NOT NULL
        DB::statement('ALTER TABLE tbl_penilaian_detail MODIFY id_komponen BIGINT UNSIGNED NOT NULL');

        // 4. Ensure data from tbl_bobot_nilai_mapel has been migrated to tbl_bobot_penilaian
        if (Schema::hasTable('tbl_bobot_nilai_mapel')) {
            $existingWeights = DB::table('tbl_bobot_nilai_mapel')->get();

            foreach ($existingWeights as $w) {
                $mapping = [
                    'Tugas' => $w->bobot_tugas ?? 0,
                    'UTS'   => $w->bobot_pts ?? 0,
                    'UAS'   => $w->bobot_pas ?? 0,
                ];

                foreach ($mapping as $namaKomp => $val) {
                    if (isset($components[$namaKomp]) && $val > 0) {
                        DB::table('tbl_bobot_penilaian')->insertOrIgnore([
                            'id_mapel'        => $w->id_mapel,
                            'id_tahun_ajaran' => $w->id_tahun_ajaran,
                            'semester'        => $w->semester,
                            'id_komponen'     => $components[$namaKomp],
                            'bobot'           => $val,
                            'created_at'      => now(),
                            'updated_at'      => now(),
                        ]);
                    }
                }
            }

            // Drop legacy table
            Schema::dropIfExists('tbl_bobot_nilai_mapel');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-create legacy bobot table
        Schema::create('tbl_bobot_nilai_mapel', function (Blueprint $table) {
            $table->id();
            $table->string('id_mapel', 20);
            $table->string('id_tahun_ajaran', 20);
            $table->enum('semester', ['Ganjil', 'Genap']);
            $table->decimal('bobot_tugas', 5, 2)->nullable()->default(0);
            $table->decimal('bobot_uh', 5, 2)->nullable()->default(0);
            $table->decimal('bobot_pts', 5, 2)->nullable()->default(0);
            $table->decimal('bobot_pas', 5, 2)->nullable()->default(0);
            $table->decimal('bobot_praktik', 5, 2)->nullable()->default(0);
            $table->decimal('bobot_proyek', 5, 2)->nullable()->default(0);
            $table->timestamps();
        });

        // Re-add 'komponen' column
        DB::statement("ALTER TABLE tbl_penilaian_detail ADD komponen VARCHAR(50) NULL AFTER id_komponen");

        // Make id_komponen nullable again
        DB::statement('ALTER TABLE tbl_penilaian_detail MODIFY id_komponen BIGINT UNSIGNED NULL');

        // Map id_komponen back to string
        $components = DB::table('tbl_komponen_penilaian')->pluck('nama', 'id_komponen')->toArray();
        foreach ($components as $id => $name) {
            DB::table('tbl_penilaian_detail')
                ->where('id_komponen', $id)
                ->update(['komponen' => $name]);
        }
    }
};
