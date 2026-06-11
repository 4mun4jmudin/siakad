<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
    $controller = app()->make('App\Http\Controllers\Admin\JadwalInteractiveController');
    $request = Illuminate\Http\Request::create('/jadwal-interaktif/fetch', 'POST', ['id_kelas' => App\Models\Kelas::first()->id_kelas]);
    $response = $controller->fetchClassData($request);
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR:\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
