<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);
$guru = \App\Models\Guru::whereNotNull('foto_profil')->first();
echo "Guru with photo: " . ($guru ? $guru->foto_profil : 'None') . "\n";
