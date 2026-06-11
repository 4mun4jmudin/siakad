<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$teachers = [
    "Amu Najmudin",
    "Asep Saepudin, S.Pd",
    "Cecep Herlan, S.Pd",
    "Dede Jaenudin, S.Pd.I",
    "Deri Sundara, S.Pd",
    "Dian Nurhamdani, S.Pd",
    "Dini Puspita, S.Pd",
    "Fahmi Al-Kalam",
    "Hendra Firmansyah, S.Pd",
    "Ibnu Kholdun",
    "Ine Puput Purwanti",
    "M. Arkan Assidik, MT",
    "Mega Aprilianti, ST",
    "Nadhif Amu Pengganti",
    "Nadhif M Yusuf",
    "Neng Ajeng Tiardini, S.Pd",
    "Neng Desy Lestary, S.Pd",
    "Pembina DKV Busana",
    "Pimbimbing XII-DKV",
    "Ranran Rahayu, Amd",
    "Risna Dwi Anggraeni, S.Pd",
    "Siti Laras Maemunah, S.Pd",
    "Tanti Nurkomalasari, S.Pd",
    "Taufik DSR, S.Pd.MBg",
    "Tresna Anisya Amelia, SE",
    "Yangyang Budiman, S.Pd",
    "Yayu Sriwahyuni, S.P",
    "Yoga Yudistira, S.Pd",
    "Yola Yuliyanti, S.Pd"
];

$count = 0;
foreach ($teachers as $name) {
    $exists = \App\Models\Guru::where('nama_lengkap', $name)->exists();
    if (!$exists) {
        $id_guru = 'GR-' . strtoupper(Str::random(5)) . rand(100,999);
        \App\Models\Guru::create([
            'id_guru' => $id_guru,
            'nama_lengkap' => $name,
            'jenis_kelamin' => 'Laki-Laki', // Default fallback
            'status' => 'Aktif',
            'id_pengguna' => null,
            'nip' => null
        ]);
        $count++;
    }
}
echo "Berhasil menambahkan $count guru baru.\n";
