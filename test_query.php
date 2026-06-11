<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$result = DB::select("SELECT '09:30:00' < '09:30' as result1, '08:00:00' > '08:00' as result2, '09:30:00' < '09:30:00' as result3");
echo json_encode($result, JSON_PRETTY_PRINT);
