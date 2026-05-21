<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MataPelajaran;
use App\Models\Kelas;
use App\Models\JadwalMengajar;
use Illuminate\Support\Facades\DB;

class MonitoringMateriController extends Controller
{
    public function index(Request $request)
    {
        $tingkatFilter = $request->input('tingkat');
        $mapelFilter = $request->input('id_mapel');

        // Total target materi per mata pelajaran
        $targetMateri = DB::table('tbl_rencana_materi')
            ->select('id_mapel', DB::raw('count(*) as total_materi'))
            ->whereNull('deleted_at')
            ->groupBy('id_mapel')
            ->pluck('total_materi', 'id_mapel');

        // Ambil data Jadwal yang menghubungkan kelas, mapel, dan guru, lalu hitung jurnal dengan materi
        $jadwalQuery = JadwalMengajar::with(['kelas', 'mataPelajaran', 'guru'])
            ->withCount(['jurnalMengajar as materi_selesai_count' => function ($query) {
                $query->whereNotNull('id_rencana_materi')
                      ->where('status_mengajar', 'Mengajar');
            }])
            ->when($tingkatFilter, function ($q, $tingkat) {
                $q->whereHas('kelas', function ($qKelas) use ($tingkat) {
                    $qKelas->where('tingkat', $tingkat);
                });
            })
            ->when($mapelFilter, function ($q, $mapel) {
                $q->where('id_mapel', $mapel);
            })
            ->get();

        $monitoringData = $jadwalQuery->map(function ($jadwal) use ($targetMateri) {
            $totalTarget = $targetMateri[$jadwal->id_mapel] ?? 0;
            $selesai = $jadwal->materi_selesai_count;
            $persentase = $totalTarget > 0 ? round(($selesai / $totalTarget) * 100) : 0;

            return [
                'id_jadwal' => $jadwal->id_jadwal,
                'kelas' => $jadwal->kelas ? ($jadwal->kelas->tingkat . ' ' . $jadwal->kelas->jurusan) : 'Kelas Dihapus',
                'mapel' => $jadwal->mataPelajaran ? $jadwal->mataPelajaran->nama_mapel : 'Mapel Dihapus',
                'guru' => $jadwal->guru ? $jadwal->guru->nama_lengkap : 'Tidak Ada Guru',
                'total_target' => $totalTarget,
                'materi_selesai' => $selesai,
                'persentase' => $persentase > 100 ? 100 : $persentase,
            ];
        });

        $mapels = MataPelajaran::orderBy('nama_mapel')->get();

        return Inertia::render('admin/MonitoringAkademik/Materi', [
            'monitoringData' => $monitoringData,
            'mapels' => $mapels,
            'filters' => $request->only(['tingkat', 'id_mapel']),
        ]);
    }
}
