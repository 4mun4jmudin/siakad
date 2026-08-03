<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Kelas;
use App\Models\Guru;
use App\Models\MataPelajaran;
use App\Models\TahunAjaran;
use App\Models\JadwalMengajar;
use Illuminate\Support\Str;

$tahunAktif = TahunAjaran::where('status', 'Aktif')->first();
if (!$tahunAktif) {
    die("Error: Tidak ada Tahun Ajaran aktif.\n");
}

$kelasAlias = [
    'xa' => 'xatph',
    'xdkv' => 'xdkv',
    'xd' => 'xdpib',
    'xia' => 'xiatph',
    'xid' => 'xidpib',
    'xim' => 'xidkv',
    'xiia' => 'xiiatph',
    'xiid' => 'xiidpib',
    'xiim' => 'xiidkv',
];

$mapelFullName = [
    'B.Indo' => 'Bahasa Indonesia',
    'B.Inggris' => 'Bahasa Inggris',
    'B.Sunda' => 'Bahasa Sunda',
    'BTQ' => 'Baca Tulis Al-Qur\'an',
    'PAI' => 'Pendidikan Agama Islam',
    'PPKN' => 'PPKn', // or Pendidikan Pancasila dan Kewarganegaraan
    'PJOK' => 'Pendidikan Jasmani',
    'SBD' => 'Seni Budaya',
    'SBK' => 'Seni Budaya dan Keterampilan',
    'IPS' => 'Ilmu Pengetahuan Sosial',
    'IPA' => 'Ilmu Pengetahuan Alam',
    'IPAS' => 'IPAS',
    'MTK' => 'Matematika',
    'Matematika' => 'Matematika',
    'TIK' => 'Teknologi Informasi dan Komunikasi',
    'PKK' => 'Produk Kreatif dan Kewirausahaan (PKK)',
    'TDP' => 'Teknik Dasar Proses Produksi',
    'PB' => 'Proses Bisnis',
    'PT' => 'Pembiakan Tanaman',
    'PTIG' => 'Perkembangan Teknologi Produksi dan Isu Global',
    'FB' => 'Faktor yang Berpengaruh terhadap proses produksi',
    'POPT' => 'Pengendalian Organisme Pengganggu Tanaman',
    'PdP' => 'Panen dan Pasca Panen',
    'PMT' => 'Penyiapan Media Tanam',
    'PPP' => 'Penanaman, Pengairan, Pemupukan',
    'Kom.Grafis' => 'Komputer Grafis',
    'PSB' => 'Perhitungan Statika Bangunan',
    'PIB' => 'Pemodelan Informasi Bangunan',
    'BIM' => 'Building Information Modeling',
    'KnUG' => 'Utilitas gedung',
    'EBK' => 'Estimasi Biaya Konstruksi',
    'PLD' => 'Perangkat Lunak Desain',
    'FD' => 'Fotografi Dasar',
    'Fotografi Dasar' => 'Fotografi Dasar',
    'KD' => 'Karya Desain',
    'Karya Desain' => 'Karya Desain',
    'SI' => 'Sketsa dan Ilustrasi',
    'Sketsa Ilustrasi' => 'Sketsa dan Ilustrasi',
    'PPD' => 'Proses Produksi Desain',
    'Mapil' => 'Muatan Pelajaran',
    'Pramuka' => 'Pramuka',
    'Coding/AI' => 'Coding',
    'Informatika' => 'Informatika',
    'Sejarah' => 'Sejarah',
];

$guruAlias = [
    'Ineu' => 'Ine Puput Purwanti',
    'Ratna' => 'Ratna',
    'Kepsek' => 'Kepala Sekolah',
    'Neng A' => 'Neng Ajeng Tiardini',
    'Siti L' => 'Siti Laras Maemunah',
    'Cecep' => 'Cecep Herlan',
    'Dini' => 'Dini Puspita',
    'Risna' => 'Risna Dwi Anggraeni',
    'Tanti' => 'Tanti Nurkomalasari',
    'Arkan' => 'M. Arkan Assidik',
    'Amu' => 'Amu Najmudin',
    'Nadhif' => 'Nadhif M Yusuf',
    'Yayu' => 'Yayu Sriwahyuni',
    'Ranran' => 'Ranran Rahayu',
    'Tresna' => 'Tresna Anisya Amelia',
    'Yola' => 'Yola Yuliyanti',
    'Deri' => 'Deri Sundara',
    'Hudori' => 'Hudori', // Not sure full name, let it create
    'Dede' => 'Dede Jaenudin',
    'Neng Desy' => 'Neng Desy Lestary',
    'Taufik' => 'Taufik DSR',
    'Fahmi' => 'Fahmi Al-Kalam',
];

