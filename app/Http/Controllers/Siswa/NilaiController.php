<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\PenilaianMapel;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class NilaiController extends Controller
{
    /**
     * Menampilkan daftar nilai siswa.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $siswa = $user->siswa;

        if (!$siswa) {
            Auth::logout();
            $request->session()->invalidate();
            return redirect('/login/siswa')->with('error', 'Akun tidak terhubung dengan data siswa.');
        }

        // Ambil list tahun ajaran untuk dropdown
        $tahunAjarans = TahunAjaran::orderByDesc('status')
            ->orderBy('tahun_ajaran')
            ->get();

        // Cari tahun ajaran aktif
        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first() 
            ?? TahunAjaran::orderByDesc('status')->first();

        // Get filter values from request, default to active year & semester
        $selectedTahunAjaranId = $request->input('id_tahun_ajaran', $tahunAjaranAktif?->id_tahun_ajaran);
        $selectedSemester = $request->input('semester', $tahunAjaranAktif?->semester ?? 'Ganjil');

        // Fetch grades for the student with relation to component names
        $penilaian = PenilaianMapel::where('id_siswa', $siswa->id_siswa)
            ->where('id_tahun_ajaran', $selectedTahunAjaranId)
            ->where('semester', $selectedSemester)
            ->with(['mapel', 'details.komponenPenilaian', 'remedials'])
            ->get();

        // Ambil pengaturan sistem untuk mengetahui status kunci global
        $pengaturan = \App\Models\Pengaturan::first();
        $isKunciJurnalGlobal = $pengaturan ? (bool)$pengaturan->is_kunci_jurnal : false;

        // Calculate some simple overview stats for student
        $totalMapel = $penilaian->count();
        $mapelTuntas = $penilaian->where('tuntas', true)->count();
        $mapelTidakTuntas = $totalMapel - $mapelTuntas;
        
        $nilaiAkhirCollection = $penilaian->pluck('nilai_akhir')->filter(fn($val) => !is_null($val));
        $rataRata = $nilaiAkhirCollection->count() > 0 ? round($nilaiAkhirCollection->average(), 2) : 0;

        return Inertia::render('Siswa/Nilai/Index', [
            'siswa' => $siswa->load('kelas'),
            'penilaian' => $penilaian,
            'tahunAjarans' => $tahunAjarans,
            'selectedTahunAjaranId' => $selectedTahunAjaranId,
            'selectedSemester' => $selectedSemester,
            'isKunciJurnalGlobal' => $isKunciJurnalGlobal,
            'stats' => [
                'total_mapel' => $totalMapel,
                'mapel_tuntas' => $mapelTuntas,
                'mapel_tidak_tuntas' => $mapelTidakTuntas,
                'rata_rata' => $rataRata,
            ]
        ]);
    }
}
