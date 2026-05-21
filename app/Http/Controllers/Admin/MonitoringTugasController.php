<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MataPelajaran;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use Illuminate\Support\Facades\DB;

class MonitoringTugasController extends Controller
{
    public function index(Request $request)
    {
        $tingkatFilter = $request->input('tingkat');
        $mapelFilter = $request->input('id_mapel');

        // Fetch Tugas with relations to avoid N+1 issues
        $tugasQuery = Tugas::with([
            'jadwalMengajar.kelas.siswa',
            'jadwalMengajar.mataPelajaran',
            'jadwalMengajar.guru',
            'pengumpulan'
        ])
        ->when($tingkatFilter, function ($query, $tingkat) {
            $query->whereHas('jadwalMengajar.kelas', function ($q) use ($tingkat) {
                $q->where('tingkat', $tingkat);
            });
        })
        ->when($mapelFilter, function ($query, $mapel) {
            $query->whereHas('jadwalMengajar', function ($q) use ($mapel) {
                $q->where('id_mapel', $mapel);
            });
        })
        ->orderBy('created_at', 'desc')
        ->get();

        $monitoringData = $tugasQuery->map(function ($tugas) {
            $jadwal = $tugas->jadwalMengajar;
            $kelas = $jadwal ? $jadwal->kelas : null;
            $mapel = $jadwal ? $jadwal->mataPelajaran : null;
            $guru = $jadwal ? $jadwal->guru : null;

            $totalSiswa = $kelas ? $kelas->siswa->count() : 0;
            $submittedCount = $tugas->pengumpulan->count();
            $persentase = $totalSiswa > 0 ? round(($submittedCount / $totalSiswa) * 100) : 0;

            // Hitung rata-rata nilai tugas jika sudah ada yang dinilai
            $gradedSubmissions = $tugas->pengumpulan->whereNotNull('nilai');
            $averageScore = $gradedSubmissions->count() > 0 ? round($gradedSubmissions->avg('nilai'), 1) : null;

            // Cek status berdasarkan tenggat waktu
            $isDeadlinePassed = $tugas->tenggat_waktu && $tugas->tenggat_waktu->isPast();
            $calculatedStatus = $isDeadlinePassed ? 'Ditutup' : $tugas->status;

            return [
                'id_tugas' => $tugas->id_tugas,
                'judul_tugas' => $tugas->judul_tugas,
                'deskripsi_tugas' => $tugas->deskripsi_tugas,
                'tenggat_waktu' => $tugas->tenggat_waktu ? $tugas->tenggat_waktu->toIso8601String() : null,
                'status' => $calculatedStatus,
                'kelas' => $kelas ? ($kelas->tingkat . ' ' . $kelas->jurusan) : 'Kelas Dihapus',
                'mapel' => $mapel ? $mapel->nama_mapel : 'Mapel Dihapus',
                'guru' => $guru ? $guru->nama_lengkap : 'Tidak Ada Guru',
                'total_siswa' => $totalSiswa,
                'siswa_mengumpulkan' => $submittedCount,
                'persentase' => $persentase > 100 ? 100 : $persentase,
                'rata_rata_nilai' => $averageScore,
            ];
        });

        $mapels = MataPelajaran::orderBy('nama_mapel')->get();

        return Inertia::render('admin/MonitoringAkademik/Tugas', [
            'monitoringData' => $monitoringData,
            'mapels' => $mapels,
            'filters' => $request->only(['tingkat', 'id_mapel']),
        ]);
    }
}
