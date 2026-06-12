<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id_kelas = 'K006';
$jadwal = \App\Models\JadwalMengajar::where('id_kelas', $id_kelas)->get();
$kelas = \App\Models\Kelas::where('id_kelas', $id_kelas)->get();

echo "Jadwal records with K006:\n" . json_encode($jadwal) . "\n\n";
echo "Kelas records with K006:\n" . json_encode($kelas) . "\n";
