<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = app()->make('App\Http\Controllers\Admin\JadwalInteractiveController');
    
    // Asumsi kelas pertama
    $kelas = App\Models\Kelas::first();
    
    $request = Illuminate\Http\Request::create('/admin/jadwal-interaktif/recommendations', 'POST', [
        'id_kelas' => $kelas->id_kelas,
        'hari' => 'Senin',
        'jam_mulai' => '08:00',
        'jam_selesai' => '09:30'
    ]);
    
    $response = $controller->getRecommendations($request);
    
    echo "Response Content:\n";
    echo $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "EXCEPTION:\n";
    echo $e->getMessage() . "\n";
}
