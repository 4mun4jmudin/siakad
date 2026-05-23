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
        // 1. Create tbl_komponen_penilaian
        Schema::create('tbl_komponen_penilaian', function (Blueprint $table) {
            $table->id('id_komponen');
            $table->string('nama', 50)->unique();
            $table->timestamps();
        });

        // Seed default components
        DB::table('tbl_komponen_penilaian')->insert([
            ['nama' => 'Tugas', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'UTS', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'UAS', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Create tbl_bobot_penilaian
        Schema::create('tbl_bobot_penilaian', function (Blueprint $table) {
            $table->id();
            $table->string('id_mapel', 20);
            $table->string('id_tahun_ajaran', 20);
            $table->enum('semester', ['Ganjil', 'Genap']);
            $table->unsignedBigInteger('id_komponen');
            $table->decimal('bobot', 5, 2);
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_mapel')->references('id_mapel')->on('tbl_mata_pelajaran')->onDelete('cascade');
            $table->foreign('id_tahun_ajaran')->references('id_tahun_ajaran')->on('tbl_tahun_ajaran')->onDelete('cascade');
            $table->foreign('id_komponen')->references('id_komponen')->on('tbl_komponen_penilaian')->onDelete('cascade');

            // Unique index for the mapel, tahun ajaran, semester, and komponen combination
            $table->unique(['id_mapel', 'id_tahun_ajaran', 'semester', 'id_komponen'], 'bobot_unique_combination');
        });

        // Migrate existing weights from tbl_bobot_nilai_mapel to tbl_bobot_penilaian if table exists and has rows
        if (Schema::hasTable('tbl_bobot_nilai_mapel')) {
            $existingWeights = DB::table('tbl_bobot_nilai_mapel')->get();
            $components = DB::table('tbl_komponen_penilaian')->pluck('id_komponen', 'nama')->toArray();

            foreach ($existingWeights as $w) {
                // Map columns
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
        }

        // 3. Alter tbl_penilaian_mapel to add status_kunci
        Schema::table('tbl_penilaian_mapel', function (Blueprint $table) {
            $table->boolean('status_kunci')->default(false)->after('catatan');
        });

        // 4. Alter tbl_penilaian_detail to add id_komponen, and make komponen column nullable
        Schema::table('tbl_penilaian_detail', function (Blueprint $table) {
            $table->unsignedBigInteger('id_komponen')->nullable()->after('id_penilaian');
            $table->foreign('id_komponen')->references('id_komponen')->on('tbl_komponen_penilaian')->onDelete('cascade');
        });

        // Modify column type for 'komponen' to varchar(50) and make it nullable
        // We use raw query here to safely change enum type to nullable varchar
        DB::statement("ALTER TABLE tbl_penilaian_detail MODIFY komponen VARCHAR(50) NULL");

        // Map existing string values in tbl_penilaian_detail to id_komponen
        $components = DB::table('tbl_komponen_penilaian')->pluck('id_komponen', 'nama')->toArray();
        foreach ($components as $name => $id) {
            // Map old enum string values
            $oldValues = [$name];
            if ($name === 'UTS') $oldValues[] = 'PTS';
            if ($name === 'UAS') $oldValues[] = 'PAS';
            if ($name === 'Tugas') $oldValues[] = 'UH';

            DB::table('tbl_penilaian_detail')
                ->whereIn('komponen', $oldValues)
                ->update(['id_komponen' => $id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_penilaian_detail', function (Blueprint $table) {
            $table->dropForeign(['id_komponen']);
            $table->dropColumn('id_komponen');
        });

        // Safely restore komponen column as enum if needed
        DB::statement("ALTER TABLE tbl_penilaian_detail MODIFY komponen ENUM('Tugas','UH','PTS','PAS','Praktik','Proyek') NOT NULL");

        Schema::table('tbl_penilaian_mapel', function (Blueprint $table) {
            $table->dropColumn('status_kunci');
        });

        Schema::dropIfExists('tbl_bobot_penilaian');
        Schema::dropIfExists('tbl_komponen_penilaian');
    }
};
