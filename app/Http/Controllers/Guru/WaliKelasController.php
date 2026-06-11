<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\JadwalMengajar;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WaliKelasController extends Controller
{
    /**
     * Menampilkan daftar kelas yang diwalikan oleh guru login
     */
    public function index(Request $request)
    {
        $guru = Auth::user()->guru;
        if (!$guru) abort(403, 'Akses Ditolak.');

        $kelasPerwalian = Kelas::where('id_wali_kelas', $guru->id_guru)
            ->withCount('siswa')
            ->get();

        return Inertia::render('Guru/WaliKelas/Index', [
            'kelasPerwalian' => $kelasPerwalian
        ]);
    }

    /**
     * Menampilkan daftar mata pelajaran yang ada di kelas perwalian tersebut
     */
    public function show(Request $request, $id_kelas)
    {
        $guru = Auth::user()->guru;
        
        $kelas = Kelas::where('id_kelas', $id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->withCount('siswa')
            ->firstOrFail();

        // Ambil semua mata pelajaran yang diajarkan di kelas ini (dari JadwalMengajar)
        // Group by id_mapel agar unik
        $jadwalMengajars = JadwalMengajar::where('id_kelas', $id_kelas)
            ->with('mataPelajaran', 'guru')
            ->get();

        $mapels = [];
        foreach ($jadwalMengajars as $j) {
            if ($j->mataPelajaran && !isset($mapels[$j->id_mapel])) {
                $mapels[$j->id_mapel] = [
                    'id_mapel'      => $j->id_mapel,
                    'nama_mapel'    => $j->mataPelajaran->nama_mapel,
                    'kkm'           => $j->mataPelajaran->kkm,
                    'kategori'      => $j->mataPelajaran->kategori,
                    'guru_pengampu' => $j->guru->nama_lengkap ?? 'Belum diatur'
                ];
            }
        }

        // Sort by nama mapel
        $mapelList = array_values($mapels);
        usort($mapelList, function($a, $b) {
            return strcmp($a['nama_mapel'], $b['nama_mapel']);
        });

        return Inertia::render('Guru/WaliKelas/Show', [
            'kelas' => [
                'id_kelas' => $kelas->id_kelas,
                'nama_kelas' => trim($kelas->tingkat . ' ' . $kelas->jurusan),
                'tingkat' => $kelas->tingkat,
                'jurusan' => $kelas->jurusan,
                'siswa_count' => $kelas->siswa_count
            ],
            'mapelList' => $mapelList
        ]);
    }
}
