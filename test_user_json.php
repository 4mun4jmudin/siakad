<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);
$user = \App\Models\User::where('level', 'Guru')->whereHas('guru', function($q) {
    $q->whereNotNull('foto_profil');
})->first();
if ($user) {
    $user->load('guru:id_pengguna,foto_profil');
    $user->foto_profil = $user->guru?->foto_profil;
    echo "USER JSON: " . json_encode($user) . "\n";
} else {
    echo "No user with guru foto found.\n";
}
