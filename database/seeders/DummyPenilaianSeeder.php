<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Siswa;
use App\Models\MataPelajaran;
use App\Models\Kelas;
use App\Models\PenilaianMapel;
use App\Models\PenilaianDetail;
use App\Models\KomponenPenilaian;
use App\Services\PenilaianCalculator;

class DummyPenilaianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ta = DB::table('tbl_tahun_ajaran')->where('status', 'Aktif')->first();
        if (!$ta) {
            $this->command->error('Tidak ada Tahun Ajaran yang aktif. Silakan buat Tahun Ajaran aktif terlebih dahulu.');
            return;
        }

        $id_tahun_ajaran = $ta->id_tahun_ajaran;
        $semester = 'Genap'; // Asumsikan semester aktif Genap (bisa Ganjil)

        $siswas = Siswa::whereNotNull('id_kelas')->get();
        if ($siswas->isEmpty()) {
            $this->command->error('Tidak ada data siswa yang memiliki kelas.');
            return;
        }

        $mapels = MataPelajaran::all();
        if ($mapels->isEmpty()) {
            $this->command->error('Tidak ada data mata pelajaran.');
            return;
        }

        $calculator = app(PenilaianCalculator::class);

        $this->command->info("Memulai generate dummy data penilaian untuk {$siswas->count()} siswa...");

        $komponens = KomponenPenilaian::where('aktif', 1)->get();

        foreach ($siswas as $siswa) {
            foreach ($mapels as $mapel) {
                // Cek apakah data penilaian sudah ada (jangan duplicate)
                $penilaian = PenilaianMapel::firstOrCreate([
                    'id_siswa' => $siswa->id_siswa,
                    'id_mapel' => $mapel->id_mapel,
                    'id_kelas' => $siswa->id_kelas,
                    'id_tahun_ajaran' => $id_tahun_ajaran,
                    'semester' => $semester,
                ]);

                foreach ($komponens as $komponen) {
                    // Cek detail sudah ada atau belum
                    $detail = PenilaianDetail::where([
                        'id_penilaian' => $penilaian->id_penilaian,
                        'id_komponen' => $komponen->id_komponen,
                    ])->first();

                    if (!$detail) {
                        // Generate random score between 60 and 100
                        $score = rand(60, 100);
                        PenilaianDetail::create([
                            'id_penilaian' => $penilaian->id_penilaian,
                            'id_komponen' => $komponen->id_komponen,
                            'nilai' => $score,
                        ]);
                    }
                }

                // Hitung nilai akhir menggunakan calculator
                $calculator->compute($penilaian);
            }
        }

        $this->command->info('Generate dummy data penilaian selesai!');
    }
}
