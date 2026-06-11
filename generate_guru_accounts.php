<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Guru;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$gurusWithoutAccount = Guru::whereNull('id_pengguna')->get();
$count = 0;

foreach ($gurusWithoutAccount as $guru) {
    DB::transaction(function () use ($guru, &$count) {
        $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $guru->nama_lengkap));
        $baseUsername = 'guru#' . $cleanName;
        
        $username = $baseUsername;
        if (User::where('username', $username)->exists()) {
            $username = $baseUsername . Str::lower(Str::random(3));
        }

        $user = User::create([
            'nama_lengkap' => $guru->nama_lengkap,
            'username'     => $username,
            'password'     => Hash::make('alhawari#cibiuk'), // Default Password
            'level'        => 'Guru',
        ]);

        $guru->update([
            'id_pengguna' => $user->id_pengguna
        ]);
        $count++;
    });
}

echo "Berhasil membuat akun login untuk $count guru.\n";
