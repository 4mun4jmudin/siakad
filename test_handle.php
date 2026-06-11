<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = App\Models\User::where('level', 'Guru')->first();
$user->load('guru:id_pengguna,foto_profil');
$user->foto_profil = $user->guru?->foto_profil;

echo json_encode($user);
