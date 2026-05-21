<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RencanaMateri;
use App\Models\JurnalMengajar;
use Illuminate\Support\Facades\Auth;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswa;
        
        if (!$siswa || !$siswa->kelas) {
            return Inertia::render('Siswa/Materi/Index', [
                'materiList' => [],
                'stats' => [
                    'total' => 0,
                    'tuntas' => 0,
                    'persentase' => 0,
                ],
                'subjects' => [],
                'error' => 'Anda belum terdaftar di kelas manapun.'
            ]);
        }

        $materi = RencanaMateri::where('tingkat_kelas', $siswa->kelas->tingkat)
            ->with(['mataPelajaran'])
            ->orderBy('pertemuan_ke', 'asc')
            ->get();

        $taughtMateriIds = JurnalMengajar::where('status_mengajar', 'Mengajar')
            ->whereHas('jadwalMengajar', function ($q) use ($siswa) {
                $q->where('id_kelas', $siswa->id_kelas);
            })
            ->whereNotNull('id_rencana_materi')
            ->pluck('id_rencana_materi')
            ->toArray();

        $materiList = $materi->map(function ($item) use ($taughtMateriIds) {
            return [
                'id_rencana' => $item->id_rencana,
                'id_mapel' => $item->id_mapel,
                'nama_mapel' => $item->mataPelajaran->nama_mapel ?? 'Umum',
                'judul_materi' => $item->judul_materi,
                'deskripsi' => $item->deskripsi,
                'pertemuan_ke' => $item->pertemuan_ke,
                'is_tuntas' => in_array($item->id_rencana, $taughtMateriIds),
            ];
        });

        $total = $materiList->count();
        $tuntas = $materiList->where('is_tuntas', true)->count();
        $persentase = $total > 0 ? round(($tuntas / $total) * 100) : 0;

        $subjects = $materiList->pluck('nama_mapel')->unique()->values()->toArray();

        return Inertia::render('Siswa/Materi/Index', [
            'materiList' => $materiList,
            'stats' => [
                'total' => $total,
                'tuntas' => $tuntas,
                'persentase' => $persentase,
            ],
            'subjects' => $subjects,
        ]);
    }
}
