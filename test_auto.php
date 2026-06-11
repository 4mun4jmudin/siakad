<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
    $controller = app()->make('App\Http\Controllers\Admin\JadwalInteractiveController');
    $response = $controller->autoSchedule(request());
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR:\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
