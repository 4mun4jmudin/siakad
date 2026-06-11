<?php

namespace App\Http\Controllers\OrangTua;

use App\Http\Controllers\Controller;
use App\Models\PenilaianMapel;
use App\Models\TahunAjaran;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NilaiController extends Controller
{
    /**
     * Menampilkan daftar nilai anak (siswa aktif) untuk orang tua.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $orangTua = $user->orangTuaWali;

        $activeId = session('active_id_siswa');

        if (!$orangTua || !$activeId) {
            return Inertia::render('OrangTua/Nilai/Index', [
                'siswa' => null,
                'penilaian' => [],
                'tahunAjarans' => [],
                'selectedTahunAjaranId' => null,
                'selectedSemester' => 'Ganjil',
                'isKunciGlobal' => false,
                'stats' => [
                    'total_mapel' => 0,
                    'mapel_tuntas' => 0,
                    'mapel_tidak_tuntas' => 0,
                    'rata_rata' => 0,
                ],
            ]);
        }

        // Verifikasi bahwa siswa memang anak dari orang tua ini
        $siswa = $orangTua->siswas()->with('kelas')->where('tbl_siswa.id_siswa', $activeId)->first();

        if (!$siswa) {
            return Inertia::render('OrangTua/Nilai/Index', [
                'siswa' => null,
                'penilaian' => [],
                'tahunAjarans' => [],
                'selectedTahunAjaranId' => null,
                'selectedSemester' => 'Ganjil',
                'isKunciGlobal' => false,
                'stats' => [
                    'total_mapel' => 0,
                    'mapel_tuntas' => 0,
                    'mapel_tidak_tuntas' => 0,
                    'rata_rata' => 0,
                ],
            ]);
        }

        // Ambil list tahun ajaran
        $tahunAjarans = TahunAjaran::orderByDesc('status')
            ->orderBy('tahun_ajaran')
            ->get();

        // Cari tahun ajaran aktif
        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first()
            ?? TahunAjaran::orderByDesc('status')->first();

        // Filter dari request
        $selectedTahunAjaranId = $request->input('id_tahun_ajaran', $tahunAjaranAktif?->id_tahun_ajaran);
        $selectedSemester = $request->input('semester', $tahunAjaranAktif?->semester ?? 'Ganjil');

        // Fetch grades
        $penilaian = PenilaianMapel::where('id_siswa', $siswa->id_siswa)
            ->where('id_tahun_ajaran', $selectedTahunAjaranId)
            ->where('semester', $selectedSemester)
            ->with(['mapel', 'details.komponenPenilaian', 'remedials'])
            ->get();

        // Status kunci global
        $pengaturan = Pengaturan::first();
        $isKunciGlobal = $pengaturan ? (bool)$pengaturan->is_kunci_jurnal : false;

        // Statistik
        $totalMapel = $penilaian->count();
        $mapelTuntas = $penilaian->where('tuntas', true)->count();
        $mapelTidakTuntas = $totalMapel - $mapelTuntas;

        $nilaiAkhirCollection = $penilaian->pluck('nilai_akhir')->filter(fn($val) => !is_null($val));
        $rataRata = $nilaiAkhirCollection->count() > 0 ? round($nilaiAkhirCollection->average(), 2) : 0;

        return Inertia::render('OrangTua/Nilai/Index', [
            'siswa' => $siswa,
            'penilaian' => $penilaian,
            'tahunAjarans' => $tahunAjarans,
            'selectedTahunAjaranId' => $selectedTahunAjaranId,
            'selectedSemester' => $selectedSemester,
            'isKunciGlobal' => $isKunciGlobal,
            'stats' => [
                'total_mapel' => $totalMapel,
                'mapel_tuntas' => $mapelTuntas,
                'mapel_tidak_tuntas' => $mapelTidakTuntas,
                'rata_rata' => $rataRata,
            ],
        ]);
    }
}
