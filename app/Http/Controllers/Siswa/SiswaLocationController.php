<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\SiswaLiveLocation;
use Illuminate\Support\Facades\Log;

class SiswaLocationController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric|min:0',
            'distance_to_school' => 'nullable|numeric|min:0',
            'network_meta' => 'nullable|string',
            'location_meta' => 'nullable|string',
        ]);

        $user = $request->user();

        // Cari siswa berdasarkan id_pengguna yang sedang login
        $siswa = Siswa::where('id_pengguna', $user->id_pengguna ?? $user->getKey())->first();

        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        $networkMeta = null;
        if ($request->filled('network_meta')) {
            $networkMeta = json_decode($request->network_meta, true);
        }

        $locationMeta = null;
        if ($request->filled('location_meta')) {
            $locationMeta = json_decode($request->location_meta, true);
        }

        SiswaLiveLocation::updateOrCreate(
            ['id_siswa' => $siswa->id_siswa],
            [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'accuracy' => $request->accuracy,
                'distance_meters' => $request->distance_to_school,
                'status' => 'online',
                'is_online' => true,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'network_meta' => $networkMeta,
                'location_meta' => $locationMeta,
                'last_seen_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Lokasi realtime diperbarui',
            'server_time' => now()->toIso8601String()
        ]);
    }
}
