<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

file_put_contents('db_dump.json', json_encode([
    'kelas' => App\Models\Kelas::all()->map->nama_lengkap, 
    'guru' => App\Models\Guru::pluck('nama_lengkap'), 
    'mapel' => App\Models\MataPelajaran::pluck('nama_mapel')
], JSON_PRETTY_PRINT));
echo "Dumped to db_dump.json\n";
