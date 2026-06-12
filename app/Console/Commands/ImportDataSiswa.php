<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Siswa;
use App\Models\OrangTuaWali;
use App\Models\User;
use App\Models\Kelas;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportDataSiswa extends Command
{
    protected $signature = 'import:siswa {file}';
    protected $description = 'Import data siswa dan ortu dari file text';

    public function handle()
    {
        $filePath = $this->argument('file');
        if (!file_exists($filePath)) {
            $this->error("File tidak ditemukan: {$filePath}");
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        $countSiswa = 0;
        
        DB::beginTransaction();
        try {
            foreach ($lines as $index => $line) {
                $cols = explode("\t", $line);
                if (count($cols) < 50) continue;
                if (!is_numeric($cols[0])) continue; // No

                // Mapping columns
                $nis = trim($cols[2]);
                $nisn = trim($cols[4]);
                $nama = trim($cols[1]);
                $jk = trim($cols[3]) === 'L' ? 'Laki-laki' : 'Perempuan';
                $tempat_lahir = trim($cols[5]);
                $tanggal_lahir = trim($cols[6]);
                $nik = trim($cols[7]);
                $agama = trim($cols[8]);
                if (!in_array($agama, ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'])) {
                    $agama = 'Islam'; // Default or based on what's available
                }
                
                $alamat = trim($cols[9]);
                $rt = trim($cols[10]);
                $rw = trim($cols[11]);
                $dusun = trim($cols[12]);
                $kelurahan = trim($cols[13]);
                $kecamatan = trim($cols[14]);
                $kodepos = trim($cols[15]);
                $jenis_tinggal = trim($cols[16]);
                $transportasi = trim($cols[17]);
                $telepon = trim($cols[18]);
                $hp = trim($cols[19]);
                $email = trim($cols[20]);
                $skhun = trim($cols[21]);
                $penerima_kps = trim($cols[22]);
                $no_kps = trim($cols[23]);
                
                $ayah_nama = trim($cols[24]);
                $ayah_tahun = trim($cols[25]);
                $ayah_pendidikan = trim($cols[26]);
                $ayah_pekerjaan = trim($cols[27]);
                $ayah_penghasilan = trim($cols[28]);
                $ayah_nik = trim($cols[29]);
                
                $ibu_nama = trim($cols[30]);
                $ibu_tahun = trim($cols[31]);
                $ibu_pendidikan = trim($cols[32]);
                $ibu_pekerjaan = trim($cols[33]);
                $ibu_penghasilan = trim($cols[34]);
                $ibu_nik = trim($cols[35]);
                
                $wali_nama = trim($cols[36]);
                $wali_tahun = trim($cols[37]);
                $wali_pendidikan = trim($cols[38]);
                $wali_pekerjaan = trim($cols[39]);
                $wali_penghasilan = trim($cols[40]);
                $wali_nik = trim($cols[41]);
                
                $rombel = trim($cols[42]);
                $no_un = trim($cols[43]);
                $no_ijazah = trim($cols[44]);
                $penerima_kip = trim($cols[45]);
                $nomor_kip = trim($cols[46]);
                $nama_kip = trim($cols[47]);
                $nomor_kks = trim($cols[48]);
                $akta = trim($cols[49]);
                $bank = trim($cols[50]);
                $rek = trim($cols[51]);
                $atas_nama = trim($cols[52]);
                $layak_pip = trim($cols[53]);
                $alasan_pip = trim($cols[54]);
                $keb_khusus = trim($cols[55]);
                $sekolah_asal = trim($cols[56]);
                $anak_ke = trim($cols[57]);
                $lintang = trim($cols[58]);
                $bujur = trim($cols[59]);
                $no_kk = trim($cols[60]);
                $berat = (int) trim($cols[61]);
                $tinggi = (int) trim($cols[62]);
                $lingkar = (int) trim($cols[63]);
                $jml_saudara = (int) trim($cols[64] ?? 0);
                $jarak = trim($cols[65] ?? '');

                // Rombel to Kelas
                $id_kelas = null;
                if (!empty($rombel)) {
                    $parts = explode(' ', $rombel, 2);
                    $tingkat = $parts[0] ?? '';
                    $jurusan = $parts[1] ?? '';
                    
                    $kelas = Kelas::where('tingkat', $tingkat)->where('jurusan', $jurusan)->first();
                    if (!$kelas) {
                        $id_kelas = 'KLS-' . strtoupper(Str::random(6));
                        $kelas = Kelas::create([
                            'id_kelas' => $id_kelas,
                            'tingkat' => $tingkat,
                            'jurusan' => $jurusan,
                        ]);
                    } else {
                        $id_kelas = $kelas->id_kelas;
                    }
                }

                // Check Siswa exists
                if (empty($nis) && empty($nisn)) continue;

                $siswa = Siswa::where('nis', $nis)->orWhere('nisn', $nisn)->first();

                // User for Siswa
                $userSiswa = User::where('username', $nis ?: $nisn)->first();
                if (!$userSiswa) {
                    $userSiswa = User::create([
                        'nama_lengkap' => $nama,
                        'username' => $nis ?: $nisn,
                        'email' => $email ?: (($nis ?: $nisn) . '@siswa.com'),
                        'password' => Hash::make($nis ?: $nisn),
                        'level' => 'Siswa',
                    ]);
                }

                if (!$siswa) {
                    $id_siswa = 'SW-' . date('Ymd') . '-' . strtoupper(Str::random(4));
                    $siswa = new Siswa();
                    $siswa->id_siswa = $id_siswa;
                }

                $siswa->nis = $nis ?: $nisn;
                $siswa->nisn = $nisn ?: $nis;
                if ($id_kelas) $siswa->id_kelas = $id_kelas;
                $siswa->nama_lengkap = $nama;
                $siswa->nik = $nik;
                $siswa->nomor_kk = $no_kk;
                $siswa->tempat_lahir = $tempat_lahir;
                if (!empty($tanggal_lahir)) {
                    $siswa->tanggal_lahir = date('Y-m-d', strtotime($tanggal_lahir));
                } else {
                    $siswa->tanggal_lahir = '2000-01-01'; // Default
                }
                $siswa->jenis_kelamin = $jk;
                $siswa->agama = $agama;
                $siswa->alamat_lengkap = $alamat;
                $siswa->anak_ke = $anak_ke;
                $siswa->jumlah_saudara = $jml_saudara;
                $siswa->sekolah_asal = $sekolah_asal;
                $siswa->id_pengguna = $userSiswa->id_pengguna;
                $siswa->status = 'Aktif';

                // Biodata extensions
                $siswa->rt = $rt;
                $siswa->rw = $rw;
                $siswa->dusun = $dusun;
                $siswa->kelurahan = $kelurahan;
                $siswa->kecamatan = $kecamatan;
                $siswa->kode_pos = $kodepos;
                $siswa->jenis_tinggal = $jenis_tinggal;
                $siswa->alat_transportasi = $transportasi;
                $siswa->jarak_rumah_ke_sekolah = $jarak;
                $siswa->lintang = $lintang;
                $siswa->bujur = $bujur;
                
                $siswa->telepon_siswa = $telepon;
                $siswa->hp_siswa = $hp;
                $siswa->email_siswa = $email;
                
                $siswa->skhun = $skhun;
                $siswa->no_peserta_ujian_nasional = $no_un;
                $siswa->no_seri_ijazah = $no_ijazah;
                $siswa->no_registrasi_akta_lahir = $akta;
                
                $siswa->penerima_kps = $penerima_kps;
                $siswa->no_kps = $no_kps;
                $siswa->penerima_kip = $penerima_kip;
                $siswa->nomor_kip = $nomor_kip;
                $siswa->nama_di_kip = $nama_kip;
                $siswa->nomor_kks = $nomor_kks;
                $siswa->layak_pip = $layak_pip;
                $siswa->alasan_layak_pip = $alasan_pip;
                $siswa->bank = $bank;
                $siswa->nomor_rekening_bank = $rek;
                $siswa->rekening_atas_nama = $atas_nama;
                
                $siswa->kebutuhan_khusus = $keb_khusus;
                $siswa->berat_badan = $berat;
                $siswa->tinggi_badan = $tinggi;
                $siswa->lingkar_kepala = $lingkar;
                
                $siswa->nama_ayah = $ayah_nama;
                $siswa->nik_ayah = $ayah_nik;
                $siswa->pendidikan_ayah = $ayah_pendidikan;
                $siswa->pekerjaan_ayah = $ayah_pekerjaan;
                $siswa->penghasilan_ayah = $ayah_penghasilan;
                $siswa->tahun_lahir_ayah = $ayah_tahun;
                
                $siswa->nama_ibu = $ibu_nama;
                $siswa->nik_ibu = $ibu_nik;
                $siswa->pendidikan_ibu = $ibu_pendidikan;
                $siswa->pekerjaan_ibu = $ibu_pekerjaan;
                $siswa->penghasilan_ibu = $ibu_penghasilan;
                $siswa->tahun_lahir_ibu = $ibu_tahun;
                
                $siswa->nama_wali = $wali_nama;
                $siswa->nik_wali = $wali_nik;
                $siswa->pendidikan_wali = $wali_pendidikan;
                $siswa->pekerjaan_wali = $wali_pekerjaan;
                $siswa->penghasilan_wali = $wali_penghasilan;
                $siswa->tahun_lahir_wali = $wali_tahun;

                $siswa->save();

                // Create Orang Tua Wali mapping
                // Ayah
                if (!empty($ayah_nama)) {
                    $this->createOrtu($siswa->id_siswa, 'Ayah', $ayah_nama, $ayah_nik, $ayah_tahun, $ayah_pendidikan, $ayah_pekerjaan, $ayah_penghasilan, $hp);
                }
                // Ibu
                if (!empty($ibu_nama)) {
                    $this->createOrtu($siswa->id_siswa, 'Ibu', $ibu_nama, $ibu_nik, $ibu_tahun, $ibu_pendidikan, $ibu_pekerjaan, $ibu_penghasilan, $hp);
                }
                // Wali
                if (!empty($wali_nama)) {
                    $this->createOrtu($siswa->id_siswa, 'Wali', $wali_nama, $wali_nik, $wali_tahun, $wali_pendidikan, $wali_pekerjaan, $wali_penghasilan, $hp);
                }

                $countSiswa++;
            }
            
            DB::commit();
            $this->info("Berhasil mengimport {$countSiswa} data siswa.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Gagal import: " . $e->getMessage() . " on line " . $e->getLine());
        }
    }

    private function mapPendidikan($str) {
        $map = [
            'Tidak sekolah' => 'Tidak Sekolah',
            'SD / sederajat' => 'SD',
            'SMP / sederajat' => 'SMP',
            'SMA / sederajat' => 'SMA/SMK',
            'S1' => 'S1',
            'S2' => 'S2',
            'S3' => 'S3',
            'D1' => 'D1',
            'D2' => 'D2',
            'D3' => 'D3',
        ];
        return $map[$str] ?? null;
    }

    private function mapPenghasilan($str) {
        if (str_contains($str, 'Kurang dari')) return '< 1 Juta';
        if (str_contains($str, '500,000 - Rp. 999,999')) return '< 1 Juta';
        if (str_contains($str, '1,000,000 - Rp. 1,999,999')) return '1 - 3 Juta';
        if (str_contains($str, '2,000,000 - Rp. 4,999,999')) return '3 - 5 Juta';
        if (str_contains($str, '5,000,000 - Rp. 20,000,000')) return '5 - 10 Juta';
        if (str_contains($str, 'Lebih dari Rp. 20,000,000')) return '> 10 Juta';
        if (str_contains($str, 'Tidak Berpenghasilan')) return 'Tidak Berpenghasilan';
        return null;
    }

    private function createOrtu($id_siswa, $hubungan, $nama, $nik, $tahun, $pendidikan, $pekerjaan, $penghasilan, $hp) {
        // If Ortu with this NIK exists, use it, otherwise create
        if (!empty($nik)) {
            $ortu = OrangTuaWali::where('nik', $nik)->first();
        } else {
            $ortu = OrangTuaWali::where('nama_lengkap', $nama)->where('hubungan', $hubungan)->first();
        }

        if (!$ortu) {
            $id_wali = 'WL-' . strtoupper(Str::random(6));
            $id_pengguna = null;
            if ($hubungan === 'Ayah' || $hubungan === 'Wali') {
                $userOrtu = User::create([
                    'nama_lengkap' => $nama,
                    'username' => 'ortu_' . ($nik ?: strtolower(Str::random(6))),
                    'email' => strtolower(Str::random(6)) . '@ortu.com',
                    'password' => Hash::make($nik ?: '123456'),
                    'level' => 'Orang Tua',
                ]);
                $id_pengguna = $userOrtu->id_pengguna;
            }

            $ortu = OrangTuaWali::create([
                'id_wali' => $id_wali,
                'id_pengguna' => $id_pengguna,
                'hubungan' => $hubungan,
                'nama_lengkap' => $nama,
                'nik' => $nik ?: null,
                'tanggal_lahir' => $tahun ? ($tahun . '-01-01') : null, 
                'pendidikan_terakhir' => $this->mapPendidikan($pendidikan),
                'pekerjaan' => $pekerjaan,
                'penghasilan_bulanan' => $this->mapPenghasilan($penghasilan),
                'no_telepon_wa' => $hp ?: '-',
            ]);
        }

        // pivot table
        DB::table('tbl_wali_siswa')->updateOrInsert([
            'id_wali' => $ortu->id_wali,
            'id_siswa' => $id_siswa
        ]);
    }
}