$kelasMap = Kelas::all()->mapWithKeys(function ($item) {
    return [strtolower(str_replace(' ', '', $item->nama_lengkap)) => $item->id_kelas];
})->toArray();

$inserts = [];
$errors = [];

DB::beginTransaction();
try {
    JadwalMengajar::where('id_tahun_ajaran', $tahunAktif->id_tahun_ajaran)->delete();

    if (($handle = fopen("jadwal.csv", "r")) !== FALSE) {
        $headers = fgetcsv($handle, 1000, ";");
        // Headers: Hari, Jam, XA, XDKV, XD, XIA, XIM, XID, XIIA, XIIM, XIID
        $kelasCols = array_slice($headers, 2); // get class names
        
        while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
            $hari = ucfirst(strtolower(trim($data[0])));
            $jamStr = trim($data[1]);
            
            if (empty($hari) || empty($jamStr)) continue;
            
            if (preg_match('/^(\d{2}\.\d{2})-(\d{2}\.\d{2})$/', $jamStr, $m)) {
                $jam_mulai = str_replace('.', ':', $m[1]) . ':00';
                $jam_selesai = str_replace('.', ':', $m[2]) . ':00';
            } else {
                continue;
            }

            for ($i = 0; $i < count($kelasCols); $i++) {
                $klsRaw = strtolower(trim($kelasCols[$i]));
                $cell = trim($data[$i + 2]);
                
                if (empty($cell)) {
                    continue;
                }
                
                $guruRawList = [];
                $mapelRaw = '';

                if (str_contains(strtolower($cell), 'istirahat') || str_contains(strtolower($cell), 'sholat') || str_contains(strtolower($cell), 'upacara')) {
                    $guruRawList = ['Pembina'];
                    $mapelRaw = trim($cell);
                } elseif (preg_match('/^(.*?)\s*\((.*?)\)$/', $cell, $m)) {
                    $guruRawList = explode('/', trim($m[1]));
                    $mapelRaw = trim($m[2]);
                } else {
                    continue;
                }
                    
                    // Kelas
                    $klsKey = $kelasAlias[$klsRaw] ?? $klsRaw;
                    $id_kelas = $kelasMap[$klsKey] ?? null;
                    if (!$id_kelas) {
                        $errors[] = "Kelas tidak ditemukan: '$klsRaw'";
                        continue;
                    }

                    // Mapel
                    $mapelSearch = $mapelFullName[$mapelRaw] ?? $mapelRaw;
                    $mapelModel = MataPelajaran::where('nama_mapel', 'LIKE', "%{$mapelSearch}%")->first();
                    if (!$mapelModel) {
                        $mapelModel = MataPelajaran::create([
                            'id_mapel' => 'MP-' . mt_rand(100000, 999999),
                            'nama_mapel' => $mapelSearch,
                            'kategori' => 'Kejuruan',
                        ]);
                    }
                    $id_mapel = $mapelModel->id_mapel;

                    foreach ($guruRawList as $gRaw) {
                        $gRaw = trim($gRaw);
                        $guruSearch = $guruAlias[$gRaw] ?? $gRaw;
                        $guruModel = Guru::where('nama_lengkap', 'LIKE', "%{$guruSearch}%")->first();
                        if (!$guruModel) {
                            $guruModel = Guru::create([
                                'id_guru' => 'G-' . mt_rand(100000, 999999),
                                'nama_lengkap' => $guruSearch,
                                'nip' => (string) mt_rand(100000000, 999999999),
                                'jenis_kelamin' => 'Laki-laki',
                            ]);
                        }
                        
                        $inserts[] = [
                            'id_jadwal' => 'J-' . Str::random(15),
                            'id_tahun_ajaran' => $tahunAktif->id_tahun_ajaran,
                            'id_kelas' => $id_kelas,
                            'id_guru' => $guruModel->id_guru,
                            'id_mapel' => $id_mapel,
                            'hari' => $hari,
                            'jam_mulai' => $jam_mulai,
                            'jam_selesai' => $jam_selesai,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
            }
        }
        fclose($handle);
    }

    if (empty($errors)) {
        DB::table('tbl_jadwal_mengajar')->insert($inserts);
        DB::commit();
        echo "Berhasil insert " . count($inserts) . " jadwal ke database.\n";
    } else {
        DB::rollBack();
        echo "Ada error, transaksi dibatalkan.\n";
    }

} catch (\Exception $e) {
    DB::rollBack();
    echo "Exception: " . $e->getMessage() . "\n";
}

if (!empty($errors)) {
    echo "\n=== ERRORS ===\n";
    foreach(array_unique($errors) as $err) echo $err . "\n";
    echo "==============\n\n";
}
