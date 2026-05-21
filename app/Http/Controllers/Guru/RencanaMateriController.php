<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RencanaMateri;
use App\Models\MataPelajaran;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RencanaMateriController extends Controller
{
    public function index()
    {
        $guru = Auth::user()->guru;
        
        // Ambil mapel yang diajar oleh guru ini
        $mapels = MataPelajaran::whereIn('id_mapel', function ($query) use ($guru) {
            $query->select('id_mapel')
                  ->from('tbl_jadwal_mengajar')
                  ->where('id_guru', $guru->id_guru);
        })->get();
        
        $idMapels = $mapels->pluck('id_mapel')->toArray();

        // Ambil rencana materi untuk mapel-mapel tersebut
        $rencanaMateri = RencanaMateri::with('mataPelajaran')
            ->whereIn('id_mapel', $idMapels)
            ->orderBy('id_mapel')
            ->orderBy('pertemuan_ke')
            ->get();

        return Inertia::render('Guru/RencanaMateri/Index', [
            'rencanaMateri' => $rencanaMateri,
            'mapels' => $mapels,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_mapel' => 'required|string|exists:tbl_mata_pelajaran,id_mapel',
            'tingkat_kelas' => 'nullable|string|max:10',
            'judul_materi' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'pertemuan_ke' => 'nullable|integer|min:1',
        ]);

        RencanaMateri::create($request->all());

        return redirect()->back()->with('success', 'Rencana materi berhasil ditambahkan.');
    }

    public function update(Request $request, RencanaMateri $rencanaMateri)
    {
        $request->validate([
            'judul_materi' => 'required|string|max:150',
            'tingkat_kelas' => 'nullable|string|max:10',
            'deskripsi' => 'nullable|string',
            'pertemuan_ke' => 'nullable|integer|min:1',
        ]);

        $rencanaMateri->update($request->only([
            'judul_materi', 'tingkat_kelas', 'deskripsi', 'pertemuan_ke'
        ]));

        return redirect()->back()->with('success', 'Rencana materi berhasil diperbarui.');
    }

    public function destroy(RencanaMateri $rencanaMateri)
    {
        $rencanaMateri->delete();

        return redirect()->back()->with('success', 'Rencana materi berhasil dihapus.');
    }
}
