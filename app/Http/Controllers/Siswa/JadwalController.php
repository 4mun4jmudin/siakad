<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\JadwalMengajar;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class JadwalController extends Controller
{
    /**
     * Menampilkan jadwal pelajaran siswa.
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

        // Cari tahun ajaran aktif
        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first() 
            ?? TahunAjaran::orderByDesc('status')->first();

        $query = JadwalMengajar::where('id_kelas', $siswa->id_kelas);

        if ($tahunAjaranAktif) {
            $query->where('id_tahun_ajaran', $tahunAjaranAktif->id_tahun_ajaran);
        }

        $jadwal = $query->with(['mapel', 'guru'])
            ->orderBy('jam_mulai', 'asc')
            ->get()
            ->groupBy('hari');

        return Inertia::render('Siswa/Jadwal/Index', [
            'siswa' => $siswa->load('kelas'),
            'jadwalPelajaran' => $jadwal,
            'tahunAjaranAktif' => $tahunAjaranAktif,
        ]);
    }
}
