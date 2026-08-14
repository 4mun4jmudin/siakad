<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\SusKuesioner;
use App\Models\User;

class SusSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = base_path('test/Tabel_Pengujian_SUS.md');
        if (!File::exists($filePath)) {
            $this->command->error("File Tabel_Pengujian_SUS.md tidak ditemukan.");
            return;
        }

        $content = File::get($filePath);
        $lines = explode("\n", $content);

        $insertedCount = 0;
        foreach ($lines as $line) {
            $line = trim($line);
            // Cek apakah baris ini adalah baris data tabel (mulai dengan | dan ada angka nomor di kolom pertama)
            if (preg_match('/^\|\s*(\d+)\s*\|(.*?)\|(.*?)\|/', $line, $matches)) {
                $cols = explode('|', $line);
                if (count($cols) >= 16) {
                    $nama = trim($cols[2]);
                    
                    // Cari pengguna berdasarkan nama (dengan like)
                    $pengguna = User::where('nama_lengkap', 'LIKE', '%' . $nama . '%')->first();

                    if ($pengguna) {
                        $q1 = (int) trim($cols[4]);
                        $q2 = (int) trim($cols[5]);
                        $q3 = (int) trim($cols[6]);
                        $q4 = (int) trim($cols[7]);
                        $q5 = (int) trim($cols[8]);
                        $q6 = (int) trim($cols[9]);
                        $q7 = (int) trim($cols[10]);
                        $q8 = (int) trim($cols[11]);
                        $q9 = (int) trim($cols[12]);
                        $q10 = (int) trim($cols[13]);
                        
                        $scoreStr = trim($cols[15]);
                        $skorSus = (float) str_replace(['*', ' '], '', $scoreStr);

                        SusKuesioner::updateOrCreate(
                            ['id_pengguna' => $pengguna->id_pengguna],
                            [
                                'q1' => $q1,
                                'q2' => $q2,
                                'q3' => $q3,
                                'q4' => $q4,
                                'q5' => $q5,
                                'q6' => $q6,
                                'q7' => $q7,
                                'q8' => $q8,
                                'q9' => $q9,
                                'q10' => $q10,
                                'skor_sus' => $skorSus,
                            ]
                        );
                        $insertedCount++;
                    } else {
                        $this->command->warn("Pengguna tidak ditemukan: " . $nama);
                    }
                }
            }
        }
        $this->command->info("Berhasil menginsert $insertedCount data SUS Kuesioner.");
    }
}
