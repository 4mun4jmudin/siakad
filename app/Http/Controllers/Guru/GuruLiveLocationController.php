<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SiswaLiveLocation;
use Carbon\Carbon;

class GuruLiveLocationController extends Controller
{
    public function page()
    {
        $sekolah = \App\Models\Pengaturan::first();
        return Inertia::render('Guru/LiveLocation/Siswa', [
            'sekolah' => $sekolah
        ]);
    }

    public function index()
    {
        // Currently mimicking AdminLiveLocationController: shows ALL students.
        $locations = SiswaLiveLocation::from('tbl_siswa_live_locations as live')
            ->join('tbl_siswa as siswa', 'siswa.id_siswa', '=', 'live.id_siswa')
            ->leftJoin('tbl_kelas as kelas', 'kelas.id_kelas', '=', 'siswa.id_kelas')
            ->select(
                'live.id_siswa',
                'siswa.nama_lengkap',
                'siswa.nis',
                'kelas.tingkat',
                'kelas.jurusan',
                'live.latitude',
                'live.longitude',
                'live.accuracy',
                'live.distance_meters',
                'live.status',
                'live.is_online',
                'live.network_meta',
                'live.last_seen_at',
                'live.updated_at'
            )
            ->get();

        $now = now();
        $formattedData = [];

        foreach ($locations as $loc) {
            $lastSeen = Carbon::parse($loc->last_seen_at);
            $secondsAgo = $lastSeen->diffInSeconds($now);

            $calculatedStatus = 'offline';
            if ($secondsAgo <= 30) {
                $calculatedStatus = 'online';
            } elseif ($secondsAgo <= 120) {
                $calculatedStatus = 'idle';
            }

            $formattedData[] = [
                'id_siswa' => $loc->id_siswa,
                'nama_lengkap' => $loc->nama_lengkap,
                'nis' => $loc->nis,
                'kelas' => trim(($loc->tingkat ?? '') . ' ' . ($loc->jurusan ?? '')),
                'latitude' => (float) $loc->latitude,
                'longitude' => (float) $loc->longitude,
                'accuracy' => $loc->accuracy,
                'distance_meters' => $loc->distance_meters,
                'status' => $calculatedStatus,
                'is_online' => $calculatedStatus !== 'offline',
                'network_meta' => is_string($loc->network_meta) ? json_decode($loc->network_meta, true) : $loc->network_meta,
                'last_seen_at' => $loc->last_seen_at,
                'seconds_ago' => $secondsAgo,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'server_time' => now()->toIso8601String()
        ]);
    }
}
